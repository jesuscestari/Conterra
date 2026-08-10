import type { Config, Context } from '@netlify/functions'

import { noEncontrado, responderError } from '../../src/lib/api/errores'
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

    // `params` puede venir vacio aunque la funcion se haya invocado. Ante un 404
    // Netlify reintenta la misma ruta agregando `.html` e `/index.html`, y con
    // el segmento de mas el patron `/api/lotes/:id` deja de matchear. Sin esta
    // guarda, el `undefined` llega a Prisma y el 404 legitimo se convierte en un
    // 500 con stack en los logs.
    if (!id) throw noEncontrado()

    const cambios = esquemaActualizacionLote.parse(await peticion.json())

    return Response.json({ lote: await actualizarLote(id, cambios, admin.id) })
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/lotes/:id', method: 'PATCH' }
