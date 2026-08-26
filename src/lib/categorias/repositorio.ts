import { prisma } from '../db'

import type { CategoriaDatos } from './tipos'

const CAMPOS = {
  id: true,
  nombre: true,
  color: true,
  precioUsd: true,
  orden: true,
} as const

/** Orden estable: por `orden`, y el nombre desempata cuando hay empate. */
const ORDEN = [{ orden: 'asc' }, { nombre: 'asc' }] as const

export const listarCategorias = async (): Promise<readonly CategoriaDatos[]> => {
  try {
    return await prisma.categoria.findMany({ select: CAMPOS, orderBy: [...ORDEN] })
  } catch (error) {
    throw new Error(
      `No se pudieron leer las categorías: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}
