import { ESTADOS_LOTE, type EstadoLote } from '../plano/estado'

import type { LoteDatos } from './tipos'

const VACIO = Object.fromEntries(ESTADOS_LOTE.map((estado) => [estado, 0])) as Record<
  EstadoLote,
  number
>

export const contarPorEstado = (
  lotes: readonly LoteDatos[],
): Readonly<Record<EstadoLote, number>> =>
  lotes.reduce<Record<EstadoLote, number>>(
    (conteos, lote) => ({ ...conteos, [lote.estado]: conteos[lote.estado] + 1 }),
    { ...VACIO },
  )

/** Cuantos lotes usa cada categoria, para mostrarlo en el panel. */
export const contarPorCategoria = (
  lotes: readonly LoteDatos[],
): Readonly<Record<string, number>> =>
  lotes.reduce<Record<string, number>>(
    (conteos, lote) =>
      lote.categoria === null
        ? conteos
        : { ...conteos, [lote.categoria.id]: (conteos[lote.categoria.id] ?? 0) + 1 },
    {},
  )
