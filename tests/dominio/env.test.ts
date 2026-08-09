import { afterEach, describe, expect, it } from 'vitest'

import { requireEnv } from '@/lib/env'

const NOMBRE = 'VARIABLE_SOLO_PARA_TESTS'

afterEach(() => {
  delete process.env[NOMBRE]
})

describe('requireEnv', () => {
  it('devuelve el valor cuando está definida', () => {
    process.env[NOMBRE] = 'un-valor'

    expect(requireEnv(NOMBRE)).toBe('un-valor')
  })

  it('falla nombrando la variable que falta', () => {
    expect(() => requireEnv(NOMBRE)).toThrow(new RegExp(NOMBRE))
  })

  it('trata como faltante la cadena vacía o de puros espacios', () => {
    process.env[NOMBRE] = ''
    expect(() => requireEnv(NOMBRE)).toThrow()

    process.env[NOMBRE] = '   '
    expect(() => requireEnv(NOMBRE)).toThrow()
  })

  it('explica cómo resolverlo', () => {
    expect(() => requireEnv(NOMBRE)).toThrow(/\.env\.example/)
  })
})
