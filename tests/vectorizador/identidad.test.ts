import { describe, expect, it } from 'vitest'

import {
  idCoincideConNumero,
  idDeLote,
  resolverIdentidad,
  verificarIdsUnicos,
} from '../../scripts/vectorizar-plano/identidad'

import { unPlano, unaParcela } from '../ayuda/geometria'

import type { NumeroOficial } from '../../scripts/vectorizar-plano/numeracionOficial'

const SUPERFICIE_ESTIMADA = 999

/** Mapa de numeracion oficial, keyeado por el id posicional del vectorizador. */
const numeracion = (
  entradas: readonly (readonly [number, number, number | null])[],
): ReadonlyMap<string, NumeroOficial> =>
  new Map(
    entradas.map(([posicional, numero, superficieM2]) => [
      idDeLote(posicional),
      { idPosicional: idDeLote(posicional), numero, superficieM2 },
    ]),
  )

describe('idDeLote', () => {
  it('rellena con ceros hasta tres dígitos', () => {
    expect(idDeLote(1)).toBe('L001')
    expect(idDeLote(42)).toBe('L042')
    expect(idDeLote(315)).toBe('L315')
  })

  /** El relleno existe para que el id ordene igual como texto que como numero. */
  it('ordena como texto igual que como número', () => {
    const numeros = [1, 2, 10, 99, 100, 462]
    const porTexto = [...numeros].map(idDeLote).sort()

    expect(porTexto).toEqual(numeros.map(idDeLote))
  })

  it('no recorta los números de más de tres dígitos', () => {
    expect(idDeLote(1234)).toBe('L1234')
  })
})

describe('resolverIdentidad', () => {
  it('cambia la numeración posicional por la de la mensura', () => {
    const identidad = resolverIdentidad(135, SUPERFICIE_ESTIMADA, numeracion([[135, 315, 3534]]))

    expect(identidad.numero).toBe(315)
  })

  /** Es el punto de todo esto: mirar la base y que el id diga el número de lote. */
  it('deriva el id del número final, no de la posición', () => {
    const identidad = resolverIdentidad(135, SUPERFICIE_ESTIMADA, numeracion([[135, 315, 3534]]))

    expect(identidad.id).toBe('L315')
  })

  it('usa la superficie de la mensura por sobre la estimada', () => {
    const identidad = resolverIdentidad(135, SUPERFICIE_ESTIMADA, numeracion([[135, 315, 3534]]))

    expect(identidad.superficieM2).toBe(3534)
  })

  /**
   * Hay 10 lotes de la mensura sin superficie acotada. Para esos se usa la
   * estimada a partir de pixeles, que es peor pero es lo que hay.
   */
  it('cae en la superficie estimada cuando la mensura no la trae', () => {
    const identidad = resolverIdentidad(135, SUPERFICIE_ESTIMADA, numeracion([[135, 315, null]]))

    expect(identidad.superficieM2).toBe(SUPERFICIE_ESTIMADA)
    expect(identidad.numero).toBe(315)
  })

  it('se queda con la numeración posicional si el lote no está en la mensura', () => {
    const identidad = resolverIdentidad(7, SUPERFICIE_ESTIMADA, numeracion([[135, 315, 3534]]))

    expect(identidad).toEqual({ id: 'L007', numero: 7, superficieM2: SUPERFICIE_ESTIMADA })
  })

  it('funciona sin numeración oficial, y el id igual coincide con el número', () => {
    const identidad = resolverIdentidad(7, SUPERFICIE_ESTIMADA, new Map())

    expect(identidad).toEqual({ id: 'L007', numero: 7, superficieM2: SUPERFICIE_ESTIMADA })
  })

  it('siempre devuelve un id que coincide con su número', () => {
    const mapa = numeracion([
      [1, 300, 800],
      [2, 5, null],
    ])

    for (const posicional of [1, 2, 3]) {
      expect(idCoincideConNumero(resolverIdentidad(posicional, 800, mapa))).toBe(true)
    }
  })
})

describe('idCoincideConNumero', () => {
  it('reconoce un lote alineado', () => {
    expect(idCoincideConNumero({ id: 'L315', numero: 315 })).toBe(true)
  })

  /** Pasa cuando un administrador renumera un lote a mano: el id no lo sigue. */
  it('detecta un lote renumerado después de generar la geometría', () => {
    expect(idCoincideConNumero({ id: 'L315', numero: 316 })).toBe(false)
  })
})

describe('verificarIdsUnicos', () => {
  it('deja pasar una numeración sin repetidos', () => {
    const plano = unPlano([unaParcela('L001', 1, [0, 0]), unaParcela('L002', 2, [20, 0])])

    expect(() => verificarIdsUnicos(plano.lotes)).not.toThrow()
  })

  it('acepta la lista vacía', () => {
    expect(() => verificarIdsUnicos([])).not.toThrow()
  })

  /**
   * Dos lotes con el mismo numero producen el mismo id, y al sembrar uno
   * pisaria al otro dejando un poligono sin datos. Tiene que fallar al generar
   * la geometria, no en produccion.
   */
  it('falla si dos lotes terminan con el mismo id', () => {
    const plano = unPlano([unaParcela('L007', 7, [0, 0]), unaParcela('L007', 7, [20, 0])])

    expect(() => verificarIdsUnicos(plano.lotes)).toThrow(/ids repetidos: L007/)
  })

  it('nombra cada id repetido una sola vez', () => {
    const plano = unPlano([
      unaParcela('L007', 7, [0, 0]),
      unaParcela('L007', 7, [20, 0]),
      unaParcela('L007', 7, [40, 0]),
    ])

    const error = new Error('sin error')
    try {
      verificarIdsUnicos(plano.lotes)
    } catch (capturado) {
      expect((capturado as Error).message.match(/L007/g)).toHaveLength(1)
      return
    }

    throw error
  })

  it('apunta al archivo que hay que revisar', () => {
    const plano = unPlano([unaParcela('L007', 7, [0, 0]), unaParcela('L007', 7, [20, 0])])

    expect(() => verificarIdsUnicos(plano.lotes)).toThrow(/numeracion-oficial\.json/)
  })
})
