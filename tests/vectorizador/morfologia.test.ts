import { describe, expect, it } from 'vitest'

import { erosionar } from '../../scripts/vectorizar-plano/morfologia'
import { mascaraDeTexto, textoDeMascara } from '../ayuda/mascaras'

describe('erosionar', () => {
  it('devuelve la misma máscara con radio cero', () => {
    const m = mascaraDeTexto(['.###.', '.###.', '.###.'])

    expect(erosionar(m, 0)).toBe(m)
  })

  it('deja solo los píxeles cuyo vecindario completo está lleno', () => {
    const m = mascaraDeTexto([
      '.....',
      '.###.',
      '.###.',
      '.###.',
      '.....',
    ])

    expect(textoDeMascara(erosionar(m, 1))).toEqual([
      '.....',
      '.....',
      '..#..',
      '.....',
      '.....',
    ])
  })

  /**
   * Es para lo que existe: en el plano, el suavizado deja parcelas vecinas
   * unidas por un hilo de pixeles, y sin cortarlo el etiquetado las cuenta como
   * una sola.
   */
  it('corta el puente de un píxel que une dos manchas', () => {
    const m = mascaraDeTexto([
      '.......',
      '.##.##.',
      '.######',
      '.##.##.',
      '.......',
    ])
    const erosionada = erosionar(m, 1)
    const filas = textoDeMascara(erosionada)

    // La fila del puente queda vacía, así que las dos mitades se separan.
    expect(filas[2].includes('#')).toBe(false)
  })

  it('borra por completo las manchas más chicas que el vecindario', () => {
    const m = mascaraDeTexto(['.....', '..#..', '.....'])

    expect(erosionar(m, 1).datos.some((v) => v === 1)).toBe(false)
  })

  it('descarta el borde de la imagen, donde el vecindario no entra', () => {
    const m = mascaraDeTexto(['###', '###', '###'])

    // Solo sobrevive el centro: es el único con los 8 vecinos dentro.
    expect(textoDeMascara(erosionar(m, 1))).toEqual(['...', '.#.', '...'])
  })

  it('no modifica la máscara original', () => {
    const m = mascaraDeTexto(['.....', '.###.', '.###.', '.###.', '.....'])
    const copia = Uint8Array.from(m.datos)

    erosionar(m, 1)

    expect(m.datos).toEqual(copia)
  })
})
