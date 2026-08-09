import type { PuntoPlano } from '@/lib/plano/tipos'

/**
 * Donde se dibuja el popup de un lote.
 *
 * Vive aca y no en `PopupLote` porque este modulo es el que lo calcula; el
 * componente solo lo recibe ya resuelto.
 */
export interface AnclajePopup {
  readonly x: number
  readonly y: number
  /** Si el popup se dibuja por encima o por debajo del punto de anclaje. */
  readonly orientacion: 'arriba' | 'abajo'
}

/** Ancho del popup anclado, en sincronía con la clase `w-72`. */
const ANCHO_PX = 288

/** Separación mínima contra los bordes del mapa. */
const MARGEN_PX = 12

/** Despegue del popup respecto del centro del lote, para no taparlo. */
const SEPARACION_PX = 8

/**
 * Alto aproximado que se usa solo para decidir de qué lado del lote se dibuja.
 * No hace falta que sea exacto: si se queda corto el popup igual entra, solo
 * cambia hacia dónde se abre.
 */
const ALTO_ESTIMADO_PX = 300

interface Medidas {
  readonly ancho: number
  readonly alto: number
}

/**
 * Ubica el popup junto al lote sin que se salga del mapa: lo corre en
 * horizontal si queda pegado a un borde, y lo abre hacia abajo cuando el lote
 * está tan arriba que no habría lugar por encima.
 */
export const calcularAnclaje = (
  [x, y]: PuntoPlano,
  contenedor: Medidas,
): AnclajePopup => {
  const mitad = ANCHO_PX / 2
  const minimoX = mitad + MARGEN_PX
  const maximoX = contenedor.ancho - mitad - MARGEN_PX

  const cabeArriba = y - ALTO_ESTIMADO_PX > MARGEN_PX

  return {
    // Si el mapa es más angosto que el popup, `maximoX` queda por debajo de
    // `minimoX`; en ese caso se centra y santas pascuas.
    x: maximoX < minimoX ? contenedor.ancho / 2 : Math.min(Math.max(x, minimoX), maximoX),
    y: cabeArriba ? y - SEPARACION_PX : y + SEPARACION_PX,
    orientacion: cabeArriba ? 'arriba' : 'abajo',
  }
}
