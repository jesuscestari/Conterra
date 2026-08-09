import type { Config } from '@netlify/functions'

import { responderError } from '../../src/lib/api/errores'
import { leerSesion } from '../../src/lib/auth/sesion'

/** Devuelve el admin de la sesion actual, o null si la visita es anonima. */
export default async (peticion: Request): Promise<Response> => {
  try {
    return Response.json({ admin: await leerSesion(peticion) })
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/auth/sesion', method: 'GET' }
