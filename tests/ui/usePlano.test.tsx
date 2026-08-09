// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { usePlano } from '@/hooks/usePlano'

import { unPlano, unaParcela } from '../ayuda/geometria'
import { unLote } from '../ayuda/lotes'

const GEOMETRIA = unPlano([unaParcela('a', 1, [0, 0]), unaParcela('b', 2, [20, 0])])

const DATOS = [unLote({ id: 'a', numero: 1 }), unLote({ id: 'b', numero: 2 })]

const json = (cuerpo: unknown, estado = 200): Response =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  })

const respuestasNormales = async (url: string | URL | Request): Promise<Response> =>
  String(url).includes('plano-geometria') ? json(GEOMETRIA) : json({ lotes: DATOS })

const simularFetch = (implementacion: typeof fetch): void => {
  vi.stubGlobal('fetch', vi.fn(implementacion))
}

beforeEach(() => {
  simularFetch(respuestasNormales as typeof fetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePlano', () => {
  it('arranca cargando y sin datos', () => {
    const { result } = renderHook(() => usePlano())

    expect(result.current.cargando).toBe(true)
    expect(result.current.lotes).toEqual([])
  })

  it('une la geometría con los datos comerciales', async () => {
    const { result } = renderHook(() => usePlano())

    await waitFor(() => expect(result.current.cargando).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.lotes).toHaveLength(2)
    expect(result.current.lotes[0]).toMatchObject({
      id: 'a',
      numero: 1,
      estado: 'DISPONIBLE',
      puntos: GEOMETRIA.lotes[0].puntos,
    })
  })

  /**
   * Si la base y el plano se desincronizan, es preferible mostrar de menos que
   * dibujar un poligono sin datos o un lote sin ubicacion.
   */
  it('descarta los polígonos que no tienen datos en la base', async () => {
    simularFetch((async (url) =>
      String(url).includes('plano-geometria')
        ? json(GEOMETRIA)
        : json({ lotes: [DATOS[0]] })) as typeof fetch)

    const { result } = renderHook(() => usePlano())

    await waitFor(() => expect(result.current.cargando).toBe(false))

    expect(result.current.lotes.map((lote) => lote.id)).toEqual(['a'])
  })

  it('descarta los lotes de la base que no están en el plano', async () => {
    simularFetch((async (url) =>
      String(url).includes('plano-geometria')
        ? json({ ...GEOMETRIA, lotes: [GEOMETRIA.lotes[0]] })
        : json({ lotes: DATOS })) as typeof fetch)

    const { result } = renderHook(() => usePlano())

    await waitFor(() => expect(result.current.cargando).toBe(false))

    expect(result.current.lotes.map((lote) => lote.id)).toEqual(['a'])
  })

  it('deja de cargar y muestra el error si falla una de las dos peticiones', async () => {
    simularFetch((async (url) =>
      String(url).includes('plano-geometria')
        ? json(GEOMETRIA)
        : json({ error: 'La base no responde.' }, 500)) as typeof fetch)

    const { result } = renderHook(() => usePlano())

    await waitFor(() => expect(result.current.cargando).toBe(false))

    expect(result.current.error).toBe('La base no responde.')
    expect(result.current.lotes).toEqual([])
  })

  describe('guardarLote', () => {
    it('actualiza el lote en la lista con lo que devolvió el servidor', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      simularFetch((async () =>
        json({ lote: unLote({ id: 'b', numero: 2, estado: 'VENDIDO' }) })) as typeof fetch)

      await result.current.guardarLote('b', { estado: 'VENDIDO' })

      await waitFor(() => {
        expect(result.current.lotes.find((lote) => lote.id === 'b')?.estado).toBe('VENDIDO')
      })
    })

    it('no toca los demás lotes', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      simularFetch((async () =>
        json({ lote: unLote({ id: 'b', numero: 2, estado: 'VENDIDO' }) })) as typeof fetch)

      await result.current.guardarLote('b', { estado: 'VENDIDO' })

      await waitFor(() => {
        expect(result.current.lotes.find((lote) => lote.id === 'a')?.estado).toBe('DISPONIBLE')
      })
    })

    it('conserva la geometría del lote actualizado', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      simularFetch((async () =>
        json({ lote: unLote({ id: 'b', numero: 2, estado: 'VENDIDO' }) })) as typeof fetch)

      await result.current.guardarLote('b', { estado: 'VENDIDO' })

      await waitFor(() => {
        expect(result.current.lotes.find((lote) => lote.id === 'b')?.puntos).toEqual(
          GEOMETRIA.lotes[1].puntos,
        )
      })
    })

    it('escapa el id en la ruta', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      simularFetch((async () => json({ lote: unLote({ id: 'a b' }) })) as typeof fetch)

      await result.current.guardarLote('a b', { estado: 'VENDIDO' })

      expect(String(vi.mocked(fetch).mock.calls[0][0])).toBe('/api/lotes/a%20b')
    })

    /** El formulario necesita el error para mostrarlo, no puede tragárselo el hook. */
    it('propaga el error para que lo muestre el formulario', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      simularFetch((async () => json({ error: 'No existe el lote.' }, 404)) as typeof fetch)

      await expect(result.current.guardarLote('z', { estado: 'VENDIDO' })).rejects.toThrow(
        'No existe el lote.',
      )
    })
  })
})
