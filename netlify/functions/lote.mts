import type { Config, Context } from '@netlify/functions'

import { responderError } from '../../src/lib/api/errores'
import { requerirAdmin } from '../../src/lib/auth/guardia'
import { esquemaActualizacionLote } from '../../src/lib/lotes/esquemas'
import { actualizarLote } from '../../src/lib/lotes/repositorio'

/**
 * Edicion de un lote. Acepta cambios parciales, asi que la misma ruta cubre el
 * formulario completo y el cambio rapido de estado del desplegable.
 */
export default async (peticion: Request, contexto: Context): Promise<Response> => {
  try {
    const admin = await requerirAdmin(peticion)
    const { id } = contexto.params
    const cambios = esquemaActualizacionLote.parse(await peticion.json())

    return Response.json({ lote: await actualizarLote(id, cambios, admin.id) })
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/lotes/:id', method: 'PATCH' }
