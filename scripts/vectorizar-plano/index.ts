import type {
  LoteGeometria,
  PlanoGeometria,
  PuntoPlano,
  RectanguloPlano,
} from '@/lib/plano/tipos'

import { detectarAdyacencias } from './adyacencias'
import { leerArgumentos } from './argumentos'
import { CONTORNO, FILTRO_COMPONENTE, MANZANAS, MORFOLOGIA } from './config'
import { trazarContorno } from './contorno'
import { analizarColores, formatearInforme } from './diagnostico'
import { calcularMetrosPorPixel, superficieEnM2 } from './escala'
import { expandirEtiquetas, etiquetarComponentes, type Componente, type Etiquetado } from './etiquetado'
import { convexidad } from './forma'
import { resolverIdentidad, verificarIdsUnicos } from './identidad'
import { ordenarParcelas } from './manzanas'
import { construirMascara } from './mascara'
import { erosionar } from './morfologia'
import { leerNumeracionOficial, type NumeroOficial } from './numeracionOficial'
import { escribirGeometria, escribirPrevisualizacion } from './salida'
import { simplificarContorno } from './simplificar'

const reportar = (mensaje: string): void => {
  process.stdout.write(`${mensaje}\n`)
}

const dentroDelRangoDeArea = (componente: Componente): boolean =>
  componente.areaPx >= FILTRO_COMPONENTE.areaMinimaPx &&
  componente.areaPx <= FILTRO_COMPONENTE.areaMaximaPx

interface ComponenteConContorno {
  readonly componente: Componente
  readonly puntos: readonly PuntoPlano[]
}

interface ParcelaNumerada extends ComponenteConContorno {
  readonly numero: number
}

/**
 * Traza y simplifica el contorno de cada mancha, y descarta las que no tienen
 * forma de parcela. Corre antes de ordenar para que la vegetacion no se lleve
 * numeros de lote.
 */
const contornearParcelas = (
  etiquetado: Etiquetado,
  componentes: readonly Componente[],
): readonly ComponenteConContorno[] =>
  componentes.flatMap<ComponenteConContorno>((componente) => {
    const contorno = trazarContorno(etiquetado, componente)
    if (!contorno) return []

    const puntos = simplificarContorno(contorno, CONTORNO.toleranciaSimplificacion)
    if (puntos.length < CONTORNO.verticesMinimos) return []

    if (convexidad(puntos) < FILTRO_COMPONENTE.convexidadMinima) return []

    return [{ componente, puntos }]
  })

/**
 * El id y el numero salen de `resolverIdentidad`: el numero es el de la
 * mensura, y el id se deriva de el. Ojo, esa edicion NO se propaga al reves: si
 * despues alguien renumera un lote desde el panel, el id no cambia, porque
 * renombrarlo dejaria huerfano al poligono de este mismo archivo.
 */
const construirLote = (
  parcela: ParcelaNumerada,
  metrosPorPixel: number,
  numeracion: ReadonlyMap<string, NumeroOficial>,
): LoteGeometria => ({
  ...resolverIdentidad(
    parcela.numero,
    superficieEnM2(parcela.componente.areaPx, metrosPorPixel),
    numeracion,
  ),
  puntos: parcela.puntos,
  centroide: [
    Math.round(parcela.componente.centroide[0] * 10) / 10,
    Math.round(parcela.componente.centroide[1] * 10) / 10,
  ],
  areaPx: parcela.componente.areaPx,
})

/** Rectangulo que abarca todas las parcelas detectadas. */
const calcularLimites = (parcelas: readonly ParcelaNumerada[]): RectanguloPlano => {
  const componentes = parcelas.map(({ componente }) => componente)

  const minX = Math.min(...componentes.map((c) => c.minX))
  const minY = Math.min(...componentes.map((c) => c.minY))
  const maxX = Math.max(...componentes.map((c) => c.maxX))
  const maxY = Math.max(...componentes.map((c) => c.maxY))

  return { x: minX, y: minY, ancho: maxX - minX, alto: maxY - minY }
}

const vectorizar = async (): Promise<void> => {
  const rutas = leerArgumentos(process.argv.slice(2))

  reportar(`Leyendo el plano desde ${rutas.imagen}`)

  if (rutas.soloDiagnostico) {
    reportar(formatearInforme(await analizarColores(rutas.imagen)))
    return
  }

  const mascara = await construirMascara(rutas.imagen)
  reportar(`Imagen de ${mascara.ancho}x${mascara.alto} px`)

  const pixelesDeLote = mascara.datos.reduce<number>((suma, valor) => suma + valor, 0)
  reportar(`Pixeles clasificados como parcela: ${pixelesDeLote}`)

  if (pixelesDeLote === 0) {
    throw new Error(
      'No se detecto ningun pixel verde de parcela. Ajustá los umbrales de VERDE_LOTE en scripts/vectorizar-plano/config.ts.',
    )
  }

  const separadas = erosionar(mascara, MORFOLOGIA.radioErosion)
  const etiquetado = expandirEtiquetas(etiquetarComponentes(separadas), mascara)

  const componentes = etiquetado.componentes.filter(dentroDelRangoDeArea)
  reportar(
    `Componentes detectadas: ${etiquetado.componentes.length} (${componentes.length} dentro del rango de area)`,
  )

  const contorneadas = contornearParcelas(etiquetado, componentes)
  const descartadas = componentes.length - contorneadas.length
  if (descartadas > 0) {
    reportar(`Descartadas ${descartadas} manchas sin forma de parcela (vegetación y ruido)`)
  }

  const puntosPorEtiqueta = new Map(
    contorneadas.map(({ componente, puntos }) => [componente.etiqueta, puntos]),
  )

  const adyacentes = detectarAdyacencias(etiquetado, MANZANAS.distanciaMaximaPx)

  // Numeracion corrida de 1 en adelante, siguiendo el recorrido del loteo.
  const conContorno = ordenarParcelas(
    contorneadas.map(({ componente }) => componente),
    adyacentes,
  ).map<ParcelaNumerada>((componente, indice) => ({
    componente,
    numero: indice + 1,
    puntos: puntosPorEtiqueta.get(componente.etiqueta) ?? [],
  }))

  const metrosPorPixel = calcularMetrosPorPixel(
    conContorno.map((parcela) => parcela.componente.areaPx),
  )

  // La numeracion de la mensura reemplaza a la posicional, y de ahi sale el id.
  // Si el archivo no esta, se sigue con la posicional y los ids igual coinciden
  // con el numero.
  const numeracion = await leerNumeracionOficial()
  const lotes = conContorno
    .map((parcela) => construirLote(parcela, metrosPorPixel, numeracion))
    .sort((a, b) => a.numero - b.numero)

  verificarIdsUnicos(lotes)

  const geometria: PlanoGeometria = {
    ancho: mascara.ancho,
    alto: mascara.alto,
    generadoEn: new Date().toISOString(),
    metrosPorPixel,
    limites: calcularLimites(conContorno),
    lotes,
  }

  await escribirGeometria(rutas.salida, geometria)
  await escribirPrevisualizacion(rutas.previsualizacion, geometria)

  const superficies = geometria.lotes.map((lote) => lote.superficieM2)

  reportar('')
  reportar(
    `Lotes: ${geometria.lotes.length} ` +
      (numeracion.size > 0
        ? `(${numeracion.size} con numeración oficial de la mensura)`
        : '(numeración posicional: falta prisma/datos/numeracion-oficial.json)'),
  )
  reportar(
    `Superficies: ${Math.min(...superficies)} a ${Math.max(...superficies)} m2 ` +
      `(escala estimada: ${metrosPorPixel.toFixed(4)} m/px)`,
  )
  reportar(`Geometria escrita en ${rutas.salida}`)
  reportar(`Previsualizacion en ${rutas.previsualizacion}`)
}

vectorizar().catch((error: unknown) => {
  process.stderr.write(
    `\nFallo la vectorizacion: ${error instanceof Error ? error.message : String(error)}\n`,
  )
  process.exitCode = 1
})
