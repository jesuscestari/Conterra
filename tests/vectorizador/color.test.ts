import { describe, expect, it } from 'vitest'

import { aHsv } from '../../scripts/vectorizar-plano/color'

/**
 * Los valores esperados salen de medir el plano real con
 * `npm run vectorizar -- --diagnostico`. Son la referencia contra la que estan
 * calibrados los umbrales de VERDE_LOTE.
 */
describe('aHsv', () => {
  it('reconoce el verde del relleno de las parcelas', () => {
    const { tono, saturacion, valor } = aHsv(0x8e, 0x91, 0x3a)

    expect(tono).toBeCloseTo(62, 0)
    expect(saturacion).toBeCloseTo(0.6, 1)
    expect(valor).toBeCloseTo(0.57, 2)
  })

  it('reconoce las líneas divisorias, que comparten el tono pero son más oscuras', () => {
    const division = aHsv(0x38, 0x43, 0x01)
    const relleno = aHsv(0x8e, 0x91, 0x3a)

    // Es la propiedad que hace posible separarlas: mismo tono, distinto valor.
    expect(Math.abs(division.tono - relleno.tono)).toBeLessThan(15)
    expect(division.valor).toBeLessThan(relleno.valor - 0.2)
  })

  it('da saturación cero para los grises, sin importar el brillo', () => {
    for (const gris of [0x00, 0x7f, 0xff]) {
      expect(aHsv(gris, gris, gris).saturacion).toBe(0)
    }
  })

  it('ubica los primarios en su tono', () => {
    expect(aHsv(255, 0, 0).tono).toBeCloseTo(0, 5)
    expect(aHsv(0, 255, 0).tono).toBeCloseTo(120, 5)
    expect(aHsv(0, 0, 255).tono).toBeCloseTo(240, 5)
  })

  it('devuelve el tono siempre dentro de [0, 360)', () => {
    for (const [r, g, b] of [
      [255, 0, 1],
      [1, 0, 255],
      [0, 255, 254],
      [10, 20, 30],
    ]) {
      const { tono } = aHsv(r, g, b)
      expect(tono).toBeGreaterThanOrEqual(0)
      expect(tono).toBeLessThan(360)
    }
  })

  it('usa el canal más alto como valor', () => {
    expect(aHsv(0x33, 0xcc, 0x66).valor).toBeCloseTo(0xcc / 255, 5)
  })
})
