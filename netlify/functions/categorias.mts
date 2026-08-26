import type { Config } from '@netlify/functions'

import { responderError } from '../../src/lib/api/errores'
import { requerirAdmin } from '../../src/lib/auth/guardia'
import { esquemaNuevaCategoria } from '../../src/lib/categorias/esquemas'
import { crearCategoria, listarCategorias } from '../../src/lib/categorias/repositorio'

/**
 * El listado se cachea en el borde igual que el de lotes: las categorias
 * cambian todavia menos seguido. El alta no se cachea nunca, pero eso lo
 * resuelve el propio borde, que solo guarda GET.
 */
const CACHE = {
  'cache-control': 'public, max-age=0, must-revalidate',
  'netlify-cdn-cache-control': 'public, max-age=60, stale-while-revalidate=300',
}

/**
 * Listado publico de tramos comerciales y alta de uno nuevo.
 *
 * El mapa necesita los colores para dibujar y los precios para la leyenda, asi
 * que leer es publico. Crear exige sesion de administrador.
 */
export default async (peticion: Request): Promise<Response> => {
  try {
    if (peticion.method === 'POST') {
      await requerirAdmin(peticion)
      const datos = esquemaNuevaCategoria.parse(await peticion.json())

      return Response.json({ categoria: await crearCategoria(datos) }, { status: 201 })
    }

    return Response.json({ categorias: await listarCategorias() }, { headers: CACHE })
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/categorias', method: ['GET', 'POST'] }
