import { describe, expect, it } from 'vitest'

import { contarPorEstado } from '@/lib/lotes/conteos'
import { ESTADOS_LOTE } from '@/lib/plano/estado'

import { unLote } from '../ayuda/lotes'

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

    const total = Object.values(contarPorEstado(lotes)).reduce((suma, n) => suma + n, 0)

    expect(total).toBe(lotes.length)
  })

  /** El acumulador arranca de una copia; si mutara, la segunda llamada saldria mal. */
  it('no arrastra el conteo de una llamada a la siguiente', () => {
    const lotes = [unLote({ estado: 'VENDIDO' })]

    expect(contarPorEstado(lotes)).toEqual(contarPorEstado(lotes))
  })
})
