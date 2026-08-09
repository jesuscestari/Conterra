import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  escribirGeometria,
  escribirPrevisualizacion,
} from '../../scripts/vectorizar-plano/salida'

import { unPlano, unaParcela } from '../ayuda/geometria'

const GEOMETRIA = unPlano([unaParcela('a', 1, [0, 0], 20), unaParcela('b', 2, [40, 20], 20)])

let carpeta = ''

beforeAll(async () => {
  carpeta = await mkdtemp(join(tmpdir(), 'salida-'))
})

afterAll(async () => {
  await rm(carpeta, { recursive: true, force: true })
})

describe('escribirGeometria', () => {
  it('escribe un JSON que se vuelve a leer igual', async () => {
    const ruta = join(carpeta, 'geometria.json')

    await escribirGeometria(ruta, GEOMETRIA)

    expect(JSON.parse(await readFile(ruta, 'utf8'))).toEqual(GEOMETRIA)
  })

  it('crea las carpetas que falten', async () => {
    const ruta = join(carpeta, 'una', 'otra', 'geometria.json')

    await escribirGeometria(ruta, GEOMETRIA)

    expect((await readFile(ruta, 'utf8')).length).toBeGreaterThan(0)
  })

  it('explica el problema si la ruta no sirve', async () => {
    // Una carpeta no se puede sobrescribir con un archivo.
    await expect(escribirGeometria(carpeta, GEOMETRIA)).rejects.toThrow(
      /No se pudo escribir la geometria/,
    )
  })
})

describe('escribirPrevisualizacion', () => {
  const leerSvg = async (nombre: string): Promise<string> => {
    const ruta = join(carpeta, nombre)
    await escribirPrevisualizacion(ruta, GEOMETRIA)

    return readFile(ruta, 'utf8')
  }

  it('genera un SVG con el tamaño del plano', async () => {
    const svg = await leerSvg('control.svg')

    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('viewBox="0 0 100 60"')
  })

  it('dibuja un polígono por parcela', async () => {
    const svg = await leerSvg('poligonos.svg')

    expect(svg.match(/<polygon /g)).toHaveLength(GEOMETRIA.lotes.length)
    expect(svg).toContain('points="0,0 20,0 20,20"')
  })

  it('escribe el número de cada parcela en su centroide', async () => {
    const svg = await leerSvg('numeros.svg')

    expect(svg).toContain('<text x="10" y="10"')
    expect(svg).toContain('>1</text>')
    expect(svg).toContain('>2</text>')
  })

  it('explica el problema si la ruta no sirve', async () => {
    await expect(escribirPrevisualizacion(carpeta, GEOMETRIA)).rejects.toThrow(
      /No se pudo escribir la previsualizacion/,
    )
  })
})
