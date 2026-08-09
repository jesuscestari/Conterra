import type { Config } from '@netlify/functions'

import { responderError } from '../../src/lib/api/errores'
import { listarLotes } from '../../src/lib/lotes/repositorio'

/**
 * Listado publico de los datos comerciales de los lotes.
 *
 * La geometria no sale de aca: son poligonos que no cambian y se sirven como
 * archivo estatico cacheable desde `public/data/plano-geometria.json`. Esto
 * devuelve solo lo que se edita desde el panel.
 */
export default async (): Promise<Response> => {
  try {
    return Response.json({ lotes: await listarLotes() })
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/lotes', method: 'GET' }
