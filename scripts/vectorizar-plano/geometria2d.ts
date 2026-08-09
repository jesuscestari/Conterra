import type { PuntoPlano } from '@/lib/plano/tipos'

export interface Ejes {
  readonly centro: PuntoPlano
  /** Direccion de mayor dispersion de la nube de puntos. */
  readonly principal: PuntoPlano
  /** Perpendicular a la principal. */
  readonly secundario: PuntoPlano
}

/**
 * Ejes principales de una nube de puntos, por descomposicion de la matriz de
 * covarianza 2x2. Se usa para ordenar los lotes siguiendo la orientacion real
 * de la manzana, que en este plano esta rotada respecto de la imagen.
 */
export const calcularEjes = (puntos: readonly PuntoPlano[]): Ejes => {
  const cantidad = puntos.length
  const centro: PuntoPlano = [
    puntos.reduce((suma, [x]) => suma + x, 0) / cantidad,
    puntos.reduce((suma, [, y]) => suma + y, 0) / cantidad,
  ]

  const { sxx, syy, sxy } = puntos.reduce(
    (acumulado, [x, y]) => {
      const dx = x - centro[0]
      const dy = y - centro[1]

      return {
        sxx: acumulado.sxx + dx * dx,
        syy: acumulado.syy + dy * dy,
        sxy: acumulado.sxy + dx * dy,
      }
    },
    { sxx: 0, syy: 0, sxy: 0 },
  )

  const angulo = 0.5 * Math.atan2(2 * sxy, sxx - syy)
  const principal: PuntoPlano = [Math.cos(angulo), Math.sin(angulo)]

  return {
    centro,
    principal,
    secundario: [-principal[1], principal[0]],
  }
}

export const proyectar = (punto: PuntoPlano, origen: PuntoPlano, eje: PuntoPlano): number =>
  (punto[0] - origen[0]) * eje[0] + (punto[1] - origen[1]) * eje[1]

/**
 * Agrupa elementos en filas segun su posicion a lo largo de un eje: ordena por
 * la coordenada y corta cada vez que aparece un hueco mayor a la tolerancia.
 */
export const agruparEnFilas = <T>(
  elementos: readonly T[],
  coordenada: (elemento: T) => number,
  toleranciaHueco: number,
): readonly (readonly T[])[] => {
  if (elementos.length === 0) return []

  const ordenados = [...elementos].sort((a, b) => coordenada(a) - coordenada(b))
  const filas: T[][] = [[ordenados[0]]]

  for (let i = 1; i < ordenados.length; i += 1) {
    const hueco = coordenada(ordenados[i]) - coordenada(ordenados[i - 1])

    if (hueco > toleranciaHueco) {
      filas.push([ordenados[i]])
      continue
    }

    filas[filas.length - 1].push(ordenados[i])
  }

  return filas
}
