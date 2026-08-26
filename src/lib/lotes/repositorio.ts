import { noEncontrado } from '../api/errores'
import { prisma } from '../db'
import { ESTADO_POR_DEFECTO, esEstadoLote } from '../plano/estado'

import type { ActualizacionLote } from './esquemas'
import type { LoteDatos } from './tipos'

interface FilaCategoria {
  id: string
  nombre: string
  color: string
  precioUsd: number | null
  orden: number
}

interface FilaLote {
  id: string
  numero: number
  superficieM2: number
  estado: string
  observacion: string | null
  editadoEn: Date
  categoria: FilaCategoria | null
}

/**
 * El estado se guarda como texto y no como enum de Postgres, asi que al leer se
 * normaliza: un valor invalido en la base no debe romper el mapa entero.
 */
const aLoteDatos = (fila: FilaLote): LoteDatos => ({
  id: fila.id,
  numero: fila.numero,
  superficieM2: fila.superficieM2,
  categoria: fila.categoria,
  estado: esEstadoLote(fila.estado) ? fila.estado : ESTADO_POR_DEFECTO,
  observacion: fila.observacion,
  editadoEn: fila.editadoEn.toISOString(),
})

const CAMPOS = {
  id: true,
  numero: true,
  superficieM2: true,
  estado: true,
  observacion: true,
  editadoEn: true,
  categoria: { select: { id: true, nombre: true, color: true, precioUsd: true, orden: true } },
} as const

export const listarLotes = async (): Promise<readonly LoteDatos[]> => {
  try {
    const filas = await prisma.lote.findMany({
      select: CAMPOS,
      orderBy: { numero: 'asc' },
    })

    return filas.map(aLoteDatos)
  } catch (error) {
    throw new Error(
      `No se pudieron leer los lotes: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Aplica los cambios y deja registrado quien los hizo.
 *
 * @throws ErrorHttp 404 si el lote no existe.
 */
export const actualizarLote = async (
  id: string,
  cambios: ActualizacionLote,
  editadoPorId: string,
): Promise<LoteDatos> => {
  const existe = await prisma.lote.findUnique({ where: { id }, select: { id: true } })

  if (!existe) throw noEncontrado(`No existe el lote ${id}.`)

  const fila = await prisma.lote.update({
    where: { id },
    data: { ...cambios, editadoPorId },
    select: CAMPOS,
  })

  return aLoteDatos(fila)
}
