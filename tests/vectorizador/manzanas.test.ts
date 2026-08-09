import { describe, expect, it } from 'vitest'

import { ordenarParcelas } from '../../scripts/vectorizar-plano/manzanas'

import type { Componente } from '../../scripts/vectorizar-plano/etiquetado'

const LADO = 10

/** Parcela cuadrada con la esquina superior izquierda en (x, y). */
const parcela = (etiqueta: number, x: number, y: number): Componente => ({
  etiqueta,
  areaPx: LADO * LADO,
  minX: x,
  minY: y,
  maxX: x + LADO,
  maxY: y + LADO,
  centroide: [x + LADO / 2, y + LADO / 2],
})

const pares = (...duplas: readonly (readonly [number, number])[]): ReadonlySet<string> =>
  new Set(duplas.map(([a, b]) => `${Math.min(a, b)}:${Math.max(a, b)}`))

const etiquetas = (componentes: readonly Componente[]): readonly number[] =>
  componentes.map((componente) => componente.etiqueta)

describe('ordenarParcelas', () => {
  it('no pierde ni duplica parcelas', () => {
    const componentes = [parcela(1, 0, 0), parcela(2, 12, 0), parcela(3, 100, 0)]

    const orden = ordenarParcelas(componentes, pares([1, 2]))

    expect([...etiquetas(orden)].sort((a, b) => a - b)).toEqual([1, 2, 3])
  })

  it('recorre una manzana de izquierda a derecha', () => {
    const componentes = [parcela(3, 24, 0), parcela(1, 0, 0), parcela(2, 12, 0)]

    const orden = ordenarParcelas(componentes, pares([1, 2], [2, 3]))

    expect(etiquetas(orden)).toEqual([1, 2, 3])
  })

  it('recorre una manzana de dos filas por filas, no en zigzag', () => {
    // 1 2 / 3 4
    const componentes = [
      parcela(1, 0, 0),
      parcela(2, 12, 0),
      parcela(3, 0, 12),
      parcela(4, 12, 12),
    ]
    const vecinas = pares([1, 2], [3, 4], [1, 3], [2, 4])

    expect(etiquetas(ordenarParcelas(componentes, vecinas))).toEqual([1, 2, 3, 4])
  })

  /** El plano real está girado unos 58 grados: el orden no puede depender de x e y. */
  it('sigue la orientación real de una manzana girada', () => {
    const grados = 58
    const r = (grados * Math.PI) / 180
    const girar = (x: number, y: number): readonly [number, number] => [
      x * Math.cos(r) - y * Math.sin(r),
      x * Math.sin(r) + y * Math.cos(r),
    ]

    const componentes = [0, 1, 2, 3].map((i) => {
      const [x, y] = girar(i * 12, 0)
      return parcela(i + 1, Math.round(x), Math.round(y))
    })
    const vecinas = pares([1, 2], [2, 3], [3, 4])

    const orden = etiquetas(ordenarParcelas(componentes, vecinas))

    // El eje no tiene sentido definido, cualquiera de los dos recorridos sirve.
    expect([orden.join(), [...orden].reverse().join()]).toContain('1,2,3,4')
  })

  it('agota una manzana antes de pasar a la siguiente', () => {
    const componentes = [
      parcela(1, 0, 0),
      parcela(2, 12, 0),
      parcela(3, 300, 0),
      parcela(4, 312, 0),
    ]
    const vecinas = pares([1, 2], [3, 4])

    const orden = etiquetas(ordenarParcelas(componentes, vecinas))

    expect(orden.indexOf(2)).toBeLessThan(orden.indexOf(3))
    expect(orden.indexOf(2)).toBeLessThan(orden.indexOf(4))
  })

  it('recorre las manzanas de arriba hacia abajo', () => {
    const componentes = [parcela(1, 0, 400), parcela(2, 0, 0)]

    expect(etiquetas(ordenarParcelas(componentes, pares()))).toEqual([2, 1])
  })

  it('ignora adyacencias con etiquetas que ya no existen', () => {
    const componentes = [parcela(1, 0, 0), parcela(2, 12, 0)]

    // La 99 fue descartada por el filtro de area despues de detectar vecindades.
    const orden = ordenarParcelas(componentes, pares([1, 2], [2, 99]))

    expect(etiquetas(orden)).toEqual([1, 2])
  })

  it('devuelve el mismo orden en corridas sucesivas', () => {
    const componentes = [parcela(4, 12, 12), parcela(1, 0, 0), parcela(3, 0, 12), parcela(2, 12, 0)]
    const vecinas = pares([1, 2], [3, 4], [1, 3])

    expect(etiquetas(ordenarParcelas(componentes, vecinas))).toEqual(
      etiquetas(ordenarParcelas(componentes, vecinas)),
    )
  })

  it('devuelve vacío si no hay parcelas', () => {
    expect(ordenarParcelas([], pares())).toEqual([])
  })
})
