import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { leerArgumentos } from '../../scripts/vectorizar-plano/argumentos'
import { RUTAS } from '../../scripts/vectorizar-plano/config'

describe('leerArgumentos', () => {
  it('usa las rutas de la config cuando no se pasa nada', () => {
    expect(leerArgumentos([])).toEqual({
      imagen: RUTAS.imagen,
      salida: RUTAS.salida,
      previsualizacion: RUTAS.previsualizacion,
      soloDiagnostico: false,
    })
  })

  it('resuelve las rutas relativas contra el directorio actual', () => {
    const { imagen } = leerArgumentos(['--imagen', 'public/plano-prueba.png'])

    expect(imagen).toBe(path.resolve(process.cwd(), 'public/plano-prueba.png'))
  })

  it('lee las tres rutas por separado', () => {
    const argumentos = leerArgumentos([
      '--imagen',
      'a.png',
      '--salida',
      'b.json',
      '--previsualizacion',
      'c.svg',
    ])

    expect(path.basename(argumentos.imagen)).toBe('a.png')
    expect(path.basename(argumentos.salida)).toBe('b.json')
    expect(path.basename(argumentos.previsualizacion)).toBe('c.svg')
  })

  it('reconoce el modo diagnóstico', () => {
    expect(leerArgumentos(['--diagnostico']).soloDiagnostico).toBe(true)
  })

  it('falla si a una opción le falta el valor', () => {
    expect(() => leerArgumentos(['--imagen'])).toThrow(/--imagen necesita un valor/)
  })

  /** Sin este control, `--imagen --diagnostico` tomaria la bandera como ruta. */
  it('no toma la opción siguiente como valor', () => {
    expect(() => leerArgumentos(['--imagen', '--diagnostico'])).toThrow(/necesita un valor/)
  })

  it('ignora opciones que no conoce', () => {
    expect(leerArgumentos(['--otra-cosa', 'x']).imagen).toBe(RUTAS.imagen)
  })
})
