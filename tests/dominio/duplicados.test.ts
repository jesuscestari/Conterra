import { describe, expect, it } from 'vitest'

import { numerosDuplicados } from '@/lib/lotes/duplicados'

import { unLote } from '../ayuda/lotes'

const conNumeros = (numeros: readonly number[]) =>
  numeros.map((numero, indice) => unLote({ id: `l${indice}`, numero }))

describe('numerosDuplicados', () => {
  it('no reporta nada cuando la numeración está limpia', () => {
    expect(numerosDuplicados(conNumeros([1, 2, 3, 462]))).toEqual([])
  })

  it('no reporta nada con la lista vacía', () => {
    expect(numerosDuplicados([])).toEqual([])
  })

  it('reporta el número repetido una sola vez', () => {
    expect(numerosDuplicados(conNumeros([1, 7, 2, 7]))).toEqual([7])
  })

  /**
   * Corregir dos lotes intercambiados obliga a pasar por un estado con el
   * numero repetido, por eso la base no impone unicidad y hace falta avisar.
   */
  it('detecta el estado intermedio de un intercambio de dos lotes', () => {
    expect(numerosDuplicados(conNumeros([40, 40, 41]))).toEqual([40])
  })

  it('reporta un número que aparece tres veces igual que uno repetido', () => {
    expect(numerosDuplicados(conNumeros([5, 5, 5]))).toEqual([5])
  })

  it('devuelve los duplicados ordenados de menor a mayor', () => {
    expect(numerosDuplicados(conNumeros([9, 3, 9, 3, 1, 12, 12]))).toEqual([3, 9, 12])
  })
})
