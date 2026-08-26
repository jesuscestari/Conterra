import { datosInvalidos, noEncontrado } from '../api/errores'
import { prisma } from '../db'

import type { ActualizacionCategoria, NuevaCategoria } from './esquemas'
import type { CategoriaConUso, CategoriaDatos } from './tipos'

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

/** Con la cantidad de lotes de cada una, para poder avisar antes de borrar. */
export const listarCategoriasConUso = async (): Promise<readonly CategoriaConUso[]> => {
  const filas = await prisma.categoria.findMany({
    select: { ...CAMPOS, _count: { select: { lotes: true } } },
    orderBy: [...ORDEN],
  })

  return filas.map(({ _count, ...categoria }) => ({ ...categoria, lotes: _count.lotes }))
}

/** @throws ErrorHttp 400 si ya existe una categoria con ese nombre. */
export const crearCategoria = async (datos: NuevaCategoria): Promise<CategoriaDatos> => {
  const repetida = await prisma.categoria.findUnique({
    where: { nombre: datos.nombre },
    select: { id: true },
  })

  if (repetida) throw datosInvalidos(`Ya existe una categoría llamada "${datos.nombre}".`)

  return prisma.categoria.create({ data: datos, select: CAMPOS })
}

/**
 * @throws ErrorHttp 404 si no existe.
 * @throws ErrorHttp 400 si el nombre nuevo ya lo usa otra.
 */
export const actualizarCategoria = async (
  id: string,
  cambios: ActualizacionCategoria,
): Promise<CategoriaDatos> => {
  const existe = await prisma.categoria.findUnique({ where: { id }, select: { id: true } })

  if (!existe) throw noEncontrado('No existe esa categoría.')

  if (cambios.nombre !== undefined) {
    const repetida = await prisma.categoria.findUnique({
      where: { nombre: cambios.nombre },
      select: { id: true },
    })

    if (repetida && repetida.id !== id) {
      throw datosInvalidos(`Ya existe una categoría llamada "${cambios.nombre}".`)
    }
  }

  return prisma.categoria.update({ where: { id }, data: cambios, select: CAMPOS })
}

/**
 * Borra una categoria que no este en uso.
 *
 * No se borra en cascada ni se dejan los lotes sueltos: perder en silencio el
 * tramo de doscientos lotes por un clic no tiene vuelta atras. Hay que
 * reasignarlos primero.
 *
 * @throws ErrorHttp 404 si no existe.
 * @throws ErrorHttp 400 si todavia tiene lotes.
 */
export const borrarCategoria = async (id: string): Promise<void> => {
  const categoria = await prisma.categoria.findUnique({
    where: { id },
    select: { nombre: true, _count: { select: { lotes: true } } },
  })

  if (!categoria) throw noEncontrado('No existe esa categoría.')

  if (categoria._count.lotes > 0) {
    throw datosInvalidos(
      `No se puede borrar "${categoria.nombre}": la usan ${categoria._count.lotes} lotes. ` +
        'Asignales otra categoría primero.',
    )
  }

  await prisma.categoria.delete({ where: { id } })
}
