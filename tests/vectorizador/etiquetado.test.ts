import { describe, expect, it } from 'vitest'

import {
  etiquetarComponentes,
  expandirEtiquetas,
} from '../../scripts/vectorizar-plano/etiquetado'
import { erosionar } from '../../scripts/vectorizar-plano/morfologia'
import { mascaraDeTexto } from '../ayuda/mascaras'

describe('etiquetarComponentes', () => {
  it('no encuentra nada en una máscara vacía', () => {
    expect(etiquetarComponentes(mascaraDeTexto(['...', '...'])).componentes).toHaveLength(0)
  })

  it('separa las manchas que no se tocan', () => {
    const m = mascaraDeTexto([
      '##..##',
      '##..##',
      '......',
      '##..##',
    ])

    expect(etiquetarComponentes(m).componentes).toHaveLength(4)
  })

  it('usa vecindad 4: lo que solo se toca en diagonal queda separado', () => {
    const m = mascaraDeTexto([
      '#..',
      '.#.',
      '..#',
    ])

    expect(etiquetarComponentes(m).componentes).toHaveLength(3)
  })

  it('calcula área, recuadro y centroide de cada mancha', () => {
    const m = mascaraDeTexto([
      '......',
      '.####.',
      '.####.',
      '......',
    ])
    const [c] = etiquetarComponentes(m).componentes

    expect(c.areaPx).toBe(8)
    expect([c.minX, c.minY, c.maxX, c.maxY]).toEqual([1, 1, 4, 2])
    expect(c.centroide[0]).toBeCloseTo(2.5, 5)
    expect(c.centroide[1]).toBeCloseTo(1.5, 5)
  })

  it('recorre formas alargadas sin desbordar la pila', () => {
    const ancho = 4000
    const datos = new Uint8Array(ancho)
    datos.fill(1)

    const { componentes } = etiquetarComponentes({ ancho, alto: 1, datos })

    expect(componentes).toHaveLength(1)
    expect(componentes[0].areaPx).toBe(ancho)
  })
})

describe('expandirEtiquetas', () => {
  it('devuelve las manchas a su tamaño original tras la erosión', () => {
    const original = mascaraDeTexto([
      '......',
      '.####.',
      '.####.',
      '.####.',
      '......',
    ])
    const erosionada = erosionar(original, 1)
    const { componentes } = expandirEtiquetas(etiquetarComponentes(erosionada), original)

    expect(componentes).toHaveLength(1)
    expect(componentes[0].areaPx).toBe(12)
  })

  /** Es el paso que hace que erosionar no achique las parcelas de verdad. */
  it('reparte los píxeles del puente entre las dos manchas que separó', () => {
    const original = mascaraDeTexto([
      '.........',
      '.###.###.',
      '.#######.',
      '.###.###.',
      '.........',
    ])
    const erosionada = erosionar(original, 1)
    const { componentes } = expandirEtiquetas(etiquetarComponentes(erosionada), original)

    expect(componentes.length).toBeGreaterThanOrEqual(2)

    const total = componentes.reduce((s, c) => s + c.areaPx, 0)
    const pixeles = original.datos.reduce<number>((s, v) => s + v, 0)

    // Todo pixel verde termina asignado a alguna parcela, sin duplicarse.
    expect(total).toBe(pixeles)
  })

  it('descarta lo que la erosión borró por completo', () => {
    const original = mascaraDeTexto([
      '..........',
      '.####...#.',
      '.####.....',
      '.####.....',
      '..........',
    ])
    const erosionada = erosionar(original, 1)
    const { componentes } = expandirEtiquetas(etiquetarComponentes(erosionada), original)

    // La mancha de un pixel no sobrevive a la erosion, asi que no aparece.
    expect(componentes).toHaveLength(1)
    expect(componentes[0].areaPx).toBe(12)
  })
})
