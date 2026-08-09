import { describe, expect, it } from 'vitest'

import { ESCALA } from '../../scripts/vectorizar-plano/config'
import { calcularMetrosPorPixel, superficieEnM2 } from '../../scripts/vectorizar-plano/escala'

describe('calcularMetrosPorPixel', () => {
  it('calibra para que la mediana caiga en la superficie objetivo', () => {
    const areas = [100, 200, 400, 800, 1600]
    const mpp = calcularMetrosPorPixel(areas)

    // La mediana de esas areas es 400.
    expect(400 * mpp * mpp).toBeCloseTo(ESCALA.superficieMedianaObjetivoM2, 6)
  })

  it('no se deja arrastrar por unos pocos valores extremos', () => {
    const normales = Array.from({ length: 20 }, () => 500)
    const conAtipicos = [...normales, 50_000, 90_000]

    expect(calcularMetrosPorPixel(conAtipicos)).toBeCloseTo(
      calcularMetrosPorPixel(normales),
      6,
    )
  })

  it('no depende del orden de entrada', () => {
    const areas = [900, 100, 500, 300, 700]

    expect(calcularMetrosPorPixel(areas)).toBeCloseTo(
      calcularMetrosPorPixel([...areas].reverse()),
      10,
    )
  })

  it('avisa si no hay parcelas para calibrar', () => {
    expect(() => calcularMetrosPorPixel([])).toThrow(/no se puede calibrar/i)
  })
})

describe('superficieEnM2', () => {
  it('convierte área en píxeles a metros cuadrados', () => {
    // Con 2 metros por pixel, un pixel son 4 m2.
    expect(superficieEnM2(100, 2)).toBe(400)
  })

  it('redondea a la decena, que es la precisión útil para un folleto', () => {
    for (const area of [123, 127, 131]) {
      expect(superficieEnM2(area, 1) % 10).toBe(0)
    }
    expect(superficieEnM2(123, 1)).toBe(120)
    expect(superficieEnM2(127, 1)).toBe(130)
  })

  it('crece con el área', () => {
    expect(superficieEnM2(200, 1)).toBeGreaterThan(superficieEnM2(100, 1))
  })
})
