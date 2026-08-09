import { describe, expect, it } from 'vitest'

import {
  ESTADOS_LOTE,
  ESTADO_POR_DEFECTO,
  PRESENTACION_ESTADO,
  esEstadoLote,
} from '@/lib/plano/estado'

describe('esEstadoLote', () => {
  it('acepta los cuatro estados válidos', () => {
    for (const estado of ESTADOS_LOTE) {
      expect(esEstadoLote(estado)).toBe(true)
    }
  })

  it('rechaza texto que no es un estado', () => {
    for (const valor of ['disponible', 'VENDIDA', '', 'RESERVADO ']) {
      expect(esEstadoLote(valor)).toBe(false)
    }
  })

  it('rechaza valores que no son texto', () => {
    for (const valor of [null, undefined, 0, {}, ['DISPONIBLE']]) {
      expect(esEstadoLote(valor)).toBe(false)
    }
  })
})

describe('PRESENTACION_ESTADO', () => {
  it('cubre todos los estados, así el mapa nunca queda sin color', () => {
    for (const estado of ESTADOS_LOTE) {
      const presentacion = PRESENTACION_ESTADO[estado]

      expect(presentacion.etiqueta.length).toBeGreaterThan(0)
      expect(presentacion.relleno).toMatch(/^#[0-9a-f]{6}$/i)
      expect(presentacion.rellenoActivo).toMatch(/^#[0-9a-f]{6}$/i)
      expect(presentacion.chip.length).toBeGreaterThan(0)
    }
  })

  it('le da un color distinto a cada estado', () => {
    const rellenos = ESTADOS_LOTE.map((estado) => PRESENTACION_ESTADO[estado].relleno)

    expect(new Set(rellenos).size).toBe(ESTADOS_LOTE.length)
  })
})

describe('ESTADO_POR_DEFECTO', () => {
  it('es un estado válido', () => {
    expect(esEstadoLote(ESTADO_POR_DEFECTO)).toBe(true)
  })
})
