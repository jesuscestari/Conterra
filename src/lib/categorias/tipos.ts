/** Tramo comercial tal como lo expone la API. */
export interface CategoriaDatos {
  readonly id: string
  readonly nombre: string
  /** Relleno del lote en el mapa, en hexadecimal (#rrggbb). */
  readonly color: string
  readonly precioUsd: number | null
  readonly orden: number
}

/** Categoria con la cantidad de lotes que la usan, para el panel. */
export interface CategoriaConUso extends CategoriaDatos {
  readonly lotes: number
}
