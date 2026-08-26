import { prisma } from '@/lib/db'
import { ESTADO_POR_DEFECTO } from '@/lib/plano/estado'
import type { PlanoGeometria } from '@/lib/plano/tipos'

interface ResultadoSiembra {
  readonly creados: number
  /** Lotes que estan en la base pero ya no existen en el plano. */
  readonly huerfanos: readonly string[]
  readonly huerfanosBorrados: number
}

export interface OpcionesSiembra {
  /**
   * Borra los lotes que ya no existen en el plano. Va apagado por defecto:
   * borrarlos se lleva puestos su precio, su estado y sus observaciones, y un
   * plano mal vectorizado no tiene por que costar datos comerciales.
   */
  readonly limpiarHuerfanos: boolean
}

/**
 * Sincroniza la tabla de lotes con la geometria del plano.
 *
 * Solo CREA los lotes que faltan. A los que ya existen no les toca nada, ni
 * siquiera el numero o la superficie: son datos que un administrador puede
 * haber corregido a mano, y la correspondencia entre el plano de mensura y el
 * de marketing no es perfecta, asi que esas correcciones son esperables y no
 * se pueden perder al volver a sembrar.
 */
export const sembrarLotes = async (
  geometria: PlanoGeometria,
  { limpiarHuerfanos }: OpcionesSiembra,
): Promise<ResultadoSiembra> => {
  const existentes = await prisma.lote.findMany({ select: { id: true } })
  const idsExistentes = new Set(existentes.map((lote) => lote.id))
  const idsDelPlano = new Set(geometria.lotes.map((lote) => lote.id))

  const nuevos = geometria.lotes.filter((lote) => !idsExistentes.has(lote.id))

  if (nuevos.length > 0) {
    // El numero y la superficie ya vienen resueltos desde el vectorizador, que
    // es quien aplica la numeracion de la mensura.
    await prisma.lote.createMany({
      // Sin categoria: el precio sale de ahi y no hay forma de adivinar en que
      // tramo va un lote nuevo. Se asigna desde el panel.
      data: nuevos.map((lote) => ({
        id: lote.id,
        numero: lote.numero,
        superficieM2: lote.superficieM2,
        estado: ESTADO_POR_DEFECTO,
      })),
    })
  }

  const huerfanos = existentes.map((lote) => lote.id).filter((id) => !idsDelPlano.has(id))

  const huerfanosBorrados =
    limpiarHuerfanos && huerfanos.length > 0
      ? (await prisma.lote.deleteMany({ where: { id: { in: [...huerfanos] } } })).count
      : 0

  return { creados: nuevos.length, huerfanos, huerfanosBorrados }
}
