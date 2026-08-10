import type { Config } from '@netlify/functions'

import { responderError } from '../../src/lib/api/errores'
import { listarLotes } from '../../src/lib/lotes/repositorio'

/**
 * Cacheo en el borde de Netlify.
 *
 * Sin esto cada visita al plano abre una consulta a Neon: unos 350 ms de ida y
 * vuelta a us-east-1 por datos que cambian una vez por semana. Con el cache, la
 * enorme mayoria de las visitas se sirve desde el borde sin invocar la funcion
 * ni tocar la base.
 *
 * El minuto de `max-age` es el retraso maximo con el que se ve un cambio hecho
 * desde el panel. No molesta a quien edita: el panel actualiza su propia vista
 * con la respuesta del PATCH, sin volver a pedir el listado.
 *
 * `stale-while-revalidate` hace que, pasado ese minuto, se siga respondiendo al
 * instante con lo ultimo conocido mientras se refresca por detras.
 */
const CACHE_BORDE = 'public, max-age=60, stale-while-revalidate=300'

/** El navegador no guarda copia: el borde ya absorbe el trabajo y asi no queda una version vieja pegada en el cliente. */
const CACHE_NAVEGADOR = 'public, max-age=0, must-revalidate'

/**
 * Listado publico de los datos comerciales de los lotes.
 *
 * La geometria no sale de aca: son poligonos que no cambian y se sirven como
 * archivo estatico cacheable desde `public/data/plano-geometria.json`. Esto
 * devuelve solo lo que se edita desde el panel.
 */
export default async (): Promise<Response> => {
  try {
    return Response.json(
      { lotes: await listarLotes() },
      {
        headers: {
          'cache-control': CACHE_NAVEGADOR,
          'netlify-cdn-cache-control': CACHE_BORDE,
        },
      },
    )
  } catch (error) {
    return responderError(error)
  }
}

export const config: Config = { path: '/api/lotes', method: 'GET' }
