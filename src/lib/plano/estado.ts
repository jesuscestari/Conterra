import { oscurecer, textoSobre } from './colores'

/**
 * Situacion comercial de una parcela.
 *
 * Es una lista cerrada y vive en el codigo a proposito: son los cuatro estados
 * que la aplicacion entiende, y cada uno cambia como se comporta (si publica
 * precio, si cuenta como vendible). El tramo de precio, que si cambia seguido,
 * es un dato aparte y lo manejan los administradores (ver `Categoria`).
 */
export const ESTADOS_LOTE = ['DISPONIBLE', 'RESERVADO', 'VENDIDO', 'NO_DISPONIBLE'] as const

export type EstadoLote = (typeof ESTADOS_LOTE)[number]

export const ESTADO_POR_DEFECTO: EstadoLote = 'DISPONIBLE'

/** Cuanto se oscurece un relleno para el lote seleccionado o bajo el mouse. */
export const RESALTADO = 0.18

interface EstadoBase {
  readonly etiqueta: string
  /**
   * Relleno del poligono en el mapa.
   *
   * Para los disponibles es solo el respaldo: si el lote tiene categoria, manda
   * el color de la categoria. Un disponible sin categoria se dibuja con este.
   */
  readonly relleno: string
}

const ESTADOS: Readonly<Record<EstadoLote, EstadoBase>> = {
  // Un verde mas claro que el original: el numero del lote se dibuja encima y
  // el verde oscuro quedaba en la franja donde ni el texto claro ni el oscuro
  // llegan a 4.5:1. Lo verifica el test de contraste.
  DISPONIBLE: { etiqueta: 'Disponible', relleno: '#8fbf6a' },
  RESERVADO: { etiqueta: 'Reservado', relleno: '#c9c9c9' },
  VENDIDO: { etiqueta: 'Vendido', relleno: '#707070' },
  NO_DISPONIBLE: { etiqueta: 'No disponible', relleno: '#f9f6ec' },
}

export interface Presentacion extends EstadoBase {
  readonly rellenoActivo: string
  readonly texto: string
}

/** Como se dibuja cada relleno: su version resaltada y el texto que va encima. */
export const presentacionDeColor = (relleno: string): Omit<Presentacion, 'etiqueta'> => ({
  relleno,
  rellenoActivo: oscurecer(relleno, RESALTADO),
  texto: textoSobre(relleno),
})

export const PRESENTACION_ESTADO: Readonly<Record<EstadoLote, Presentacion>> =
  Object.fromEntries(
    ESTADOS_LOTE.map((estado) => [
      estado,
      { etiqueta: ESTADOS[estado].etiqueta, ...presentacionDeColor(ESTADOS[estado].relleno) },
    ]),
  ) as Readonly<Record<EstadoLote, Presentacion>>

export const esEstadoLote = (valor: unknown): valor is EstadoLote =>
  typeof valor === 'string' && (ESTADOS_LOTE as readonly string[]).includes(valor)

/** Si el lote esta a la venta. Es lo unico que decide si se publica el precio. */
export const esDisponible = (estado: EstadoLote): boolean => estado === 'DISPONIBLE'
