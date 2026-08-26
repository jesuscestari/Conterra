// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { usePlano } from '@/hooks/usePlano'

import { unPlano, unaParcela } from '../ayuda/geometria'
import { unLote, unaCategoria } from '../ayuda/lotes'

const GEOMETRIA = unPlano([unaParcela('a', 1, [0, 0]), unaParcela('b', 2, [20, 0])])

const DATOS = [unLote({ id: 'a', numero: 1 }), unLote({ id: 'b', numero: 2 })]

const json = (cuerpo: unknown, estado = 200): Response =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  })

const CATEGORIAS = [unaCategoria()]

/** El hook pide tres cosas al montarse: geometría, lotes y categorías. */
const respuestasNormales = async (url: string | URL | Request): Promise<Response> => {
  const ruta = String(url)

  if (ruta.includes('plano-geometria')) return json(GEOMETRIA)
  if (ruta.includes('/api/categorias')) return json({ categorias: CATEGORIAS })

  return json({ lotes: DATOS })
}

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
    simularFetch((async (url) => {
      const ruta = String(url)
      if (ruta.includes('plano-geometria')) return json(GEOMETRIA)
      if (ruta.includes('/api/categorias')) return json({ categorias: CATEGORIAS })
      return json({ lotes: [DATOS[0]] })
    }) as typeof fetch)

    const { result } = renderHook(() => usePlano())

    await waitFor(() => expect(result.current.cargando).toBe(false))

    expect(result.current.lotes.map((lote) => lote.id)).toEqual(['a'])
  })

  it('descarta los lotes de la base que no están en el plano', async () => {
    simularFetch((async (url) => {
      const ruta = String(url)
      if (ruta.includes('plano-geometria')) return json({ ...GEOMETRIA, lotes: [GEOMETRIA.lotes[0]] })
      if (ruta.includes('/api/categorias')) return json({ categorias: CATEGORIAS })
      return json({ lotes: DATOS })
    }) as typeof fetch)

    const { result } = renderHook(() => usePlano())

    await waitFor(() => expect(result.current.cargando).toBe(false))

    expect(result.current.lotes.map((lote) => lote.id)).toEqual(['a'])
  })

  it('deja de cargar y muestra el error si falla una de las dos peticiones', async () => {
    simularFetch((async (url) => {
      const ruta = String(url)
      if (ruta.includes('plano-geometria')) return json(GEOMETRIA)
      if (ruta.includes('/api/categorias')) return json({ categorias: CATEGORIAS })
      return json({ error: 'La base no responde.' }, 500)
    }) as typeof fetch)

    const { result } = renderHook(() => usePlano())

    await waitFor(() => expect(result.current.cargando).toBe(false))

    expect(result.current.error).toBe('La base no responde.')
    expect(result.current.lotes).toEqual([])
  })

  it('expone las categorías, que son de donde sale el precio y el color', async () => {
    const { result } = renderHook(() => usePlano())

    await waitFor(() => expect(result.current.cargando).toBe(false))

    expect(result.current.categorias).toEqual(CATEGORIAS)
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

  describe('crearCategoria', () => {
    it('agrega la categoría que devolvió el servidor', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      const nueva = unaCategoria({ id: 'cat-nueva', nombre: 'Premium', orden: 9 })
      simularFetch((async () => json({ categoria: nueva }, 201)) as typeof fetch)

      await result.current.crearCategoria({
        nombre: 'Premium',
        color: '#99e5c0',
        precioUsd: null,
        orden: 9,
      })

      await waitFor(() => {
        expect(result.current.categorias.map((c) => c.id)).toEqual(['cat-16000', 'cat-nueva'])
      })
    })

    it('las deja ordenadas por orden', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      const primera = unaCategoria({ id: 'cat-cero', nombre: 'Base', orden: 0 })
      simularFetch((async () => json({ categoria: primera }, 201)) as typeof fetch)

      await result.current.crearCategoria({
        nombre: 'Base',
        color: '#99e5c0',
        precioUsd: null,
        orden: 0,
      })

      await waitFor(() => {
        expect(result.current.categorias.map((c) => c.id)).toEqual(['cat-cero', 'cat-16000'])
      })
    })
  })

  describe('guardarCategoria', () => {
    /**
     * El precio y el color de cada lote salen de su categoria, asi que tocarla
     * cambia lo que muestran todos sus lotes: hay que releerlos.
     */
    it('vuelve a pedir los lotes, porque su precio salía de la categoría', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      const cara = unaCategoria({ precioUsd: 26_000 })
      const espia = vi.fn(async (url: string | URL | Request) =>
        String(url).includes('/api/lotes')
          ? json({ lotes: DATOS.map((lote) => ({ ...lote, categoria: cara })) })
          : json({ categoria: cara }),
      )
      vi.stubGlobal('fetch', espia)

      await result.current.guardarCategoria('cat-16000', { precioUsd: 26_000 })

      await waitFor(() => {
        expect(result.current.lotes[0].categoria?.precioUsd).toBe(26_000)
      })
      expect(espia.mock.calls.some(([url]) => String(url).includes('/api/lotes'))).toBe(true)
    })

    it('actualiza la categoría en la lista', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      const renombrada = unaCategoria({ nombre: 'Vista al arroyo' })
      simularFetch((async (url) =>
        String(url).includes('/api/lotes')
          ? json({ lotes: DATOS })
          : json({ categoria: renombrada })) as typeof fetch)

      await result.current.guardarCategoria('cat-16000', { nombre: 'Vista al arroyo' })

      await waitFor(() => {
        expect(result.current.categorias[0].nombre).toBe('Vista al arroyo')
      })
    })
  })

  describe('borrarCategoria', () => {
    it('la saca de la lista', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      simularFetch((async () => json({ ok: true })) as typeof fetch)

      await result.current.borrarCategoria('cat-16000')

      await waitFor(() => expect(result.current.categorias).toEqual([]))
    })

    /** El panel necesita el mensaje que dice cuántos lotes la usan. */
    it('propaga el error cuando el servidor se niega', async () => {
      const { result } = renderHook(() => usePlano())
      await waitFor(() => expect(result.current.cargando).toBe(false))

      simularFetch((async () =>
        json({ error: 'No se puede borrar "CAT1": la usan 28 lotes.' }, 400)) as typeof fetch)

      await expect(result.current.borrarCategoria('cat-16000')).rejects.toThrow(/28 lotes/)
      expect(result.current.categorias).toHaveLength(1)
    })
  })
})
