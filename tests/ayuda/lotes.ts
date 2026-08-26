import type { CategoriaDatos } from '@/lib/categorias/tipos'
import type { LoteDatos } from '@/lib/lotes/tipos'

/** Categoría de prueba, con el color y el precio de un tramo real. */
export const unaCategoria = (cambios: Partial<CategoriaDatos> = {}): CategoriaDatos => ({
  id: 'cat-16000',
  nombre: 'CAT1',
  color: '#99e5c0',
  precioUsd: 16_000,
  orden: 1,
  ...cambios,
})

/** Lote de prueba con valores plausibles, para sobrescribir solo lo que importa. */
export const unLote = (cambios: Partial<LoteDatos> = {}): LoteDatos => ({
  id: 'L001',
  numero: 1,
  superficieM2: 800,
  estado: 'DISPONIBLE',
  categoria: unaCategoria(),
  observacion: null,
  editadoEn: '2026-01-15T10:00:00.000Z',
  ...cambios,
})
