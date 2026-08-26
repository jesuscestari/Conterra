import { describe, expect, it } from 'vitest'

import { contarPorCategoria, contarPorEstado } from '@/lib/lotes/conteos'
import { ESTADOS_LOTE } from '@/lib/plano/estado'

import { unLote, unaCategoria } from '../ayuda/lotes'

describe('contarPorEstado', () => {
  it('devuelve todos los estados en cero cuando no hay lotes', () => {
    const conteos = contarPorEstado([])

    for (const estado of ESTADOS_LOTE) {
      expect(conteos[estado]).toBe(0)
    }
  })

  it('cuenta cada estado por separado', () => {
    const conteos = contarPorEstado([
      unLote({ id: 'a', estado: 'DISPONIBLE' }),
      unLote({ id: 'b', estado: 'DISPONIBLE' }),
      unLote({ id: 'c', estado: 'VENDIDO' }),
      unLote({ id: 'd', estado: 'RESERVADO' }),
    ])

    expect(conteos).toEqual({
      DISPONIBLE: 2,
      RESERVADO: 1,
      VENDIDO: 1,
      NO_DISPONIBLE: 0,
    })
  })

  it('los conteos suman el total de lotes', () => {
    const lotes = ESTADOS_LOTE.flatMap((estado, indice) =>
      Array.from({ length: indice + 1 }, (_, i) => unLote({ id: `${estado}-${i}`, estado })),
    )

    const total = Object.values(contarPorEstado(lotes)).reduce<number>((suma, n) => suma + n, 0)

    expect(total).toBe(lotes.length)
  })

  /** El acumulador arranca de una copia; si mutara, la segunda llamada saldria mal. */
  it('no arrastra el conteo de una llamada a la siguiente', () => {
    const lotes = [unLote({ estado: 'VENDIDO' })]

    expect(contarPorEstado(lotes)).toEqual(contarPorEstado(lotes))
  })
})

describe('contarPorCategoria', () => {
  it('devuelve vacío cuando no hay lotes', () => {
    expect(contarPorCategoria([])).toEqual({})
  })

  it('cuenta los lotes de cada categoría', () => {
    const cara = unaCategoria({ id: 'cat-24000', nombre: 'CAT6', precioUsd: 24_000 })

    const conteos = contarPorCategoria([
      unLote({ id: 'a' }),
      unLote({ id: 'b' }),
      unLote({ id: 'c', categoria: cara }),
    ])

    expect(conteos).toEqual({ 'cat-16000': 2, 'cat-24000': 1 })
  })

  /**
   * Un lote fuera de comercializacion no necesita tramo. Contarlo en alguna
   * categoria haria creer que esa categoria esta en uso y bloquearia borrarla.
   */
  it('ignora los lotes sin categoría', () => {
    const conteos = contarPorCategoria([
      unLote({ id: 'a', categoria: null }),
      unLote({ id: 'b' }),
    ])

    expect(conteos).toEqual({ 'cat-16000': 1 })
  })

  /** El estado no importa: un vendido conserva su categoría y sigue contando. */
  it('cuenta también los lotes que no están disponibles', () => {
    const conteos = contarPorCategoria([unLote({ id: 'a', estado: 'VENDIDO' })])

    expect(conteos).toEqual({ 'cat-16000': 1 })
  })
})
