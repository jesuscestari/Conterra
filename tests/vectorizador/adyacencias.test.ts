import { describe, expect, it } from 'vitest'

import {
  detectarAdyacencias,
  leerParDeEtiquetas,
} from '../../scripts/vectorizar-plano/adyacencias'
import { etiquetarComponentes } from '../../scripts/vectorizar-plano/etiquetado'
import { mascaraDeTexto } from '../ayuda/mascaras'

const adyacenciasDe = (filas: readonly string[], distancia: number) =>
  detectarAdyacencias(etiquetarComponentes(mascaraDeTexto(filas)), distancia)

describe('detectarAdyacencias', () => {
  it('no encuentra pares si hay una sola mancha', () => {
    expect(adyacenciasDe(['.###.', '.###.'], 5).size).toBe(0)
  })

  it('marca como vecinas dos manchas separadas por un píxel', () => {
    // Dos parcelas de la misma manzana, con la línea divisoria en el medio.
    expect(adyacenciasDe(['.##.##.'], 2).size).toBe(1)
  })

  it('no marca las que están más lejos que la distancia dada', () => {
    // Dos manzanas separadas por una calle.
    expect(adyacenciasDe(['.##.......##.'], 2).size).toBe(0)
  })

  /** Es lo que separa una manzana de la de enfrente en el plano. */
  it('distingue lotes de la misma manzana de los de la manzana de enfrente', () => {
    const filas = ['.##.##.......##.##.']

    const pares = adyacenciasDe(filas, 2)

    // Los dos pares internos si; el salto de la calle no.
    expect(pares.size).toBe(2)
  })

  it('crece el conjunto de vecinas al ampliar la distancia', () => {
    const filas = ['.##.......##.']

    expect(adyacenciasDe(filas, 2).size).toBe(0)
    expect(adyacenciasDe(filas, 10).size).toBe(1)
  })

  it('detecta vecindad en vertical, no solo en horizontal', () => {
    const filas = ['.##.', '....', '.##.']

    expect(adyacenciasDe(filas, 2).size).toBe(1)
  })

  it('normaliza el par, sin importar el orden de las etiquetas', () => {
    const pares = [...adyacenciasDe(['.##.##.'], 2)]
    const [a, b] = leerParDeEtiquetas(pares[0])

    expect(a).toBeLessThan(b)
  })
})

describe('leerParDeEtiquetas', () => {
  it('recupera las dos etiquetas del par', () => {
    expect(leerParDeEtiquetas('3:17')).toEqual([3, 17])
  })
})
