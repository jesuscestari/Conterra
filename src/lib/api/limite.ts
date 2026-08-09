import { prisma } from '../db'

import { ErrorHttp } from './errores'

interface OpcionesLimite {
  readonly clave: string
  readonly maximoIntentos: number
  readonly ventanaMs: number
}

/**
 * Limitador de intentos respaldado por la base.
 *
 * Vivia en un `Map` en memoria, que solo servia con un unico proceso de larga
 * vida. Con la base, el contador es el mismo para todas las instancias y
 * sobrevive a los reinicios, que es justo lo que hace falta para que frene algo
 * de verdad.
 *
 * @throws ErrorHttp 429 si se paso del maximo dentro de la ventana.
 */
export const registrarIntento = async ({
  clave,
  maximoIntentos,
  ventanaMs,
}: OpcionesLimite): Promise<void> => {
  const ahora = new Date()

  // Borrar las ventanas vencidas reinicia esta clave si ya expiro y de paso
  // limpia las de los demas, asi la tabla no crece sin control y no hace falta
  // una tarea programada aparte.
  await prisma.intentoAcceso.deleteMany({ where: { reiniciaEn: { lte: ahora } } })

  const { intentos, reiniciaEn } = await prisma.intentoAcceso.upsert({
    where: { clave },
    create: { clave, intentos: 1, reiniciaEn: new Date(ahora.getTime() + ventanaMs) },
    update: { intentos: { increment: 1 } },
  })

  if (intentos > maximoIntentos) {
    const segundos = Math.max(1, Math.ceil((reiniciaEn.getTime() - ahora.getTime()) / 1000))

    throw new ErrorHttp(429, `Demasiados intentos. Probá de nuevo en ${segundos} segundos.`)
  }
}

/** Se llama al entrar bien, para no penalizar a quien erro una vez y despues acerto. */
export const limpiarIntentos = async (clave: string): Promise<void> => {
  await prisma.intentoAcceso.deleteMany({ where: { clave } })
}

/** Identifica al cliente detras de un proxy, con la conexion directa como respaldo. */
export const identificarCliente = (peticion: Request): string =>
  peticion.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  peticion.headers.get('x-real-ip') ||
  'desconocido'
