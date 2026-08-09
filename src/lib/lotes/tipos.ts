import type { EstadoLote } from '../plano/estado'
import type { LoteGeometria } from '../plano/tipos'

/** Datos comerciales de un lote tal como los expone la API. */
export interface LoteDatos {
  readonly id: string
  readonly numero: number
  readonly superficieM2: number
  readonly precioUsd: number | null
  readonly estado: EstadoLote
  readonly observacion: string | null
  readonly editadoEn: string
}

/** Geometria + datos comerciales, que es lo que consume el mapa. */
export interface LoteCompleto extends LoteDatos {
  readonly puntos: LoteGeometria['puntos']
  readonly centroide: LoteGeometria['centroide']
}
