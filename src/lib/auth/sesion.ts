import { jwtVerify, SignJWT } from 'jose'

import { requireEnv } from '../env'

export const COOKIE_SESION = 'lotes_sesion'

const DURACION_SEGUNDOS = 60 * 60 * 8
const EMISOR = 'lotes-master'

export interface AdminSesion {
  readonly id: string
  readonly email: string
  readonly nombre: string
}

const claveDeFirma = (): Uint8Array => {
  const secreto = requireEnv('SESSION_SECRET')

  if (secreto.length < 32) {
    throw new Error('SESSION_SECRET debe tener al menos 32 caracteres.')
  }

  return new TextEncoder().encode(secreto)
}

const firmar = async (admin: AdminSesion): Promise<string> =>
  new SignJWT({ email: admin.email, nombre: admin.nombre })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(admin.id)
    .setIssuer(EMISOR)
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SEGUNDOS}s`)
    .sign(claveDeFirma())

/**
 * En produccion la cookie va `secure`, y sin HTTPS el navegador la descarta: el
 * login queda roto sin ningun error visible. En desarrollo se sirve por HTTP,
 * asi que ahi no se marca.
 */
const atributos = (maxAge: number): string =>
  [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; ')

/**
 * Valor de `Set-Cookie` que abre la sesion.
 *
 * Devuelve la cabecera en vez de escribirla porque las funciones serverless no
 * tienen un almacen de cookies mutable como el de Next: la respuesta es el
 * unico lugar donde se puede dejar.
 */
export const cookieDeSesion = async (admin: AdminSesion): Promise<string> =>
  `${COOKIE_SESION}=${await firmar(admin)}; ${atributos(DURACION_SEGUNDOS)}`

/** Valor de `Set-Cookie` que la borra: mismo nombre, vencida y vacia. */
export const cookieDeCierre = (): string => `${COOKIE_SESION}=; ${atributos(0)}`

/**
 * Extrae el token de la cabecera `Cookie`.
 *
 * No se usa una libreria porque lo unico que hace falta es encontrar un nombre
 * exacto. El valor es un JWT (base64url y puntos), asi que no necesita
 * decodificacion adicional.
 */
const tokenDe = (peticion: Request): string | null => {
  const cabecera = peticion.headers.get('cookie')

  if (!cabecera) return null

  for (const parte of cabecera.split(';')) {
    const separador = parte.indexOf('=')

    if (separador === -1) continue
    if (parte.slice(0, separador).trim() !== COOKIE_SESION) continue

    return parte.slice(separador + 1).trim() || null
  }

  return null
}

/**
 * Lee y valida la cookie de sesion. Devuelve null si no hay sesion, si el token
 * expiro o si la firma no verifica.
 */
export const leerSesion = async (peticion: Request): Promise<AdminSesion | null> => {
  const token = tokenDe(peticion)

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, claveDeFirma(), { issuer: EMISOR })

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.nombre !== 'string'
    ) {
      return null
    }

    return { id: payload.sub, email: payload.email, nombre: payload.nombre }
  } catch {
    return null
  }
}
