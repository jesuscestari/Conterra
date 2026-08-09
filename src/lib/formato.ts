const LOCALE = 'es-AR'

const formatoPrecio = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const formatoNumero = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })

const formatoFecha = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const formatearPrecio = (precioUsd: number | null): string =>
  precioUsd === null ? 'A consultar' : formatoPrecio.format(precioUsd)

export const formatearSuperficie = (superficieM2: number): string =>
  `${formatoNumero.format(superficieM2)} m²`

export const formatearFecha = (iso: string): string => {
  const fecha = new Date(iso)

  return Number.isNaN(fecha.getTime()) ? '' : formatoFecha.format(fecha)
}
