import type { Config, Context } from '@netlify/functions'

import { noEncontrado, responderError } from '../../src/lib/api/errores'
import { requerirAdmin } from '../../src/lib/auth/guardia'
import { esquemaActualizacionCategoria } from '../../src/lib/categorias/esquemas'
import { actualizarCategoria, borrarCategoria } from '../../src/lib/categorias/repositorio'

/**
 * Edicion y borrado de un tramo comercial.
 *
 * Cambiarle el precio a una categoria actualiza de una a todos sus lotes, que
 * es el punto de que el precio viva aca y no en cada lote.
 */
export default async (peticion: Request, contexto: Context): Promise<Response> => {
  try {
    await requerirAdmin(peticion)

    const { id } = contexto.params

    // Misma guarda que en /api/lotes/:id: ante un 404 Netlify reintenta la ruta
    // con `.html` e `/index.html`, y con el segmento de mas el patron deja de
    // matchear. Sin esto, el `undefined` llega hasta la base.
    if (!id) throw noEncontrado('No existe esa categoría.')

    if (peticion.method === 'DELETE') {
      await borrarCategoria(id)

      return Response.json({ ok: true })
    }

    const cambios = esquemaActualizacionCategoria.parse(await peticion.json())

    return Response.json({ categoria: await actualizarCategoria(id, cambios) })
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/categorias/:id', method: ['PATCH', 'DELETE'] }
