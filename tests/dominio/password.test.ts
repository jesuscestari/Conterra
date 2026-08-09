import { describe, expect, it } from 'vitest'

import { hashearPassword, verificarPassword } from '@/lib/auth/password'

// bcrypt con 12 rondas tarda cientos de milisegundos por llamada.
const PACIENCIA_MS = 30_000

describe('hashearPassword', () => {
  it('devuelve un hash bcrypt, nunca la contraseña en claro', { timeout: PACIENCIA_MS }, async () => {
    const hash = await hashearPassword('una-clave-larga')

    expect(hash).not.toContain('una-clave-larga')
    expect(hash).toMatch(/^\$2[aby]\$12\$/)
  })

  it('usa sal: dos hashes de la misma clave son distintos', { timeout: PACIENCIA_MS }, async () => {
    const [uno, otro] = await Promise.all([
      hashearPassword('misma-clave'),
      hashearPassword('misma-clave'),
    ])

    expect(uno).not.toBe(otro)
  })
})

describe('verificarPassword', () => {
  it('acepta la contraseña correcta', { timeout: PACIENCIA_MS }, async () => {
    const hash = await hashearPassword('la-correcta')

    await expect(verificarPassword('la-correcta', hash)).resolves.toBe(true)
  })

  it('rechaza la incorrecta', { timeout: PACIENCIA_MS }, async () => {
    const hash = await hashearPassword('la-correcta')

    await expect(verificarPassword('la-incorrecta', hash)).resolves.toBe(false)
    await expect(verificarPassword('La-Correcta', hash)).resolves.toBe(false)
    await expect(verificarPassword('', hash)).resolves.toBe(false)
  })

  /**
   * Un hash corrupto en la base no puede distinguirse de una clave equivocada:
   * si tirara una excepcion, el error revelaria informacion sobre la cuenta.
   */
  it('devuelve false ante un hash inservible en vez de romper', async () => {
    await expect(verificarPassword('lo-que-sea', 'esto-no-es-un-hash')).resolves.toBe(false)
    await expect(verificarPassword('lo-que-sea', '')).resolves.toBe(false)
  })
})
