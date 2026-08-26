import { afterEach, describe, expect, it, vi } from 'vitest'

import { leerNumeracionOficial } from '../../scripts/vectorizar-plano/numeracionOficial'

afterEach(() => {
  vi.doUnmock('node:fs/promises')
  vi.resetModules()
})

/** Recarga el módulo con `readFile` reemplazado, para probar los fallos de lectura. */
const conLecturaQueFalla = async (error: Error) => {
  vi.resetModules()
  vi.doMock('node:fs/promises', () => ({
    readFile: () => Promise.reject(error),
  }))

  return import('../../scripts/vectorizar-plano/numeracionOficial')
}

describe('leerNumeracionOficial', () => {
  it('lee el archivo real del proyecto', async () => {
    const numeracion = await leerNumeracionOficial()

    expect(numeracion.size).toBe(462)
  })

  it('indexa por el id posicional del vectorizador', async () => {
    const numeracion = await leerNumeracionOficial()

    for (const [clave, lote] of numeracion) {
      expect(clave).toMatch(/^L\d{3}$/)
      expect(lote.idPosicional).toBe(clave)
    }
  })

  /**
   * El id final del lote se deriva de este numero, asi que dos lotes con el
   * mismo numero producirian el mismo id y uno pisaria al otro.
   */
  it('los números oficiales del archivo no se repiten', async () => {
    const numeros = [...(await leerNumeracionOficial()).values()].map((lote) => lote.numero)

    expect(new Set(numeros).size).toBe(numeros.length)
  })

  it('los números cubren el 1 al 462 sin huecos', async () => {
    const numeros = [...(await leerNumeracionOficial()).values()]
      .map((lote) => lote.numero)
      .sort((uno, otro) => uno - otro)

    expect(numeros[0]).toBe(1)
    expect(numeros.at(-1)).toBe(462)
  })

  it('la superficie es un número o falta, nunca otra cosa', async () => {
    for (const lote of (await leerNumeracionOficial()).values()) {
      if (lote.superficieM2 === null) continue

      expect(lote.superficieM2).toBeGreaterThan(0)
    }
  })

  /**
   * Sin el archivo el vectorizador tiene que poder correr igual, con su
   * numeracion posicional: es una entrada opcional, no un requisito.
   */
  it('devuelve un mapa vacío si el archivo no existe', async () => {
    const sinArchivo = Object.assign(new Error('no existe'), { code: 'ENOENT' })
    const modulo = await conLecturaQueFalla(sinArchivo)

    await expect(modulo.leerNumeracionOficial()).resolves.toEqual(new Map())
  })

  /** Un archivo ilegible sí es un problema: se avisa en vez de seguir sin numeración. */
  it('falla nombrando el archivo si no se puede leer por otro motivo', async () => {
    const sinPermiso = Object.assign(new Error('permiso denegado'), { code: 'EACCES' })
    const modulo = await conLecturaQueFalla(sinPermiso)

    await expect(modulo.leerNumeracionOficial()).rejects.toThrow(/numeracion-oficial\.json/)
  })
})
