import { describe, expect, it } from 'vitest'

import { precioEsPublico } from '@/lib/lotes/reglas'
import { ESTADOS_LOTE } from '@/lib/plano/estado'

describe('precioEsPublico', () => {
  it('publica el precio de un lote a la venta', () => {
    expect(precioEsPublico('DISPONIBLE')).toBe(true)
  })

  it('oculta el precio de los lotes que no se ofrecen', () => {
    for (const estado of ['RESERVADO', 'VENDIDO', 'NO_DISPONIBLE'] as const) {
      expect(precioEsPublico(estado)).toBe(false)
    }
  })

  it('decide para todos los estados, sin quedarse sin caso', () => {
    for (const estado of ESTADOS_LOTE) {
      expect(typeof precioEsPublico(estado)).toBe('boolean')
    }
  })
})
