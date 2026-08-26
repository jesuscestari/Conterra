import type { CategoriaDatos } from '../categorias/tipos'
import type { EstadoLote } from '../plano/estado'
import type { LoteGeometria } from '../plano/tipos'

/**
 * Datos comerciales de un lote tal como los expone la API.
 *
 * El precio no esta aca: sale de la categoria. Se manda la categoria entera y
 * no solo su id para que el mapa pueda pintar y el popup mostrar el precio sin
 * tener que cruzar dos listas.
 */
export interface LoteDatos {
  readonly id: string
  readonly numero: number
  readonly superficieM2: number
  readonly estado: EstadoLote
  readonly categoria: CategoriaDatos | null
  readonly observacion: string | null
  readonly editadoEn: string
}

/** Geometria + datos comerciales, que es lo que consume el mapa. */
export interface LoteCompleto extends LoteDatos {
  readonly puntos: LoteGeometria['puntos']
  readonly centroide: LoteGeometria['centroide']
}
