/** Punto en el sistema de coordenadas del plano (pixeles de la imagen original). */
export type PuntoPlano = readonly [number, number]

/** Geometria de una parcela, derivada del plano y servida como archivo estatico. */
export interface LoteGeometria {
  /** Codigo estable del lote, p. ej. "L012". Es la clave contra la base. */
  readonly id: string
  /** Numero visible del lote, corrido de 1 en adelante. */
  readonly numero: number
  /** Contorno cerrado del poligono, ya simplificado. */
  readonly puntos: readonly PuntoPlano[]
  readonly centroide: PuntoPlano
  readonly areaPx: number
  readonly superficieM2: number
}

/** Rectangulo en coordenadas del plano. */
export interface RectanguloPlano {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface PlanoGeometria {
  readonly ancho: number
  readonly alto: number
  readonly generadoEn: string
  /** Metros por pixel usado para derivar las superficies. */
  readonly metrosPorPixel: number
  /**
   * Rectangulo que abarca todas las parcelas. El plano suele traer margenes y
   * panel de texto alrededor del loteo, asi que el encuadre inicial se hace
   * sobre esta zona y no sobre la imagen entera.
   */
  readonly limites: RectanguloPlano
  readonly lotes: readonly LoteGeometria[]
}
