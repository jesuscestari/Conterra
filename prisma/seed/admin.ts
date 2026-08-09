import { hashearPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/db'
import { requireEnv } from '@/lib/env'

const LARGO_MINIMO_PASSWORD = 8

/**
 * Crea el primer administrador a partir del .env. Si el email ya existe no
 * pisa la contraseña: volver a correr el seed no debe revertir un cambio de
 * clave hecho despues.
 */
export const sembrarAdmin = async (): Promise<string> => {
  const email = requireEnv('SEED_ADMIN_EMAIL').trim().toLowerCase()
  const nombre = requireEnv('SEED_ADMIN_NOMBRE').trim()
  const password = requireEnv('SEED_ADMIN_PASSWORD')

  if (password.length < LARGO_MINIMO_PASSWORD) {
    throw new Error(
      `SEED_ADMIN_PASSWORD debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`,
    )
  }

  const existente = await prisma.adminUser.findUnique({ where: { email } })

  if (existente) return `Admin ${email} ya existía, se deja como está.`

  await prisma.adminUser.create({
    data: { email, nombre, passwordHash: await hashearPassword(password) },
  })

  return `Admin creado: ${email}`
}
