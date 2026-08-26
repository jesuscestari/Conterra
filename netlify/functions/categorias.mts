import type { Config } from '@netlify/functions'

import { responderError } from '../../src/lib/api/errores'
import { listarCategorias } from '../../src/lib/categorias/repositorio'

/**
 * Listado publico de tramos comerciales.
 *
 * El mapa los necesita para pintar cada lote con el color de su tramo y para
 * armar la leyenda de precios. No hay nada reservado en una categoria.
 */
export default async (): Promise<Response> => {
  try {
    return Response.json(
      { categorias: await listarCategorias() },
      {
        headers: {
          'cache-control': 'public, max-age=0, must-revalidate',
          'netlify-cdn-cache-control': 'public, max-age=60, stale-while-revalidate=300',
        },
      },
    )
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/categorias', method: 'GET' }
