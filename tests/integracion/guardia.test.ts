import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { prepararBase } from '../ayuda/baseDePrueba'

const base = await prepararBase()

const ADMIN = {
  id: 'adm-1',
  email: 'admin@lotes.test',
  nombre: 'Admin',
  passwordHash: 'hash-de-prueba',
}

/** El guardia recibe la peticion, pero con leerSesion mockeado su contenido da igual. */
const PETICION = new Request('https://ejemplo.test/api/lotes/L001')

/** La sesion en si ya tiene sus tests; aca importa que el guardia revalide. */
let sesion: { id: string; email: string; nombre: string } | null = null

vi.mock('@/lib/auth/sesion', () => ({
  leerSesion: async () => sesion,
}))

const { prisma } = await import('@/lib/db')
const { requerirAdmin } = await import('@/lib/auth/guardia')
const { ErrorHttp } = await import('@/lib/api/errores')

const estadoDelFallo = async (): Promise<number> => {
  const fallo = await requerirAdmin(PETICION).catch((error: unknown) => error)

  expect(fallo).toBeInstanceOf(ErrorHttp)

  return (fallo as InstanceType<typeof ErrorHttp>).estado
}

beforeEach(async () => {
  await prisma.lote.deleteMany()
  await prisma.adminUser.deleteMany()
  await prisma.adminUser.create({ data: ADMIN })
  sesion = { id: ADMIN.id, email: ADMIN.email, nombre: ADMIN.nombre }
})

afterAll(async () => {
  await prisma.$disconnect()
  await base.cerrar()
})

describe('requerirAdmin', () => {
  it('deja pasar a un admin activo', async () => {
    await expect(requerirAdmin(PETICION)).resolves.toEqual({
      id: ADMIN.id,
      email: ADMIN.email,
      nombre: ADMIN.nombre,
    })
  })

  it('rechaza con 401 si no hay sesión', async () => {
    sesion = null

    expect(await estadoDelFallo()).toBe(401)
  })

  /**
   * El token vive 8 horas. Dar de baja a un admin tiene que cortarle el acceso
   * al instante, sin esperar a que expire lo que ya tiene firmado.
   */
  it('rechaza a un admin dado de baja aunque su token siga siendo válido', async () => {
    await prisma.adminUser.update({ where: { id: ADMIN.id }, data: { activo: false } })

    expect(await estadoDelFallo()).toBe(401)
  })

  it('rechaza a un admin borrado de la base', async () => {
    await prisma.adminUser.delete({ where: { id: ADMIN.id } })

    expect(await estadoDelFallo()).toBe(401)
  })

  it('rechaza un token que apunta a un id inexistente', async () => {
    sesion = { id: 'adm-inventado', email: 'falso@lotes.test', nombre: 'Falso' }

    expect(await estadoDelFallo()).toBe(401)
  })

  /** Los datos que valen son los de la base, no los que viajan en el token. */
  it('devuelve los datos de la base, no los del token', async () => {
    await prisma.adminUser.update({ where: { id: ADMIN.id }, data: { nombre: 'Nombre Nuevo' } })
    sesion = { id: ADMIN.id, email: 'viejo@lotes.test', nombre: 'Nombre Viejo' }

    await expect(requerirAdmin(PETICION)).resolves.toEqual({
      id: ADMIN.id,
      email: ADMIN.email,
      nombre: 'Nombre Nuevo',
    })
  })

  it('no filtra el hash de la contraseña', async () => {
    const admin = await requerirAdmin(PETICION)

    expect(Object.keys(admin)).toEqual(['id', 'email', 'nombre'])
  })

  it('avisa de la baja con un mensaje distinto al de falta de sesión', async () => {
    await prisma.adminUser.update({ where: { id: ADMIN.id }, data: { activo: false } })

    await expect(requerirAdmin(PETICION)).rejects.toThrow(/ya no tiene acceso/)
  })
})
