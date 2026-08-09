import { describe, expect, it } from 'vitest'

import { formatearFecha, formatearPrecio, formatearSuperficie } from '@/lib/formato'

/** Intl usa espacios finos y no separables; normalizarlos evita tests frágiles. */
const normalizar = (texto: string): string => texto.replace(/[   ]/g, ' ')

describe('formatearPrecio', () => {
  it('muestra el monto en dólares sin centavos', () => {
    const texto = normalizar(formatearPrecio(25_000))

    expect(texto).toContain('25.000')
    expect(texto).not.toContain(',00')
  })

  it('dice "A consultar" cuando no hay precio cargado', () => {
    expect(formatearPrecio(null)).toBe('A consultar')
  })

  it('formatea el cero como precio, no como ausencia de precio', () => {
    expect(formatearPrecio(0)).not.toBe('A consultar')
  })
})

describe('formatearSuperficie', () => {
  it('agrega la unidad', () => {
    expect(normalizar(formatearSuperficie(800))).toBe('800 m²')
  })

  it('usa el punto como separador de miles', () => {
    expect(normalizar(formatearSuperficie(1250))).toBe('1.250 m²')
  })

  it('redondea los decimales', () => {
    expect(normalizar(formatearSuperficie(812.4))).toBe('812 m²')
  })
})

describe('formatearFecha', () => {
  it('devuelve fecha y hora a partir de un ISO', () => {
    const texto = formatearFecha('2026-01-15T10:00:00.000Z')

    expect(texto.length).toBeGreaterThan(0)
    expect(texto).toContain('26')
  })

  /** El campo llega de la API; si viniera roto no puede tirar abajo el popup. */
  it('devuelve vacío en vez de romper si la fecha es inválida', () => {
    expect(formatearFecha('no es una fecha')).toBe('')
    expect(formatearFecha('')).toBe('')
  })
})
