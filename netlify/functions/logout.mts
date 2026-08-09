import type { Config } from '@netlify/functions'

import { responderError } from '../../src/lib/api/errores'
import { cookieDeCierre } from '../../src/lib/auth/sesion'

export default async (): Promise<Response> => {
  try {
    return Response.json({ ok: true }, { headers: { 'set-cookie': cookieDeCierre() } })
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/auth/logout', method: 'POST' }
