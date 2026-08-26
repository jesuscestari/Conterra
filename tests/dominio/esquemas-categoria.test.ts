import { describe, expect, it } from 'vitest'

import {
  esquemaActualizacionCategoria,
  esquemaNuevaCategoria,
} from '@/lib/categorias/esquemas'

const nueva = (datos: unknown) => esquemaNuevaCategoria.safeParse(datos)
const cambio = (datos: unknown) => esquemaActualizacionCategoria.safeParse(datos)

describe('esquemaNuevaCategoria', () => {
  it('acepta una categoría completa', () => {
    const resultado = nueva({ nombre: 'Premium', color: '#99e5c0', precioUsd: 24_000, orden: 3 })

    expect(resultado.success).toBe(true)
  })

  it('el precio y el orden son opcionales', () => {
    const resultado = nueva({ nombre: 'Premium', color: '#99e5c0' })

    expect(resultado.data).toEqual({
      nombre: 'Premium',
      color: '#99e5c0',
      precioUsd: null,
      orden: 0,
    })
  })

  it('recorta el nombre', () => {
    expect(nueva({ nombre: '  Premium  ', color: '#99e5c0' }).data?.nombre).toBe('Premium')
  })

  it('exige un nombre', () => {
    expect(nueva({ nombre: '   ', color: '#99e5c0' }).success).toBe(false)
    expect(nueva({ color: '#99e5c0' }).success).toBe(false)
  })

  it('rechaza nombres larguísimos', () => {
    expect(nueva({ nombre: 'x'.repeat(41), color: '#99e5c0' }).success).toBe(false)
  })

  /** El color va al `fill` de un SVG: cualquier texto ahí es una inyección o un lote invisible. */
  it('rechaza cualquier cosa que no sea un hexadecimal de seis dígitos', () => {
    for (const color of ['rojo', '99e5c0', '#99e5c', '#99e5c0ff', '', 'url(#x)', '#zzzzzz']) {
      expect(nueva({ nombre: 'X', color }).success).toBe(false)
    }
  })

  /**
   * Se normaliza a minusculas para que el mismo color sea siempre el mismo
   * texto y se puedan detectar repetidos entre categorias.
   */
  it('normaliza el color a minúsculas', () => {
    expect(nueva({ nombre: 'X', color: '#99E5C0' }).data?.color).toBe('#99e5c0')
  })

  it('acepta la forma larga con espacios alrededor', () => {
    expect(nueva({ nombre: 'X', color: '  #99e5c0  ' }).data?.color).toBe('#99e5c0')
  })

  it('rechaza precios negativos o decimales', () => {
    expect(nueva({ nombre: 'X', color: '#99e5c0', precioUsd: -1 }).success).toBe(false)
    expect(nueva({ nombre: 'X', color: '#99e5c0', precioUsd: 1000.5 }).success).toBe(false)
  })

  it('acepta precio nulo, que es "sin precio todavía"', () => {
    expect(nueva({ nombre: 'X', color: '#99e5c0', precioUsd: null }).success).toBe(true)
  })
})

describe('esquemaActualizacionCategoria', () => {
  it('acepta cambiar solo el precio, que es el caso más común', () => {
    expect(cambio({ precioUsd: 26_000 }).success).toBe(true)
  })

  it('acepta cambiar solo el color', () => {
    expect(cambio({ color: '#afe1ff' }).success).toBe(true)
  })

  it('rechaza un cuerpo vacío en vez de hacer una escritura sin cambios', () => {
    const resultado = cambio({})

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues[0]?.message).toMatch(/ningún cambio/)
  })

  it('aplica las mismas reglas que al crear', () => {
    expect(cambio({ color: 'rojo' }).success).toBe(false)
    expect(cambio({ nombre: '   ' }).success).toBe(false)
    expect(cambio({ orden: -1 }).success).toBe(false)
  })
})
