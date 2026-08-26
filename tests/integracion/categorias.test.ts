import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { prepararBase } from '../ayuda/baseDePrueba'

const base = await prepararBase()

const { prisma } = await import('@/lib/db')
const { ErrorHttp } = await import('@/lib/api/errores')
const {
  actualizarCategoria,
  borrarCategoria,
  crearCategoria,
  listarCategorias,
  listarCategoriasConUso,
} = await import('@/lib/categorias/repositorio')

const CAT1 = { nombre: 'CAT1', color: '#99e5c0', precioUsd: 16_000, orden: 1 }
const CAT2 = { nombre: 'CAT2', color: '#fff2bc', precioUsd: 18_000, orden: 2 }

const estadoDelFallo = async (accion: () => Promise<unknown>): Promise<number> => {
  const fallo = await accion().catch((error: unknown) => error)

  expect(fallo).toBeInstanceOf(ErrorHttp)

  return (fallo as InstanceType<typeof ErrorHttp>).estado
}

beforeEach(async () => {
  await prisma.lote.deleteMany()
  await prisma.categoria.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
  await base.cerrar()
})

describe('crearCategoria', () => {
  it('crea y devuelve la categoría con su id', async () => {
    const creada = await crearCategoria(CAT1)

    expect(creada.id.length).toBeGreaterThan(0)
    expect(creada).toMatchObject(CAT1)
  })

  it('rechaza un nombre repetido, explicando cuál', async () => {
    await crearCategoria(CAT1)

    expect(await estadoDelFallo(() => crearCategoria({ ...CAT2, nombre: 'CAT1' }))).toBe(400)
  })
})

describe('listarCategorias', () => {
  it('devuelve vacío cuando no hay ninguna', async () => {
    await expect(listarCategorias()).resolves.toEqual([])
  })

  it('las ordena por orden', async () => {
    await crearCategoria({ ...CAT2, orden: 5 })
    await crearCategoria({ ...CAT1, orden: 1 })

    expect((await listarCategorias()).map((c) => c.nombre)).toEqual(['CAT1', 'CAT2'])
  })

  /** El orden no es unico: al reordenar a mano es normal pasar por empates. */
  it('desempata por nombre cuando el orden coincide', async () => {
    await crearCategoria({ ...CAT2, nombre: 'Zeta', orden: 1 })
    await crearCategoria({ ...CAT1, nombre: 'Alfa', orden: 1 })

    expect((await listarCategorias()).map((c) => c.nombre)).toEqual(['Alfa', 'Zeta'])
  })
})

describe('actualizarCategoria', () => {
  /** El punto de todo el cambio: un solo lugar para tocar el precio. */
  it('cambiarle el precio lo cambia para todos sus lotes', async () => {
    const categoria = await crearCategoria(CAT1)
    await prisma.lote.createMany({
      data: [
        { id: 'L001', numero: 1, superficieM2: 800, categoriaId: categoria.id },
        { id: 'L002', numero: 2, superficieM2: 850, categoriaId: categoria.id },
      ],
    })

    await actualizarCategoria(categoria.id, { precioUsd: 26_000 })

    const lotes = await prisma.lote.findMany({
      select: { categoria: { select: { precioUsd: true } } },
    })

    expect(lotes.map((l) => l.categoria?.precioUsd)).toEqual([26_000, 26_000])
  })

  it('acepta cambios parciales', async () => {
    const categoria = await crearCategoria(CAT1)

    const actualizada = await actualizarCategoria(categoria.id, { color: '#afe1ff' })

    expect(actualizada.color).toBe('#afe1ff')
    expect(actualizada.nombre).toBe('CAT1')
    expect(actualizada.precioUsd).toBe(16_000)
  })

  it('responde 404 si no existe', async () => {
    expect(await estadoDelFallo(() => actualizarCategoria('no-existe', { orden: 2 }))).toBe(404)
  })

  it('rechaza ponerle el nombre de otra', async () => {
    await crearCategoria(CAT1)
    const otra = await crearCategoria(CAT2)

    expect(await estadoDelFallo(() => actualizarCategoria(otra.id, { nombre: 'CAT1' }))).toBe(400)
  })

  it('deja renombrarla con su propio nombre', async () => {
    const categoria = await crearCategoria(CAT1)

    await expect(
      actualizarCategoria(categoria.id, { nombre: 'CAT1', precioUsd: 17_000 }),
    ).resolves.toMatchObject({ nombre: 'CAT1', precioUsd: 17_000 })
  })
})

describe('borrarCategoria', () => {
  it('borra una que no usa nadie', async () => {
    const categoria = await crearCategoria(CAT1)

    await borrarCategoria(categoria.id)

    expect(await listarCategorias()).toEqual([])
  })

  /**
   * Perder en silencio el tramo de doscientos lotes por un clic no tiene vuelta
   * atras: hay que reasignarlos primero.
   */
  it('se niega a borrar una en uso y dice cuántos lotes la usan', async () => {
    const categoria = await crearCategoria(CAT1)
    await prisma.lote.create({
      data: { id: 'L001', numero: 1, superficieM2: 800, categoriaId: categoria.id },
    })

    const fallo = await borrarCategoria(categoria.id).catch((error: unknown) => error)

    expect((fallo as InstanceType<typeof ErrorHttp>).estado).toBe(400)
    expect((fallo as Error).message).toMatch(/1 lotes/)
    expect(await listarCategorias()).toHaveLength(1)
  })

  it('responde 404 si no existe', async () => {
    expect(await estadoDelFallo(() => borrarCategoria('no-existe'))).toBe(404)
  })
})

describe('listarCategoriasConUso', () => {
  it('informa cuántos lotes usa cada una', async () => {
    const cat1 = await crearCategoria(CAT1)
    await crearCategoria(CAT2)
    await prisma.lote.createMany({
      data: [
        { id: 'L001', numero: 1, superficieM2: 800, categoriaId: cat1.id },
        { id: 'L002', numero: 2, superficieM2: 800, categoriaId: cat1.id },
        { id: 'L003', numero: 3, superficieM2: 800 },
      ],
    })

    const conUso = await listarCategoriasConUso()

    expect(conUso.map((c) => [c.nombre, c.lotes])).toEqual([
      ['CAT1', 2],
      ['CAT2', 0],
    ])
  })
})
