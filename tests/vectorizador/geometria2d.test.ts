import { describe, expect, it } from 'vitest'

import {
  agruparEnFilas,
  calcularEjes,
  proyectar,
} from '../../scripts/vectorizar-plano/geometria2d'

import type { PuntoPlano } from '@/lib/plano/tipos'

const rotar = (puntos: readonly PuntoPlano[], grados: number): PuntoPlano[] => {
  const r = (grados * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  return puntos.map(([x, y]) => [x * c - y * s, x * s + y * c])
}

describe('calcularEjes', () => {
  it('encuentra el eje horizontal en una nube alargada en x', () => {
    const puntos: PuntoPlano[] = Array.from({ length: 20 }, (_, i) => [i * 5, 0])
    const { principal, centro } = calcularEjes(puntos)

    expect(Math.abs(principal[0])).toBeCloseTo(1, 3)
    expect(Math.abs(principal[1])).toBeCloseTo(0, 3)
    expect(centro[0]).toBeCloseTo(47.5, 3)
  })

  /** Es lo que permite ordenar los lotes de una manzana girada, como en el plano. */
  it('sigue la orientación cuando la nube está rotada', () => {
    const base: PuntoPlano[] = Array.from({ length: 20 }, (_, i) => [i * 5, 0])
    const { principal } = calcularEjes(rotar(base, 30))
    const angulo = (Math.atan2(principal[1], principal[0]) * 180) / Math.PI

    // El eje no tiene sentido definido: 30 y 210 grados son la misma direccion.
    expect(Math.abs(((angulo % 180) + 180) % 180) - 30).toBeLessThan(1)
  })

  it('devuelve ejes perpendiculares y unitarios', () => {
    const puntos: PuntoPlano[] = [
      [0, 0],
      [10, 3],
      [20, 6],
      [5, 9],
    ]
    const { principal, secundario } = calcularEjes(puntos)

    expect(Math.hypot(...principal)).toBeCloseTo(1, 6)
    expect(Math.hypot(...secundario)).toBeCloseTo(1, 6)
    expect(principal[0] * secundario[0] + principal[1] * secundario[1]).toBeCloseTo(0, 6)
  })
})

describe('proyectar', () => {
  it('mide la distancia con signo a lo largo de un eje', () => {
    expect(proyectar([10, 0], [0, 0], [1, 0])).toBeCloseTo(10, 6)
    expect(proyectar([-4, 0], [0, 0], [1, 0])).toBeCloseTo(-4, 6)
    expect(proyectar([3, 7], [3, 0], [0, 1])).toBeCloseTo(7, 6)
  })
})

describe('agruparEnFilas', () => {
  const coordenada = (n: number): number => n

  it('devuelve vacío para una lista vacía', () => {
    expect(agruparEnFilas([], coordenada, 5)).toEqual([])
  })

  it('corta donde el hueco supera la tolerancia', () => {
    const filas = agruparEnFilas([0, 1, 2, 20, 21, 40], coordenada, 5)

    expect(filas.map((f) => [...f])).toEqual([[0, 1, 2], [20, 21], [40]])
  })

  it('ordena antes de agrupar, así el orden de entrada no importa', () => {
    const filas = agruparEnFilas([21, 0, 40, 2, 20, 1], coordenada, 5)

    expect(filas.map((f) => [...f])).toEqual([[0, 1, 2], [20, 21], [40]])
  })

  it('junta todo si la tolerancia es mayor que cualquier hueco', () => {
    expect(agruparEnFilas([0, 10, 20, 30], coordenada, 100)).toHaveLength(1)
  })

  it('separa todo si la tolerancia es cero', () => {
    expect(agruparEnFilas([0, 1, 2], coordenada, 0)).toHaveLength(3)
  })
})
