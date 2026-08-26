import type { EstadoLote } from '../plano/estado'
import type { LoteGeometria } from '../plano/tipos'

/**
 * Tramo comercial al que pertenece un lote. De acá salen su precio y el color
 * con el que se pinta en el mapa.
 */
export interface CategoriaDatos {
  readonly id: string
  readonly nombre: string
  /** Relleno del lote en el mapa, en hexadecimal (#rrggbb). */
  readonly color: string
  readonly precioUsd: number | null
}

/** Datos comerciales de un lote tal como los expone la API. */
export interface LoteDatos {
  readonly id: string
  readonly numero: number
  readonly superficieM2: number
  /**
   * Precio del tramo al que pertenece el lote, repetido acá por comodidad.
   *
   * Desde agosto de 2026 el precio dejó de vivir en el lote y pasó a la
   * categoría. Se sigue exponiendo en la raíz para no romper a quien ya
   * consumía este campo; la fuente de verdad es `categoria.precioUsd`.
   */
  readonly precioUsd: number | null
  readonly categoria: CategoriaDatos | null
  readonly estado: EstadoLote
  readonly observacion: string | null
  readonly editadoEn: string
}

/** Geometria + datos comerciales, que es lo que consume el mapa. */
export interface LoteCompleto extends LoteDatos {
  readonly puntos: LoteGeometria['puntos']
  readonly centroide: LoteGeometria['centroide']
}
