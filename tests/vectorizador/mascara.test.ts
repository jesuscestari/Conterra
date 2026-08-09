import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { construirMascara } from '../../scripts/vectorizar-plano/mascara'

/** Colores medidos sobre el plano real. */
const VERDE_PARCELA = [168, 196, 128] as const
const LINEA_DIVISORIA = [92, 104, 70] as const
const CALLE = [236, 232, 224] as const

const ANCHO = 6
const ALTO = 4

let carpeta = ''

const escribirPng = async (
  nombre: string,
  pixel: (x: number, y: number) => readonly [number, number, number, number],
): Promise<string> => {
  const datos = Buffer.alloc(ANCHO * ALTO * 4)

  for (let y = 0; y < ALTO; y += 1) {
    for (let x = 0; x < ANCHO; x += 1) {
      const base = (y * ANCHO + x) * 4
      const [r, g, b, a] = pixel(x, y)
      datos[base] = r
      datos[base + 1] = g
      datos[base + 2] = b
      datos[base + 3] = a
    }
  }

  const ruta = join(carpeta, nombre)
  await sharp(datos, { raw: { width: ANCHO, height: ALTO, channels: 4 } }).png().toFile(ruta)

  return ruta
}

const contarEncendidos = (datos: Uint8Array): number =>
  datos.reduce((total, valor) => total + valor, 0)

beforeAll(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'mascara-'))
})

afterAll(async () => {
  await rm(carpeta, { recursive: true, force: true })
})

describe('construirMascara', () => {
  it('marca el verde de las parcelas y descarta el resto', async () => {
    // Mitad izquierda parcela, mitad derecha calle.
    const ruta = await escribirPng('mitades.png', (x) =>
      x < 3 ? [...VERDE_PARCELA, 255] : [...CALLE, 255],
    )

    const mascara = await construirMascara(ruta)

    expect(mascara.ancho).toBe(ANCHO)
    expect(mascara.alto).toBe(ALTO)
    expect(contarEncendidos(mascara.datos)).toBe(3 * ALTO)
    expect(mascara.datos[0]).toBe(1)
    expect(mascara.datos[5]).toBe(0)
  })

  /**
   * La linea divisoria comparte tono con la parcela; lo unico que las separa es
   * el valor. Si el umbral se aflojara, dos lotes vecinos se fusionarian en uno.
   */
  it('deja fuera la línea divisoria, que es del mismo tono pero más oscura', async () => {
    const ruta = await escribirPng('divisoria.png', (x) =>
      x === 3 ? [...LINEA_DIVISORIA, 255] : [...VERDE_PARCELA, 255],
    )

    const mascara = await construirMascara(ruta)

    for (let y = 0; y < ALTO; y += 1) {
      expect(mascara.datos[y * ANCHO + 3]).toBe(0)
      expect(mascara.datos[y * ANCHO + 2]).toBe(1)
    }
  })

  it('trata como fondo los píxeles transparentes, aunque su color sea verde', async () => {
    const ruta = await escribirPng('transparente.png', () => [...VERDE_PARCELA, 0])

    const mascara = await construirMascara(ruta)

    expect(contarEncendidos(mascara.datos)).toBe(0)
  })

  it('indexa como y * ancho + x', async () => {
    const ruta = await escribirPng('esquina.png', (x, y) =>
      x === 4 && y === 1 ? [...VERDE_PARCELA, 255] : [...CALLE, 255],
    )

    const mascara = await construirMascara(ruta)

    expect(contarEncendidos(mascara.datos)).toBe(1)
    expect(mascara.datos[1 * ANCHO + 4]).toBe(1)
  })

  it('explica el problema si el archivo no existe', async () => {
    await expect(construirMascara(join(carpeta, 'no-esta.png'))).rejects.toThrow(
      /No se pudo leer el plano/,
    )
  })

  it('explica el problema si el archivo no es una imagen', async () => {
    const ruta = join(carpeta, 'roto.png')
    await writeFile(ruta, 'esto no es una imagen')

    await expect(construirMascara(ruta)).rejects.toThrow(/No se pudo leer el plano/)
  })
})
