import sharp from 'sharp'

import { aHsv } from './color'

/** Cantidad de cubetas por eje al agrupar colores parecidos. */
const CUBETAS = { tono: 24, saturacion: 6, valor: 10 } as const

const COLORES_A_MOSTRAR = 14

interface Cubeta {
  readonly pixeles: number
  readonly tono: number
  readonly saturacion: number
  readonly valor: number
  readonly muestra: readonly [number, number, number]
}

const claveDeCubeta = (tono: number, saturacion: number, valor: number): string =>
  [
    Math.floor((tono / 360) * CUBETAS.tono),
    Math.floor(saturacion * CUBETAS.saturacion),
    Math.floor(valor * CUBETAS.valor),
  ].join('/')

/**
 * Agrupa los colores de la imagen en cubetas HSV y devuelve las mas pobladas.
 *
 * Sirve para elegir los umbrales de `VERDE_LOTE` con datos concretos: el relleno
 * de las parcelas y las lineas divisorias comparten el tono, y lo que las separa
 * es el valor (la luminosidad). Este informe muestra exactamente donde cortar.
 */
export const analizarColores = async (rutaImagen: string): Promise<readonly Cubeta[]> => {
  const { data, info } = await sharp(rutaImagen)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const cubetas = new Map<string, { pixeles: number; r: number; g: number; b: number }>()
  const canales = info.channels

  for (let indice = 0; indice < info.width * info.height; indice += 1) {
    const base = indice * canales

    if (canales === 4 && data[base + 3] < 128) continue

    const [r, g, b] = [data[base], data[base + 1], data[base + 2]]
    const { tono, saturacion, valor } = aHsv(r, g, b)
    const clave = claveDeCubeta(tono, saturacion, valor)
    const actual = cubetas.get(clave)

    if (!actual) {
      cubetas.set(clave, { pixeles: 1, r, g, b })
      continue
    }

    actual.pixeles += 1
  }

  return [...cubetas.values()]
    .sort((a, b) => b.pixeles - a.pixeles)
    .slice(0, COLORES_A_MOSTRAR)
    .map(({ pixeles, r, g, b }) => {
      const { tono, saturacion, valor } = aHsv(r, g, b)

      return { pixeles, tono, saturacion, valor, muestra: [r, g, b] as const }
    })
}

const aHex = ([r, g, b]: readonly [number, number, number]): string =>
  `#${[r, g, b].map((canal) => canal.toString(16).padStart(2, '0')).join('')}`

export const formatearInforme = (cubetas: readonly Cubeta[]): string => {
  const filas = cubetas.map(
    ({ pixeles, tono, saturacion, valor, muestra }) =>
      `  ${aHex(muestra).padEnd(9)} tono ${tono.toFixed(0).padStart(3)}°  ` +
      `sat ${saturacion.toFixed(2)}  valor ${valor.toFixed(2)}  ` +
      `${pixeles.toLocaleString('es-AR').padStart(9)} px`,
  )

  return [
    'Colores dominantes (ordenados por cantidad de pixeles):',
    ...filas,
    '',
    'Para VERDE_LOTE: quedate con el color del relleno de las parcelas y dejá',
    'afuera el de las lineas divisorias. Suelen compartir el tono, asi que el',
    'corte va por "valor": poné valorMin justo arriba del valor de las lineas.',
  ].join('\n')
}
