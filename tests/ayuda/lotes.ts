import type { LoteDatos } from '@/lib/lotes/tipos'

/** Lote de prueba con valores plausibles, para sobrescribir solo lo que importa. */
export const unLote = (cambios: Partial<LoteDatos> = {}): LoteDatos => ({
  id: 'm01-l01',
  numero: 1,
  superficieM2: 800,
  precioUsd: 25_000,
  estado: 'DISPONIBLE',
  observacion: null,
  editadoEn: '2026-01-15T10:00:00.000Z',
  ...cambios,
})
