import { describe, expect, it } from 'vitest'

import {
  TEXTO_CLARO,
  TEXTO_OSCURO,
  contraste,
  luminancia,
  oscurecer,
  textoSobre,
} from '@/lib/plano/colores'

describe('oscurecer', () => {
  it('devuelve el mismo color con proporción cero', () => {
    expect(oscurecer('#99e5c0', 0)).toBe('#99e5c0')
  })

  it('lleva a negro con proporción uno', () => {
    expect(oscurecer('#99e5c0', 1)).toBe('#000000')
  })

  it('oscurece cada canal en la proporción dada', () => {
    // 200 -> 100, 100 -> 50, 50 -> 25
    expect(oscurecer('#c86432', 0.5)).toBe('#643219')
  })

  it('acepta la forma corta de tres dígitos', () => {
    expect(oscurecer('#fff', 0)).toBe('#ffffff')
    expect(oscurecer('#f00', 0.5)).toBe('#800000')
  })

  it('tolera el color sin numeral', () => {
    expect(oscurecer('99e5c0', 0)).toBe('#99e5c0')
  })

  it('siempre devuelve seis dígitos, incluso con canales chicos', () => {
    expect(oscurecer('#0a0a0a', 0.5)).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('el negro se queda en negro', () => {
    expect(oscurecer('#000000', 0.5)).toBe('#000000')
  })
})

describe('luminancia', () => {
  it('va de cero en negro a uno en blanco', () => {
    expect(luminancia('#000000')).toBe(0)
    expect(luminancia('#ffffff')).toBeCloseTo(1, 6)
  })

  it('crece al aclarar el color', () => {
    expect(luminancia('#c9c9c9')).toBeGreaterThan(luminancia('#707070'))
  })

  /** El ojo es mucho mas sensible al verde que al azul. */
  it('pesa más el verde que el azul', () => {
    expect(luminancia('#00ff00')).toBeGreaterThan(luminancia('#0000ff'))
  })
})

describe('contraste', () => {
  it('el máximo posible es 21, entre negro y blanco', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  it('un color contra sí mismo da 1', () => {
    expect(contraste('#99e5c0', '#99e5c0')).toBeCloseTo(1, 6)
  })

  it('no depende del orden de los colores', () => {
    expect(contraste('#000000', '#c9c9c9')).toBeCloseTo(contraste('#c9c9c9', '#000000'), 6)
  })
})

describe('textoSobre', () => {
  it('usa texto oscuro sobre fondos claros', () => {
    for (const claro of ['#ffffff', '#f9f6ec', '#c9c9c9', '#fff2bc', '#99e5c0']) {
      expect(textoSobre(claro)).toBe(TEXTO_OSCURO)
    }
  })

  it('usa texto claro sobre fondos oscuros', () => {
    for (const oscuro of ['#000000', '#707070', '#3d3223']) {
      expect(textoSobre(oscuro)).toBe(TEXTO_CLARO)
    }
  })

  /**
   * Es lo que permite elegir el color de un estado sin quedar atado a que el
   * texto sea oscuro: si el relleno se oscurece, el texto se da vuelta solo.
   */
  it('siempre elige el que mejor contrasta', () => {
    for (const fondo of ['#ffffff', '#c9c9c9', '#909090', '#707070', '#000000']) {
      const elegido = textoSobre(fondo)
      const otro = elegido === TEXTO_OSCURO ? TEXTO_CLARO : TEXTO_OSCURO

      expect(contraste(elegido, fondo)).toBeGreaterThanOrEqual(contraste(otro, fondo))
    }
  })
})
