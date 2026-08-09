/**
 * Estados posibles de una parcela.
 *
 * Esta lista es la fuente de verdad: en la base se guardan como texto y no como
 * enum de Postgres, para que agregar un estado no cueste una migracion.
 */
export const ESTADOS_LOTE = [
  'DISPONIBLE',
  'RESERVADO',
  'VENDIDO',
  'NO_DISPONIBLE',
] as const

export type EstadoLote = (typeof ESTADOS_LOTE)[number]

export const ESTADO_POR_DEFECTO: EstadoLote = 'DISPONIBLE'

interface PresentacionEstado {
  readonly etiqueta: string
  /** Relleno del poligono en el mapa. */
  readonly relleno: string
  /** Relleno al pasar el mouse por encima. */
  readonly rellenoActivo: string
  /** Clases del chip de estado en el popup y la leyenda. */
  readonly chip: string
}

export const PRESENTACION_ESTADO: Readonly<Record<EstadoLote, PresentacionEstado>> = {
  DISPONIBLE: {
    etiqueta: 'Disponible',
    relleno: '#5b8c3e',
    rellenoActivo: '#7bb356',
    chip: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  },
  RESERVADO: {
    etiqueta: 'Reservado',
    relleno: '#d09a2c',
    rellenoActivo: '#e9b545',
    chip: 'bg-amber-100 text-amber-900 ring-amber-600/20',
  },
  VENDIDO: {
    etiqueta: 'Vendido',
    relleno: '#a63d3d',
    rellenoActivo: '#c25555',
    chip: 'bg-rose-100 text-rose-900 ring-rose-600/20',
  },
  NO_DISPONIBLE: {
    // Neutro cálido de la paleta tierra: se distingue de los tres estados con
    // color propio sin desentonar con el resto de la interfaz.
    etiqueta: 'No disponible',
    relleno: '#8b8172',
    rellenoActivo: '#a79176',
    chip: 'bg-tierra-100 text-tierra-800 ring-tierra-500/25',
  },
}

export const esEstadoLote = (valor: unknown): valor is EstadoLote =>
  typeof valor === 'string' && (ESTADOS_LOTE as readonly string[]).includes(valor)
