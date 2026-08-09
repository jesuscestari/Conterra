import type { MascaraBinaria } from './mascara'

export interface Componente {
  readonly etiqueta: number
  readonly areaPx: number
  readonly minX: number
  readonly minY: number
  readonly maxX: number
  readonly maxY: number
  readonly centroide: readonly [number, number]
}

export interface Etiquetado {
  readonly ancho: number
  readonly alto: number
  /** 0 = fondo, >0 = numero de componente. Indexada como `y * ancho + x`. */
  readonly etiquetas: Int32Array
  readonly componentes: readonly Componente[]
}

const VECINOS_4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const

/** Componentes conexas por inundacion iterativa con vecindad 4. */
export const etiquetarComponentes = (mascara: MascaraBinaria): Etiquetado => {
  const { ancho, alto, datos } = mascara
  const etiquetas = new Int32Array(datos.length)
  const componentes: Componente[] = []
  const pila = new Int32Array(datos.length)

  let etiquetaActual = 0

  for (let semilla = 0; semilla < datos.length; semilla += 1) {
    if (datos[semilla] === 0 || etiquetas[semilla] !== 0) continue

    etiquetaActual += 1
    componentes.push(inundar({ ancho, alto, datos, etiquetas, pila, semilla, etiquetaActual }))
  }

  return { ancho, alto, etiquetas, componentes }
}

interface ParametrosInundacion {
  readonly ancho: number
  readonly alto: number
  readonly datos: Uint8Array
  readonly etiquetas: Int32Array
  readonly pila: Int32Array
  readonly semilla: number
  readonly etiquetaActual: number
}

const inundar = ({
  ancho,
  alto,
  datos,
  etiquetas,
  pila,
  semilla,
  etiquetaActual,
}: ParametrosInundacion): Componente => {
  let tope = 0
  pila[tope] = semilla
  tope += 1
  etiquetas[semilla] = etiquetaActual

  let areaPx = 0
  let sumaX = 0
  let sumaY = 0
  let minX = ancho
  let minY = alto
  let maxX = 0
  let maxY = 0

  while (tope > 0) {
    tope -= 1
    const indice = pila[tope]
    const x = indice % ancho
    const y = (indice - x) / ancho

    areaPx += 1
    sumaX += x
    sumaY += y
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y

    for (const [dx, dy] of VECINOS_4) {
      const vx = x + dx
      const vy = y + dy

      if (vx < 0 || vy < 0 || vx >= ancho || vy >= alto) continue

      const vecino = vy * ancho + vx
      if (datos[vecino] === 0 || etiquetas[vecino] !== 0) continue

      etiquetas[vecino] = etiquetaActual
      pila[tope] = vecino
      tope += 1
    }
  }

  return {
    etiqueta: etiquetaActual,
    areaPx,
    minX,
    minY,
    maxX,
    maxY,
    centroide: [sumaX / areaPx, sumaY / areaPx],
  }
}

/**
 * Devuelve las parcelas a su tamano real: parte de las etiquetas calculadas
 * sobre la mascara erosionada y las expande por anchura sobre la mascara
 * original, de modo que cada pixel verde queda asignado a la parcela mas
 * cercana. Los pixeles que ninguna etiqueta alcanza se descartan.
 */
export const expandirEtiquetas = (
  etiquetado: Etiquetado,
  mascaraOriginal: MascaraBinaria,
): Etiquetado => {
  const { ancho, alto } = mascaraOriginal
  const etiquetas = Int32Array.from(etiquetado.etiquetas)
  const original = mascaraOriginal.datos

  let frente: number[] = []
  for (let indice = 0; indice < etiquetas.length; indice += 1) {
    if (etiquetas[indice] !== 0) frente.push(indice)
  }

  while (frente.length > 0) {
    const siguiente: number[] = []

    for (const indice of frente) {
      const x = indice % ancho
      const y = (indice - x) / ancho
      const etiqueta = etiquetas[indice]

      for (const [dx, dy] of VECINOS_4) {
        const vx = x + dx
        const vy = y + dy

        if (vx < 0 || vy < 0 || vx >= ancho || vy >= alto) continue

        const vecino = vy * ancho + vx
        if (original[vecino] === 0 || etiquetas[vecino] !== 0) continue

        etiquetas[vecino] = etiqueta
        siguiente.push(vecino)
      }
    }

    frente = siguiente
  }

  return { ancho, alto, etiquetas, componentes: recalcularComponentes(etiquetas, ancho) }
}

const recalcularComponentes = (
  etiquetas: Int32Array,
  ancho: number,
): readonly Componente[] => {
  const acumulados = new Map<
    number,
    { areaPx: number; sumaX: number; sumaY: number; minX: number; minY: number; maxX: number; maxY: number }
  >()

  for (let indice = 0; indice < etiquetas.length; indice += 1) {
    const etiqueta = etiquetas[indice]
    if (etiqueta === 0) continue

    const x = indice % ancho
    const y = (indice - x) / ancho
    const actual = acumulados.get(etiqueta)

    if (!actual) {
      acumulados.set(etiqueta, {
        areaPx: 1,
        sumaX: x,
        sumaY: y,
        minX: x,
        minY: y,
        maxX: x,
        maxY: y,
      })
      continue
    }

    actual.areaPx += 1
    actual.sumaX += x
    actual.sumaY += y
    if (x < actual.minX) actual.minX = x
    if (y < actual.minY) actual.minY = y
    if (x > actual.maxX) actual.maxX = x
    if (y > actual.maxY) actual.maxY = y
  }

  return [...acumulados.entries()].map(([etiqueta, datos]) => ({
    etiqueta,
    areaPx: datos.areaPx,
    minX: datos.minX,
    minY: datos.minY,
    maxX: datos.maxX,
    maxY: datos.maxY,
    centroide: [datos.sumaX / datos.areaPx, datos.sumaY / datos.areaPx] as const,
  }))
}
