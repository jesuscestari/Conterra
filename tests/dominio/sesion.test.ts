import { SignJWT } from 'jose'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  COOKIE_SESION,
  cookieDeCierre,
  cookieDeSesion,
  leerSesion,
} from '@/lib/auth/sesion'

const SECRETO = 'un-secreto-de-pruebas-con-mas-de-32-caracteres'
const EMISOR = 'lotes-master'

const ADMIN = { id: 'adm-1', email: 'admin@lotes.test', nombre: 'Admin' }

const clave = (secreto = SECRETO): Uint8Array => new TextEncoder().encode(secreto)

interface OpcionesToken {
  readonly secreto?: string
  readonly emisor?: string
  readonly expiracion?: string
  readonly extra?: Record<string, unknown>
}

const firmarToken = async ({
  secreto = SECRETO,
  emisor = EMISOR,
  expiracion = '8h',
  extra = { email: ADMIN.email, nombre: ADMIN.nombre },
}: OpcionesToken = {}): Promise<string> =>
  new SignJWT(extra)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(ADMIN.id)
    .setIssuer(emisor)
    .setIssuedAt()
    .setExpirationTime(expiracion)
    .sign(clave(secreto))

/** Peticion con la cabecera `Cookie` armada, que es lo unico que mira el modulo. */
const peticionCon = (cookie: string): Request =>
  new Request('https://ejemplo.test/api/auth/sesion', { headers: { cookie } })

/** Extrae el valor del token de una cabecera `Set-Cookie` completa. */
const tokenDeCabecera = (cabecera: string): string =>
  cabecera.slice(cabecera.indexOf('=') + 1, cabecera.indexOf(';'))

/** Los atributos de la cookie, en minuscula, para poder afirmar sobre ellos. */
const atributosDe = (cabecera: string): readonly string[] =>
  cabecera
    .split(';')
    .slice(1)
    .map((parte) => parte.trim().toLowerCase())

beforeEach(() => {
  process.env.SESSION_SECRET = SECRETO
})

afterEach(() => {
  delete process.env.SESSION_SECRET
  delete process.env.NODE_ENV
})

describe('cookieDeSesion', () => {
  it('emite una cookie que leerSesion vuelve a entender', async () => {
    const cabecera = await cookieDeSesion(ADMIN)

    await expect(leerSesion(peticionCon(cabecera.split(';')[0]))).resolves.toEqual(ADMIN)
  })

  /** Sin httpOnly cualquier script de la pagina podria robarse la sesion. */
  it('marca la cookie httpOnly y sameSite lax', async () => {
    const atributos = atributosDe(await cookieDeSesion(ADMIN))

    expect(atributos).toContain('httponly')
    expect(atributos).toContain('samesite=lax')
    expect(atributos).toContain('path=/')
    expect(atributos).toContain(`max-age=${8 * 60 * 60}`)
  })

  /**
   * En produccion la cookie tiene que ir `secure`. En desarrollo no, porque se
   * sirve por HTTP y el navegador la descartaria.
   */
  it('agrega Secure solo en produccion', async () => {
    process.env.NODE_ENV = 'production'
    expect(atributosDe(await cookieDeSesion(ADMIN))).toContain('secure')

    process.env.NODE_ENV = 'development'
    expect(atributosDe(await cookieDeSesion(ADMIN))).not.toContain('secure')
  })

  it('rechaza un secreto corto en vez de firmar con algo débil', async () => {
    process.env.SESSION_SECRET = 'corto'

    await expect(cookieDeSesion(ADMIN)).rejects.toThrow(/al menos 32 caracteres/)
  })

  it('avisa si falta el secreto', async () => {
    delete process.env.SESSION_SECRET

    await expect(cookieDeSesion(ADMIN)).rejects.toThrow(/SESSION_SECRET/)
  })
})

describe('leerSesion', () => {
  it('devuelve null si no hay cabecera Cookie', async () => {
    await expect(leerSesion(new Request('https://ejemplo.test/'))).resolves.toBeNull()
  })

  it('devuelve null si la cabecera no trae nuestra cookie', async () => {
    await expect(leerSesion(peticionCon('otra=cosa; tercera=valor'))).resolves.toBeNull()
  })

  /** La sesion tiene que encontrarse aunque el navegador mande varias cookies. */
  it('encuentra la cookie entre otras', async () => {
    const token = tokenDeCabecera(await cookieDeSesion(ADMIN))

    await expect(
      leerSesion(peticionCon(`_ga=1; ${COOKIE_SESION}=${token}; otra=2`)),
    ).resolves.toEqual(ADMIN)
  })

  it('devuelve null si el token está firmado con otro secreto', async () => {
    const token = await firmarToken({ secreto: 'otro-secreto-igual-de-largo-que-el-real' })

    await expect(leerSesion(peticionCon(`${COOKIE_SESION}=${token}`))).resolves.toBeNull()
  })

  it('devuelve null si el token venció', async () => {
    const token = await firmarToken({ expiracion: '-1s' })

    await expect(leerSesion(peticionCon(`${COOKIE_SESION}=${token}`))).resolves.toBeNull()
  })

  it('devuelve null si el emisor no es el nuestro', async () => {
    const token = await firmarToken({ emisor: 'otro-sitio' })

    await expect(leerSesion(peticionCon(`${COOKIE_SESION}=${token}`))).resolves.toBeNull()
  })

  it('devuelve null si la cookie no es un token', async () => {
    await expect(
      leerSesion(peticionCon(`${COOKIE_SESION}=esto-no-es-un-jwt`)),
    ).resolves.toBeNull()
  })

  /** Un token bien firmado pero incompleto no puede pasar por una sesion valida. */
  it('devuelve null si al token le faltan datos del admin', async () => {
    const token = await firmarToken({ extra: { email: ADMIN.email } })

    await expect(leerSesion(peticionCon(`${COOKIE_SESION}=${token}`))).resolves.toBeNull()
  })

  it('devuelve null si los datos del token son de otro tipo', async () => {
    const token = await firmarToken({ extra: { email: 42, nombre: ADMIN.nombre } })

    await expect(leerSesion(peticionCon(`${COOKIE_SESION}=${token}`))).resolves.toBeNull()
  })
})

describe('cookieDeCierre', () => {
  it('vence la cookie y la deja vacía', () => {
    const cabecera = cookieDeCierre()

    expect(cabecera.startsWith(`${COOKIE_SESION}=;`)).toBe(true)
    expect(atributosDe(cabecera)).toContain('max-age=0')
  })

  /** Lo que importa: despues de cerrarla, el navegador no manda nada que valide. */
  it('deja una cookie que ya no abre sesión', async () => {
    const token = tokenDeCabecera(cookieDeCierre())

    await expect(leerSesion(peticionCon(`${COOKIE_SESION}=${token}`))).resolves.toBeNull()
  })
})
