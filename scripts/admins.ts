/**
 * Administra las cuentas que pueden entrar al panel del plano.
 *
 * Existe porque la tabla de administradores es de Conterra: quién tiene acceso
 * al panel de su propio sitio no debería depender de pedirle una cuenta a un
 * tercero. La contraseña se toma del entorno y nunca se imprime.
 *
 * Uso:
 *   npm run admins                      # lista quién tiene acceso
 *   npm run admins -- --crear           # crea uno con ADMIN_*
 *   npm run admins -- --resetear        # le cambia la contraseña a ADMIN_EMAIL
 *   npm run admins -- --desactivar a@b  # le corta el acceso, sin borrarlo
 *
 * Variables: ADMIN_EMAIL, ADMIN_NOMBRE, ADMIN_PASSWORD.
 */
import 'dotenv/config'

import { hashearPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/db'
import { requireEnv } from '@/lib/env'

const LARGO_MINIMO_PASSWORD = 12

const decir = (mensaje: string): void => {
  process.stdout.write(`${mensaje}\n`)
}

const password = (): Promise<string> => {
  const valor = requireEnv('ADMIN_PASSWORD')

  if (valor.length < LARGO_MINIMO_PASSWORD) {
    throw new Error(`ADMIN_PASSWORD tiene que tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`)
  }

  return hashearPassword(valor)
}

const listar = async (): Promise<void> => {
  const admins = await prisma.adminUser.findMany({
    select: { email: true, nombre: true, activo: true, creadoEn: true },
    orderBy: { creadoEn: 'asc' },
  })

  if (admins.length === 0) {
    decir('No hay ninguna cuenta de administrador.')
    return
  }

  decir(`${admins.length} cuenta(s) con acceso al panel:`)

  for (const a of admins) {
    const estado = a.activo ? 'activo' : 'DESACTIVADO'
    decir(`  ${a.email}  (${a.nombre})  ${estado}  desde ${a.creadoEn.toISOString().slice(0, 10)}`)
  }
}

const crear = async (): Promise<void> => {
  const email = requireEnv('ADMIN_EMAIL').trim().toLowerCase()
  const nombre = requireEnv('ADMIN_NOMBRE').trim()

  if (await prisma.adminUser.findUnique({ where: { email } })) {
    throw new Error(`Ya existe ${email}. Para cambiarle la clave: npm run admins -- --resetear`)
  }

  await prisma.adminUser.create({ data: { email, nombre, passwordHash: await password() } })
  decir(`Cuenta creada: ${email}`)
}

const resetear = async (): Promise<void> => {
  const email = requireEnv('ADMIN_EMAIL').trim().toLowerCase()

  if (!(await prisma.adminUser.findUnique({ where: { email } }))) {
    throw new Error(`No existe ${email}. Para crearla: npm run admins -- --crear`)
  }

  await prisma.adminUser.update({
    where: { email },
    data: { passwordHash: await password(), activo: true },
  })
  decir(`Contraseña cambiada para ${email}. Las sesiones abiertas siguen valiendo hasta vencer.`)
}

/**
 * Se desactiva en vez de borrar: `editadoPor` apunta a la cuenta, y borrarla
 * dejaría sin autor los lotes que esa persona editó. El guardia revisa `activo`
 * en cada pedido, así que el acceso se corta en la petición siguiente.
 */
const desactivar = async (email: string): Promise<void> => {
  const objetivo = email.trim().toLowerCase()

  if (!(await prisma.adminUser.findUnique({ where: { email: objetivo } }))) {
    throw new Error(`No existe ${objetivo}.`)
  }

  await prisma.adminUser.update({ where: { email: objetivo }, data: { activo: false } })
  decir(`Acceso cortado para ${objetivo}.`)
}

const main = async (): Promise<void> => {
  const args = process.argv.slice(2)
  const indiceDesactivar = args.indexOf('--desactivar')

  if (indiceDesactivar !== -1) {
    const email = args[indiceDesactivar + 1]

    if (!email) throw new Error('Falta el email: npm run admins -- --desactivar alguien@dominio')

    await desactivar(email)
  } else if (args.includes('--crear')) {
    await crear()
  } else if (args.includes('--resetear')) {
    await resetear()
  } else {
    await listar()
  }
}

main()
  .catch((error: unknown) => {
    process.stderr.write(`\n${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
