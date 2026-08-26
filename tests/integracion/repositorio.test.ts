import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { prepararBase } from '../ayuda/baseDePrueba'

const base = await prepararBase()

// Importacion dinamica: `@/lib/db` lee DATABASE_URL al importarse.
const { prisma } = await import('@/lib/db')
const { actualizarLote, listarLotes } = await import('@/lib/lotes/repositorio')
const { ErrorHttp } = await import('@/lib/api/errores')

const ADMIN = { id: 'adm-1', email: 'admin@lotes.test', nombre: 'Admin', passwordHash: 'x' }

const crearLote = async (
  id: string,
  numero: number,
  extra: Record<string, unknown> = {},
): Promise<void> => {
  await prisma.lote.create({ data: { id, numero, superficieM2: 800, ...extra } })
}

/** Crea un tramo comercial y devuelve su id, para asignarlo a un lote. */
const crearCategoria = async (nombre: string, precioUsd: number | null): Promise<string> => {
  const { id } = await prisma.categoria.create({
    data: { nombre, color: '#99e5c0', precioUsd },
  })

  return id
}

beforeEach(async () => {
  await prisma.lote.deleteMany()
  // Despues de los lotes: la relacion es onDelete Restrict, asi que una
  // categoria con lotes colgando no se puede borrar.
  await prisma.categoria.deleteMany()
  await prisma.adminUser.deleteMany()
  await prisma.adminUser.create({ data: ADMIN })
})

afterAll(async () => {
  await prisma.$disconnect()
  await base.cerrar()
})

describe('listarLotes', () => {
  it('devuelve una lista vacía si no hay lotes', async () => {
    await expect(listarLotes()).resolves.toEqual([])
  })

  it('devuelve los lotes ordenados por número', async () => {
    await crearLote('c', 30)
    await crearLote('a', 2)
    await crearLote('b', 11)

    expect((await listarLotes()).map((lote) => lote.numero)).toEqual([2, 11, 30])
  })

  it('serializa la fecha de edición como ISO', async () => {
    await crearLote('a', 1)

    const [lote] = await listarLotes()

    expect(lote.editadoEn).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(Number.isNaN(Date.parse(lote.editadoEn))).toBe(false)
  })

  it('aplica los valores por defecto del esquema', async () => {
    await crearLote('a', 1)

    const [lote] = await listarLotes()

    expect(lote.estado).toBe('DISPONIBLE')
    expect(lote.categoria).toBeNull()
    expect(lote.precioUsd).toBeNull()
    expect(lote.observacion).toBeNull()
  })

  /**
   * El estado se guarda como texto y no como enum de Postgres. Un valor invalido
   * cargado a mano no puede dejar sin color a todo el mapa.
   */
  it('normaliza un estado inválido guardado en la base', async () => {
    await crearLote('a', 1)
    // Comillas obligatorias: sin ellas Postgres pasa el identificador a minusculas.
    await prisma.$executeRaw`UPDATE "Lote" SET estado = 'CUALQUIERA' WHERE id = 'a'`

    const [lote] = await listarLotes()

    expect(lote.estado).toBe('DISPONIBLE')
  })

  it('no expone quién editó el lote', async () => {
    await crearLote('a', 1, { editadoPorId: ADMIN.id })

    expect(Object.keys((await listarLotes())[0])).not.toContain('editadoPorId')
  })

  it('tolera números repetidos, que es el estado intermedio de una corrección', async () => {
    await crearLote('a', 7)
    await crearLote('b', 7)

    expect(await listarLotes()).toHaveLength(2)
  })
})

describe('actualizarLote', () => {
  it('cambia solo lo que se le manda', async () => {
    const categoriaId = await crearCategoria('CAT1', 25_000)
    await crearLote('a', 1, { categoriaId, observacion: 'Esquina' })

    const actualizado = await actualizarLote('a', { estado: 'RESERVADO' }, ADMIN.id)

    expect(actualizado.estado).toBe('RESERVADO')
    expect(actualizado.precioUsd).toBe(25_000)
    expect(actualizado.observacion).toBe('Esquina')
  })

  it('aplica el formulario completo de una', async () => {
    const categoriaId = await crearCategoria('CAT2', 31_000)
    await crearLote('a', 1)

    const actualizado = await actualizarLote(
      'a',
      { numero: 42, estado: 'VENDIDO', categoriaId, superficieM2: 905, observacion: 'Con arroyo' },
      ADMIN.id,
    )

    expect(actualizado).toMatchObject({
      numero: 42,
      estado: 'VENDIDO',
      precioUsd: 31_000,
      superficieM2: 905,
      observacion: 'Con arroyo',
    })
    expect(actualizado.categoria?.nombre).toBe('CAT2')
  })

  /** Sacarle la categoria a un lote lo deja sin precio publicado. */
  it('deja quitar la categoría y la observación', async () => {
    const categoriaId = await crearCategoria('CAT1', 25_000)
    await crearLote('a', 1, { categoriaId, observacion: 'Algo' })

    const actualizado = await actualizarLote('a', { categoriaId: null, observacion: null }, ADMIN.id)

    expect(actualizado.categoria).toBeNull()
    expect(actualizado.precioUsd).toBeNull()
    expect(actualizado.observacion).toBeNull()
  })

  it('registra quién hizo el cambio', async () => {
    await crearLote('a', 1)

    await actualizarLote('a', { estado: 'VENDIDO' }, ADMIN.id)

    const fila = await prisma.lote.findUnique({ where: { id: 'a' }, select: { editadoPorId: true } })

    expect(fila?.editadoPorId).toBe(ADMIN.id)
  })

  it('mueve la fecha de edición', async () => {
    await crearLote('a', 1)
    const antes = (await listarLotes())[0].editadoEn

    await new Promise((seguir) => setTimeout(seguir, 5))
    const despues = await actualizarLote('a', { estado: 'VENDIDO' }, ADMIN.id)

    expect(Date.parse(despues.editadoEn)).toBeGreaterThan(Date.parse(antes))
  })

  it('responde 404 si el lote no existe', async () => {
    const fallo = await actualizarLote('no-existe', { estado: 'VENDIDO' }, ADMIN.id).catch(
      (error: unknown) => error,
    )

    expect(fallo).toBeInstanceOf(ErrorHttp)
    expect((fallo as InstanceType<typeof ErrorHttp>).estado).toBe(404)
  })

  it('no crea el lote cuando no existe', async () => {
    await actualizarLote('no-existe', { estado: 'VENDIDO' }, ADMIN.id).catch(() => undefined)

    expect(await listarLotes()).toHaveLength(0)
  })

  it('persiste el cambio, no solo lo devuelve', async () => {
    await crearLote('a', 1)

    await actualizarLote('a', { estado: 'RESERVADO' }, ADMIN.id)

    expect((await listarLotes())[0].estado).toBe('RESERVADO')
  })

  /** El id deriva de la posicion en el plano: corregir el numero no lo mueve. */
  it('no toca el id al corregir el número', async () => {
    await crearLote('a', 1)

    expect((await actualizarLote('a', { numero: 300 }, ADMIN.id)).id).toBe('a')
  })
})
