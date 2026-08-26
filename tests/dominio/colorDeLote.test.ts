import { describe, expect, it } from 'vitest'

import { colorDeLote } from '@/lib/lotes/colorDeLote'
import { PRESENTACION_ESTADO } from '@/lib/plano/estado'

import { unLote, unaCategoria } from '../ayuda/lotes'

describe('colorDeLote', () => {
  it('un lote disponible se pinta con el color de su categoría', () => {
    const lote = unLote({ estado: 'DISPONIBLE', categoria: unaCategoria({ color: '#ffc2e7' }) })

    expect(colorDeLote(lote).relleno).toBe('#ffc2e7')
  })

  /**
   * Un lote reservado o vendido conserva su categoria, pero en el mapa se
   * dibuja gris: a quien mira el plano le importa primero que no lo puede
   * comprar, no en que tramo de precio estaba.
   */
  it('un lote que no está disponible usa el color de su estado, no el de su categoría', () => {
    for (const estado of ['RESERVADO', 'VENDIDO', 'NO_DISPONIBLE'] as const) {
      const lote = unLote({ estado, categoria: unaCategoria({ color: '#ffc2e7' }) })

      expect(colorDeLote(lote).relleno).toBe(PRESENTACION_ESTADO[estado].relleno)
    }
  })

  it('un disponible sin categoría cae en el color del estado', () => {
    const lote = unLote({ estado: 'DISPONIBLE', categoria: null })

    expect(colorDeLote(lote).relleno).toBe(PRESENTACION_ESTADO.DISPONIBLE.relleno)
  })

  it('siempre devuelve resaltado y color de texto', () => {
    const lote = unLote({ categoria: unaCategoria({ color: '#707070' }) })
    const { relleno, rellenoActivo, texto } = colorDeLote(lote)

    expect(relleno).toBe('#707070')
    expect(rellenoActivo).toMatch(/^#[0-9a-f]{6}$/)
    expect(texto).toMatch(/^#[0-9a-f]{6}$/)
  })

  /**
   * Es lo que permite que un administrador elija cualquier color sin que haya
   * que revisar despues si el numero del lote se sigue leyendo encima.
   */
  it('el número se lee sobre cualquier color que elija el administrador', () => {
    for (const color of ['#ffffff', '#000000', '#99e5c0', '#1a1a1a', '#707070', '#f9f6ec']) {
      const { relleno, texto } = colorDeLote(unLote({ categoria: unaCategoria({ color }) }))

      expect(relleno).toBe(color)
      expect(texto).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})
