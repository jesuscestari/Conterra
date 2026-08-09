import { noAutorizado } from '../api/errores'
import { prisma } from '../db'

import { leerSesion, type AdminSesion } from './sesion'

/**
 * Exige una sesion valida y revalida contra la base que el usuario siga
 * existiendo y activo: dar de baja a un admin tiene que cortarle el acceso al
 * instante, sin esperar a que expire su token.
 *
 * @throws ErrorHttp 401 si no hay sesion valida.
 */
export const requerirAdmin = async (peticion: Request): Promise<AdminSesion> => {
  const sesion = await leerSesion(peticion)

  if (!sesion) throw noAutorizado()

  const admin = await prisma.adminUser.findUnique({
    where: { id: sesion.id },
    select: { id: true, email: true, nombre: true, activo: true },
  })

  if (!admin || !admin.activo) {
    throw noAutorizado('Tu cuenta ya no tiene acceso.')
  }

  return { id: admin.id, email: admin.email, nombre: admin.nombre }
}
