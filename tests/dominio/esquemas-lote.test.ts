import { describe, expect, it } from 'vitest'

import { esquemaActualizacionLote, esquemaEstado } from '@/lib/lotes/esquemas'

const parsear = (datos: unknown) => esquemaActualizacionLote.safeParse(datos)

describe('esquemaEstado', () => {
  it('acepta un estado válido', () => {
    expect(esquemaEstado.parse('VENDIDO')).toBe('VENDIDO')
  })

  it('rechaza uno inválido con un mensaje en castellano', () => {
    const resultado = esquemaEstado.safeParse('EN_VENTA')

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues[0]?.message).toMatch(/no es válido/)
  })
})

describe('esquemaActualizacionLote', () => {
  it('acepta el cambio rápido, que manda solo el estado', () => {
    const resultado = parsear({ estado: 'RESERVADO' })

    expect(resultado.success).toBe(true)
    expect(resultado.data).toEqual({ estado: 'RESERVADO' })
  })

  it('acepta el formulario completo', () => {
    const datos = {
      numero: 42,
      estado: 'DISPONIBLE',
      categoriaId: 'cat-1',
      superficieM2: 812.5,
      observacion: 'Esquina',
    }

    expect(parsear(datos).success).toBe(true)
  })

  it('rechaza un cuerpo vacío en vez de hacer una escritura sin cambios', () => {
    const resultado = parsear({})

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues[0]?.message).toMatch(/ningún cambio/)
  })

  /** Sin categoria el lote queda sin precio publicado: es "a consultar". */
  it('acepta categoría nula', () => {
    expect(parsear({ categoriaId: null }).success).toBe(true)
  })

  it('rechaza una categoría vacía o en blanco', () => {
    expect(parsear({ categoriaId: '' }).success).toBe(false)
    expect(parsear({ categoriaId: '   ' }).success).toBe(false)
  })

  /**
   * El precio dejo de vivir en el lote: ahora sale de la categoria. Mandarlo
   * tiene que rebotar en vez de aceptarse y perderse en silencio.
   */
  it('ya no acepta un precio por lote', () => {
    expect(parsear({ precioUsd: 30_000 }).success).toBe(false)
  })

  /**
   * Lo importante no es que rebote el precio solo —eso ya lo frenaba el "sin
   * cambios"— sino que rebote tambien mezclado con campos validos, en vez de
   * guardarse el estado y perder el precio sin decir nada.
   */
  it('rechaza un precio colado entre campos válidos', () => {
    expect(parsear({ estado: 'VENDIDO', precioUsd: 30_000 }).success).toBe(false)
  })

  it('exige que la superficie sea positiva', () => {
    expect(parsear({ superficieM2: 0 }).success).toBe(false)
    expect(parsear({ superficieM2: -5 }).success).toBe(false)
    expect(parsear({ superficieM2: 100_001 }).success).toBe(false)
    expect(parsear({ superficieM2: 812.5 }).success).toBe(true)
  })

  it('exige que el número de lote sea un entero dentro de rango', () => {
    expect(parsear({ numero: 0 }).success).toBe(false)
    expect(parsear({ numero: 1.5 }).success).toBe(false)
    expect(parsear({ numero: 10_000 }).success).toBe(false)
    expect(parsear({ numero: 462 }).success).toBe(true)
  })

  it('rechaza números mandados como texto', () => {
    expect(parsear({ numero: '42' }).success).toBe(false)
    expect(parsear({ superficieM2: '812.5' }).success).toBe(false)
  })

  it('recorta la observación y convierte la vacía en nula', () => {
    expect(parsear({ observacion: '  con vista  ' }).data?.observacion).toBe('con vista')
    expect(parsear({ observacion: '   ' }).data?.observacion).toBeNull()
  })

  it('acepta borrar la observación mandando null', () => {
    expect(parsear({ observacion: null }).data?.observacion).toBeNull()
  })

  it('rechaza una observación larguísima', () => {
    expect(parsear({ observacion: 'x'.repeat(501) }).success).toBe(false)
    expect(parsear({ observacion: 'x'.repeat(500) }).success).toBe(true)
  })
})
