import type { Etiquetado } from './etiquetado'

const VECINOS_8 = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
] as const

/** Par de etiquetas vecinas, normalizado como `menor:mayor`. */
const clave = (a: number, b: number): string => (a < b ? `${a}:${b}` : `${b}:${a}`)

/**
 * Encuentra que parcelas estan a menos de `distanciaMaxima` pixeles entre si.
 *
 * Se resuelve con una expansion simultanea desde todas las parcelas sobre el
 * fondo (una especie de Voronoi acotado): cuando dos frentes distintos se
 * tocan, la suma de las distancias recorridas es la separacion real entre esas
 * dos parcelas. Es mucho mas fiable que comparar cajas contenedoras, porque el
 * plano esta rotado y las cajas de lotes vecinos se solapan entre si.
 */
export const detectarAdyacencias = (
  etiquetado: Etiquetado,
  distanciaMaxima: number,
): ReadonlySet<string> => {
  const { ancho, alto, etiquetas } = etiquetado
  const total = ancho * alto

  const duena = Int32Array.from(etiquetas)
  const distancia = new Int32Array(total).fill(-1)
  const adyacentes = new Set<string>()

  let frente: number[] = []

  for (let indice = 0; indice < total; indice += 1) {
    if (etiquetas[indice] !== 0) {
      distancia[indice] = 0
      frente.push(indice)
    }
  }

  const limite = Math.ceil(distanciaMaxima)

  for (let paso = 0; paso < limite && frente.length > 0; paso += 1) {
    const siguiente: number[] = []

    for (const indice of frente) {
      const x = indice % ancho
      const y = (indice - x) / ancho

      for (const [dx, dy] of VECINOS_8) {
        const vx = x + dx
        const vy = y + dy

        if (vx < 0 || vy < 0 || vx >= ancho || vy >= alto) continue

        const vecino = vy * ancho + vx

        if (distancia[vecino] === -1) {
          distancia[vecino] = paso + 1
          duena[vecino] = duena[indice]
          siguiente.push(vecino)
          continue
        }

        if (
          duena[vecino] !== duena[indice] &&
          distancia[vecino] + distancia[indice] + 1 <= distanciaMaxima
        ) {
          adyacentes.add(clave(duena[indice], duena[vecino]))
        }
      }
    }

    frente = siguiente
  }

  return adyacentes
}

export const leerParDeEtiquetas = (par: string): readonly [number, number] => {
  const [a, b] = par.split(':')

  return [Number(a), Number(b)]
}
