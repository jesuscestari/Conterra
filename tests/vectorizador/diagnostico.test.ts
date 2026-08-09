import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { analizarColores, formatearInforme } from '../../scripts/vectorizar-plano/diagnostico'

const VERDE = [168, 196, 128] as const
const BLANCO = [255, 255, 255] as const

const ANCHO = 10
const ALTO = 10

let carpeta = ''

/** Imagen con las tres primeras columnas verdes y el resto blancas. */
const escribirPlanito = async (): Promise<string> => {
  const datos = Buffer.alloc(ANCHO * ALTO * 4)

  for (let y = 0; y < ALTO; y += 1) {
    for (let x = 0; x < ANCHO; x += 1) {
      const base = (y * ANCHO + x) * 4
      const [r, g, b] = x < 3 ? VERDE : BLANCO
      datos[base] = r
      datos[base + 1] = g
      datos[base + 2] = b
      datos[base + 3] = 255
    }
  }

  const ruta = join(carpeta, 'planito.png')
  await sharp(datos, { raw: { width: ANCHO, height: ALTO, channels: 4 } }).png().toFile(ruta)

  return ruta
}

beforeAll(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'diagnostico-'))
})

afterAll(async () => {
  await rm(carpeta, { recursive: true, force: true })
})

describe('analizarColores', () => {
  it('encuentra los colores que hay en la imagen', async () => {
    const cubetas = await analizarColores(await escribirPlanito())

    expect(cubetas).toHaveLength(2)
  })

  it('ordena de más a menos frecuente', async () => {
    const [primera, segunda] = await analizarColores(await escribirPlanito())

    // 7 columnas blancas contra 3 verdes.
    expect(primera.pixeles).toBe(7 * ALTO)
    expect(segunda.pixeles).toBe(3 * ALTO)
  })

  it('reporta el color en HSV, que es como se eligen los umbrales', async () => {
    const cubetas = await analizarColores(await escribirPlanito())
    const verde = cubetas.find((cubeta) => cubeta.saturacion > 0.1)

    expect(verde?.tono).toBeGreaterThan(45)
    expect(verde?.tono).toBeLessThan(110)
    expect(verde?.muestra).toEqual(VERDE)
  })

  it('agrupa colores casi iguales en la misma cubeta', async () => {
    const datos = Buffer.alloc(ANCHO * ALTO * 4)

    for (let indice = 0; indice < ANCHO * ALTO; indice += 1) {
      const base = indice * 4
      // Ruido de un punto: el mismo verde a los ojos.
      datos[base] = VERDE[0] + (indice % 2)
      datos[base + 1] = VERDE[1]
      datos[base + 2] = VERDE[2]
      datos[base + 3] = 255
    }

    const ruta = join(carpeta, 'ruido.png')
    await sharp(datos, { raw: { width: ANCHO, height: ALTO, channels: 4 } }).png().toFile(ruta)

    expect(await analizarColores(ruta)).toHaveLength(1)
  })
})

describe('formatearInforme', () => {
  it('arma una línea legible por color', async () => {
    const informe = formatearInforme(await analizarColores(await escribirPlanito()))

    expect(informe).toContain('#a8c480')
    expect(informe).toContain('#ffffff')
    expect(informe).toContain('px')
  })

  it('explica cómo usar el informe para elegir el umbral', async () => {
    expect(formatearInforme([])).toMatch(/valorMin/)
  })
})
