import type { PuntoPlano } from '@/lib/plano/tipos'

import { leerParDeEtiquetas } from './adyacencias'
import type { Componente } from './etiquetado'
import { agruparEnFilas, calcularEjes, proyectar } from './geometria2d'

interface UnionFind {
  readonly buscar: (indice: number) => number
  readonly unir: (a: number, b: number) => void
}

const crearUnionFind = (cantidad: number): UnionFind => {
  const padres = Array.from({ length: cantidad }, (_, indice) => indice)

  const buscar = (indice: number): number => {
    let raiz = indice
    while (padres[raiz] !== raiz) raiz = padres[raiz]

    // Compresion de caminos.
    let actual = indice
    while (padres[actual] !== raiz) {
      const siguiente = padres[actual]
      padres[actual] = raiz
      actual = siguiente
    }

    return raiz
  }

  return {
    buscar,
    unir: (a, b) => {
      const raizA = buscar(a)
      const raizB = buscar(b)
      if (raizA !== raizB) padres[raizB] = raizA
    },
  }
}

/** Une en manzanas las parcelas que la deteccion de adyacencias marco como vecinas. */
const agruparPorAdyacencia = (
  componentes: readonly Componente[],
  adyacentes: ReadonlySet<string>,
): readonly (readonly Componente[])[] => {
  const conjuntos = crearUnionFind(componentes.length)
  const indicePorEtiqueta = new Map(
    componentes.map((componente, indice) => [componente.etiqueta, indice]),
  )

  for (const par of adyacentes) {
    const [etiquetaA, etiquetaB] = leerParDeEtiquetas(par)
    const indiceA = indicePorEtiqueta.get(etiquetaA)
    const indiceB = indicePorEtiqueta.get(etiquetaB)

    // Alguna de las dos pudo quedar fuera por el filtro de area.
    if (indiceA === undefined || indiceB === undefined) continue

    conjuntos.unir(indiceA, indiceB)
  }

  const grupos = new Map<number, Componente[]>()

  componentes.forEach((componente, indice) => {
    const raiz = conjuntos.buscar(indice)
    const grupo = grupos.get(raiz)

    if (grupo) {
      grupo.push(componente)
      return
    }

    grupos.set(raiz, [componente])
  })

  return [...grupos.values()]
}

const ladoTipico = (componentes: readonly Componente[]): number => {
  const lados = componentes
    .map((componente) =>
      Math.min(componente.maxX - componente.minX, componente.maxY - componente.minY),
    )
    .sort((a, b) => a - b)

  return lados[Math.floor(lados.length / 2)] || 1
}

/** Ordena los lotes de una manzana siguiendo su orientacion real (filas y columnas). */
const ordenarDentroDeManzana = (componentes: readonly Componente[]): readonly Componente[] => {
  if (componentes.length < 2) return componentes

  const centroides = componentes.map((componente) => componente.centroide)
  const { centro, principal, secundario } = calcularEjes(centroides)
  const toleranciaFila = ladoTipico(componentes) * 0.7

  const filas = agruparEnFilas(
    componentes,
    (componente) => proyectar(componente.centroide, centro, secundario),
    toleranciaFila,
  )

  return filas.flatMap((fila) =>
    [...fila].sort(
      (a, b) =>
        proyectar(a.centroide, centro, principal) - proyectar(b.centroide, centro, principal),
    ),
  )
}

const centroideDeGrupo = (grupo: readonly Componente[]): PuntoPlano => [
  grupo.reduce((suma, componente) => suma + componente.centroide[0], 0) / grupo.length,
  grupo.reduce((suma, componente) => suma + componente.centroide[1], 0) / grupo.length,
]

/** Ordena las manzanas en orden de lectura: de arriba hacia abajo, de izquierda a derecha. */
const ordenarManzanas = (
  grupos: readonly (readonly Componente[])[],
): readonly (readonly Componente[])[] => {
  const conCentroide = grupos.map((grupo) => ({ grupo, centroide: centroideDeGrupo(grupo) }))
  const alturaTipica = Math.max(
    ...grupos.map((grupo) => Math.max(...grupo.map((c) => c.maxY - c.minY))),
  )

  const filas = agruparEnFilas(conCentroide, (item) => item.centroide[1], alturaTipica * 1.5)

  return filas.flatMap((fila) =>
    [...fila]
      .sort((a, b) => a.centroide[0] - b.centroide[0])
      .map((item) => item.grupo),
  )
}

/**
 * Devuelve las parcelas en orden de recorrido del loteo, listas para numerar de
 * 1 en adelante.
 *
 * La numeracion final es corrida y no usa manzanas, pero el agrupado por
 * manzana se sigue haciendo *para ordenar*: recorre manzana por manzana en
 * orden de lectura y, dentro de cada una, sigue sus filas y columnas reales.
 * Asi los numeros consecutivos caen en parcelas vecinas en vez de saltar por
 * todo el plano.
 *
 * El resultado es determinista: la misma imagen produce siempre el mismo orden.
 */
export const ordenarParcelas = (
  componentes: readonly Componente[],
  adyacentes: ReadonlySet<string>,
): readonly Componente[] =>
  ordenarManzanas(agruparPorAdyacencia(componentes, adyacentes)).flatMap((grupo) =>
    ordenarDentroDeManzana(grupo),
  )
