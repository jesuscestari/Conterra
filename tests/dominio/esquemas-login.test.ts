import { describe, expect, it } from 'vitest'

import { esquemaLogin } from '@/lib/auth/esquemas'

const parsear = (datos: unknown) => esquemaLogin.safeParse(datos)

describe('esquemaLogin', () => {
  it('acepta un login válido', () => {
    expect(parsear({ email: 'admin@lotes.test', password: 'secreta' }).success).toBe(true)
  })

  /** El email se guarda en minusculas, asi el login no depende de como lo tipeen. */
  it('normaliza el email: recorta espacios y pasa a minúsculas', () => {
    const datos = parsear({ email: '  Admin@Lotes.TEST ', password: 'secreta' }).data

    expect(datos?.email).toBe('admin@lotes.test')
  })

  it('no toca la contraseña, que puede tener espacios a propósito', () => {
    const datos = parsear({ email: 'a@b.test', password: '  con espacios  ' }).data

    expect(datos?.password).toBe('  con espacios  ')
  })

  it('pide el email cuando viene vacío', () => {
    const resultado = parsear({ email: '   ', password: 'secreta' })

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues[0]?.message).toMatch(/Ingresá tu email/)
  })

  it('rechaza un email con formato inválido', () => {
    for (const email of ['sin-arroba', 'a@', '@b.test', 'a b@c.test']) {
      expect(parsear({ email, password: 'secreta' }).success).toBe(false)
    }
  })

  it('pide la contraseña cuando viene vacía', () => {
    const resultado = parsear({ email: 'a@b.test', password: '' })

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues[0]?.message).toMatch(/Ingresá tu contraseña/)
  })

  it('rechaza contraseñas desmesuradas, que solo servirían para hacer trabajar a bcrypt', () => {
    expect(parsear({ email: 'a@b.test', password: 'x'.repeat(201) }).success).toBe(false)
  })

  it('rechaza campos ausentes o de otro tipo', () => {
    expect(parsear({}).success).toBe(false)
    expect(parsear({ email: 'a@b.test' }).success).toBe(false)
    expect(parsear({ email: 42, password: 'secreta' }).success).toBe(false)
  })
})
