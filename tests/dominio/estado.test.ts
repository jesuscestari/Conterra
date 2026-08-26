import { describe, expect, it } from 'vitest'

import {
  ESTADOS_LOTE,
  ESTADO_POR_DEFECTO,
  PRESENTACION_ESTADO,
  esDisponible,
  esEstadoLote,
} from '@/lib/plano/estado'

import { contraste, luminancia } from '@/lib/plano/colores'

describe('ESTADOS_LOTE', () => {
  /**
   * Son cuatro y estan en el codigo porque cada uno cambia el comportamiento de
   * la aplicacion. Los tramos de precio, que si se agregan y se sacan, son
   * datos aparte (ver `Categoria`).
   */
  it('son los cuatro estados que la aplicación entiende', () => {
    expect([...ESTADOS_LOTE]).toEqual(['DISPONIBLE', 'RESERVADO', 'VENDIDO', 'NO_DISPONIBLE'])
  })

  it('no repite valores', () => {
    expect(new Set(ESTADOS_LOTE).size).toBe(ESTADOS_LOTE.length)
  })
})

describe('esEstadoLote', () => {
  it('acepta todos los estados válidos', () => {
    for (const estado of ESTADOS_LOTE) {
      expect(esEstadoLote(estado)).toBe(true)
    }
  })

  /** Los estados con categoria adentro se fueron: la categoria es un campo aparte. */
  it('rechaza los estados viejos que llevaban la categoría adentro', () => {
    expect(esEstadoLote('DISPONIBLE_CAT1')).toBe(false)
  })

  it('rechaza texto que no es un estado', () => {
    for (const valor of ['disponible', 'VENDIDA', '', 'RESERVADO ']) {
      expect(esEstadoLote(valor)).toBe(false)
    }
  })

  it('rechaza valores que no son texto', () => {
    for (const valor of [null, undefined, 0, {}, ['RESERVADO']]) {
      expect(esEstadoLote(valor)).toBe(false)
    }
  })
})

describe('esDisponible', () => {
  it('solo el estado disponible cuenta como a la venta', () => {
    expect(esDisponible('DISPONIBLE')).toBe(true)

    for (const estado of ['RESERVADO', 'VENDIDO', 'NO_DISPONIBLE'] as const) {
      expect(esDisponible(estado)).toBe(false)
    }
  })
})

describe('PRESENTACION_ESTADO', () => {
  it('cubre todos los estados, así el mapa nunca queda sin color', () => {
    for (const estado of ESTADOS_LOTE) {
      const { etiqueta, relleno, rellenoActivo } = PRESENTACION_ESTADO[estado]

      expect(etiqueta.length).toBeGreaterThan(0)
      expect(relleno).toMatch(/^#[0-9a-f]{6}$/i)
      expect(rellenoActivo).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('le da un color distinto a cada estado', () => {
    const rellenos = ESTADOS_LOTE.map((estado) => PRESENTACION_ESTADO[estado].relleno)

    expect(new Set(rellenos).size).toBe(ESTADOS_LOTE.length)
  })

  it('el resaltado es más oscuro que el relleno, para que se note al seleccionar', () => {
    for (const estado of ESTADOS_LOTE) {
      const { relleno, rellenoActivo } = PRESENTACION_ESTADO[estado]

      expect(luminancia(rellenoActivo)).toBeLessThan(luminancia(relleno))
    }
  })

  it('reservado es más claro que vendido, para que se lean como una escala', () => {
    expect(luminancia(PRESENTACION_ESTADO.RESERVADO.relleno)).toBeGreaterThan(
      luminancia(PRESENTACION_ESTADO.VENDIDO.relleno),
    )
  })

  /**
   * El numero del lote y el texto del chip se dibujan sobre el relleno. Como el
   * color del texto se deriva de cada relleno, cualquier color que se elija para
   * un estado sigue cumpliendo contraste sin tener que revisarlo a mano.
   */
  it('el texto de cada estado llega al contraste AA sobre su relleno', () => {
    for (const estado of ESTADOS_LOTE) {
      const { texto, relleno } = PRESENTACION_ESTADO[estado]

      expect(contraste(texto, relleno)).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('ESTADO_POR_DEFECTO', () => {
  it('es un estado válido', () => {
    expect(esEstadoLote(ESTADO_POR_DEFECTO)).toBe(true)
  })

  /** Un lote nuevo arranca a la venta, no escondido. */
  it('es el estado disponible', () => {
    expect(esDisponible(ESTADO_POR_DEFECTO)).toBe(true)
  })
})
