import { PRESENTACION_ESTADO, esDisponible, presentacionDeColor } from '../plano/estado'
import type { Presentacion } from '../plano/estado'

import type { LoteDatos } from './tipos'

/**
 * Como se dibuja un lote en el mapa.
 *
 * Manda el estado salvo cuando el lote esta disponible: ahi el color lo pone su
 * categoria, que es lo que distingue un tramo de precio de otro. Un lote
 * reservado o vendido se ve gris aunque tenga categoria, porque lo que le
 * importa a quien mira el plano es que no se puede comprar.
 *
 * Un disponible sin categoria cae en el verde generico del estado.
 */
export const colorDeLote = (
  lote: Pick<LoteDatos, 'estado' | 'categoria'>,
): Omit<Presentacion, 'etiqueta'> => {
  if (esDisponible(lote.estado) && lote.categoria !== null) {
    return presentacionDeColor(lote.categoria.color)
  }

  const { relleno, rellenoActivo, texto } = PRESENTACION_ESTADO[lote.estado]

  return { relleno, rellenoActivo, texto }
}
