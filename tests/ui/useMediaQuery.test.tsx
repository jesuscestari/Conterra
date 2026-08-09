// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CONSULTA_PANTALLA_CHICA,
  useEsPantallaChica,
  useMediaQuery,
} from '@/hooks/useMediaQuery'

interface ConsultaFalsa {
  readonly lista: MediaQueryList
  readonly cambiarA: (coincide: boolean) => void
  readonly suscriptos: () => number
}

/** matchMedia falso: jsdom no lo implementa y hace falta poder dispararlo. */
const simularMatchMedia = (coincideInicial: boolean): ConsultaFalsa => {
  const oyentes = new Set<() => void>()
  let coincide = coincideInicial

  const lista = {
    get matches() {
      return coincide
    },
    addEventListener: (_: string, oyente: () => void) => oyentes.add(oyente),
    removeEventListener: (_: string, oyente: () => void) => oyentes.delete(oyente),
  } as unknown as MediaQueryList

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => lista),
  )

  return {
    lista,
    cambiarA: (valor: boolean) => {
      coincide = valor
      for (const oyente of oyentes) oyente()
    },
    suscriptos: () => oyentes.size,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMediaQuery', () => {
  it('devuelve el valor de la consulta en el primer render, sin parpadeo', () => {
    simularMatchMedia(true)

    expect(renderHook(() => useMediaQuery('(max-width: 100px)')).result.current).toBe(true)
  })

  it('devuelve false cuando la consulta no coincide', () => {
    simularMatchMedia(false)

    expect(renderHook(() => useMediaQuery('(max-width: 100px)')).result.current).toBe(false)
  })

  it('reacciona cuando cambia el tamaño de la ventana', () => {
    const consulta = simularMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(max-width: 100px)'))

    act(() => consulta.cambiarA(true))

    expect(result.current).toBe(true)
  })

  it('se desuscribe al desmontarse', () => {
    const consulta = simularMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 100px)'))

    expect(consulta.suscriptos()).toBe(1)

    unmount()

    expect(consulta.suscriptos()).toBe(0)
  })

  it('consulta lo que se le pasa', () => {
    simularMatchMedia(false)

    renderHook(() => useMediaQuery('(prefers-reduced-motion: reduce)'))

    expect(vi.mocked(matchMedia)).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})

describe('useEsPantallaChica', () => {
  it('usa el breakpoint sm de Tailwind', () => {
    simularMatchMedia(true)

    const { result } = renderHook(() => useEsPantallaChica())

    expect(vi.mocked(matchMedia)).toHaveBeenCalledWith(CONSULTA_PANTALLA_CHICA)
    expect(result.current).toBe(true)
  })
})
