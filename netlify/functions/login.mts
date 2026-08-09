import type { Config } from '@netlify/functions'

import { ErrorHttp, responderError } from '../../src/lib/api/errores'
import { identificarCliente, limpiarIntentos, registrarIntento } from '../../src/lib/api/limite'
import { esquemaLogin } from '../../src/lib/auth/esquemas'
import { verificarPassword } from '../../src/lib/auth/password'
import { cookieDeSesion } from '../../src/lib/auth/sesion'
import { prisma } from '../../src/lib/db'

const LIMITE = { maximoIntentos: 8, ventanaMs: 10 * 60 * 1000 } as const

/** Mensaje unico para usuario inexistente, inactivo o clave incorrecta: no delata cuentas. */
const CREDENCIALES_INVALIDAS = 'Email o contraseña incorrectos.'

export default async (peticion: Request): Promise<Response> => {
  const clave = `login:${identificarCliente(peticion)}`

  try {
    await registrarIntento({ clave, ...LIMITE })

    const { email, password } = esquemaLogin.parse(await peticion.json())

    const admin = await prisma.adminUser.findUnique({ where: { email } })

    if (!admin || !admin.activo) {
      throw new ErrorHttp(401, CREDENCIALES_INVALIDAS)
    }

    if (!(await verificarPassword(password, admin.passwordHash))) {
      throw new ErrorHttp(401, CREDENCIALES_INVALIDAS)
    }

    const sesion = { id: admin.id, email: admin.email, nombre: admin.nombre }

    await limpiarIntentos(clave)

    return Response.json(
      { admin: sesion },
      { headers: { 'set-cookie': await cookieDeSesion(sesion) } },
    )
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/auth/login', method: 'POST' }
