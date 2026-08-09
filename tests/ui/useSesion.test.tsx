// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSesion } from '@/hooks/useSesion'

const ADMIN = { id: 'adm-1', email: 'admin@lotes.test', nombre: 'Admin' }

const json = (cuerpo: unknown, estado = 200): Response =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  })

const simularFetch = (implementacion: typeof fetch): void => {
  vi.stubGlobal('fetch', vi.fn(implementacion))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useSesion', () => {
  it('arranca cargando y sin admin', () => {
    simularFetch((async () => json({ admin: null })) as typeof fetch)

    const { result } = renderHook(() => useSesion())

    expect(result.current.cargando).toBe(true)
    expect(result.current.admin).toBeNull()
  })

  it('expone el admin cuando hay sesión', async () => {
    simularFetch((async () => json({ admin: ADMIN })) as typeof fetch)

    const { result } = renderHook(() => useSesion())

    await waitFor(() => expect(result.current.cargando).toBe(false))
    expect(result.current.admin).toEqual(ADMIN)
  })

  it('deja el admin en null cuando no hay sesión', async () => {
    simularFetch((async () => json({ admin: null })) as typeof fetch)

    const { result } = renderHook(() => useSesion())

    await waitFor(() => expect(result.current.cargando).toBe(false))
    expect(result.current.admin).toBeNull()
  })

  /** El plano se ve sin iniciar sesion: un fallo al consultarla no puede romperlo. */
  it('asume visita anónima si la consulta falla', async () => {
    simularFetch((async () => json({ error: 'Se cayó el servidor.' }, 500)) as typeof fetch)

    const { result } = renderHook(() => useSesion())

    await waitFor(() => expect(result.current.cargando).toBe(false))
    expect(result.current.admin).toBeNull()
  })

  it('asume visita anónima si no hay red', async () => {
    simularFetch((async () => {
      throw new TypeError('Failed to fetch')
    }) as typeof fetch)

    const { result } = renderHook(() => useSesion())

    await waitFor(() => expect(result.current.cargando).toBe(false))
    expect(result.current.admin).toBeNull()
  })

  describe('salir', () => {
    it('llama al endpoint de logout y limpia el admin', async () => {
      simularFetch((async () => json({ admin: ADMIN })) as typeof fetch)

      const { result } = renderHook(() => useSesion())
      await waitFor(() => expect(result.current.admin).toEqual(ADMIN))

      simularFetch((async () => json({ ok: true })) as typeof fetch)
      await result.current.salir()

      await waitFor(() => expect(result.current.admin).toBeNull())

      const [url, opciones] = vi.mocked(fetch).mock.calls[0]
      expect(String(url)).toBe('/api/auth/logout')
      expect(opciones?.method).toBe('POST')
    })

    /** Si el logout falla igual hay que sacar la interfaz de admin del medio. */
    it('limpia el admin aunque el logout falle', async () => {
      simularFetch((async () => json({ admin: ADMIN })) as typeof fetch)

      const { result } = renderHook(() => useSesion())
      await waitFor(() => expect(result.current.admin).toEqual(ADMIN))

      simularFetch((async () => json({ error: 'ups' }, 500)) as typeof fetch)
      await result.current.salir().catch(() => undefined)

      await waitFor(() => expect(result.current.admin).toBeNull())
    })
  })
})
