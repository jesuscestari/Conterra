import { describe, expect, it } from 'vitest'

import { FILTRO_COMPONENTE } from '../../scripts/vectorizar-plano/config'
import { convexidad } from '../../scripts/vectorizar-plano/forma'

import type { PuntoPlano } from '@/lib/plano/tipos'

const cuadrado: PuntoPlano[] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
]

const triangulo: PuntoPlano[] = [
  [0, 0],
  [10, 0],
  [0, 10],
]

/** Forma en L: tiene un entrante, así que su casco convexo es mayor que ella. */
const ele: PuntoPlano[] = [
  [0, 0],
  [10, 0],
  [10, 4],
  [4, 4],
  [4, 10],
  [0, 10],
]

/** Silueta dentada, parecida a la copa de un árbol del plano. */
const estrella: PuntoPlano[] = [
  [5, 0],
  [6, 4],
  [10, 5],
  [6, 6],
  [5, 10],
  [4, 6],
  [0, 5],
  [4, 4],
]

describe('convexidad', () => {
  it('da 1 para un cuadrilátero', () => {
    expect(convexidad(cuadrado)).toBeCloseTo(1, 5)
  })

  it('da 1 para un triángulo', () => {
    expect(convexidad(triangulo)).toBeCloseTo(1, 5)
  })

  it('es menor a 1 cuando la forma tiene entrantes', () => {
    expect(convexidad(ele)).toBeLessThan(0.8)
    expect(convexidad(estrella)).toBeLessThan(0.6)
  })

  it('no depende de la escala ni de la posición', () => {
    const escalado = triangulo.map(([x, y]) => [x * 7 + 300, y * 7 - 120] as PuntoPlano)

    expect(convexidad(escalado)).toBeCloseTo(convexidad(triangulo), 5)
  })

  it('no depende del sentido en que se recorra el contorno', () => {
    expect(convexidad([...ele].reverse())).toBeCloseTo(convexidad(ele), 5)
  })

  it('devuelve 0 para entradas degeneradas', () => {
    expect(convexidad([])).toBe(0)
    expect(convexidad([[0, 0]])).toBe(0)
    expect(
      convexidad([
        [0, 0],
        [5, 5],
      ]),
    ).toBe(0)
  })

  /**
   * Regresión del bug de los lotes triangulares del borde del arroyo.
   *
   * El filtro que descarta la vegetación medía antes cuán RECTANGULAR era la
   * mancha, y un triángulo llena la mitad de su rectángulo envolvente: ocho
   * parcelas legítimas se perdían junto con los árboles. La convexidad las
   * conserva porque un triángulo es convexo y una copa de árbol no.
   */
  it('conserva los lotes triangulares y descarta la vegetación', () => {
    const minimo = FILTRO_COMPONENTE.convexidadMinima

    expect(convexidad(triangulo)).toBeGreaterThan(minimo)
    expect(convexidad(cuadrado)).toBeGreaterThan(minimo)
    expect(convexidad(estrella)).toBeLessThan(minimo)
  })
})
