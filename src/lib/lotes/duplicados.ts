import type { LoteDatos } from './tipos'

/**
 * Numeros de lote que aparecen mas de una vez.
 *
 * La base no impone unicidad a proposito, porque corregir dos lotes
 * intercambiados obliga a pasar por un estado con un valor repetido. El precio
 * de esa flexibilidad es que hay que avisar cuando quedan duplicados sin
 * resolver.
 */
export const numerosDuplicados = (lotes: readonly LoteDatos[]): readonly number[] => {
  const cuenta = new Map<number, number>()

  for (const lote of lotes) {
    cuenta.set(lote.numero, (cuenta.get(lote.numero) ?? 0) + 1)
  }

  return [...cuenta.entries()]
    .filter(([, veces]) => veces > 1)
    .map(([numero]) => numero)
    .sort((a, b) => a - b)
}
