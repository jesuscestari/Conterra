import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  ErrorHttp,
  datosInvalidos,
  noAutorizado,
  noEncontrado,
  responderError,
} from '@/lib/api/errores'

interface CuerpoLeido {
  readonly error: string
  readonly detalles?: Record<string, string[]>
}

const leer = async (respuesta: Response): Promise<CuerpoLeido> =>
  (await respuesta.json()) as CuerpoLeido

describe('constructores de error', () => {
  it('noAutorizado responde 401', () => {
    expect(noAutorizado().estado).toBe(401)
    expect(noAutorizado().message).toMatch(/iniciar sesión/)
  })

  it('noEncontrado responde 404', () => {
    expect(noEncontrado().estado).toBe(404)
  })

  it('datosInvalidos responde 400 con el mensaje dado', () => {
    const error = datosInvalidos('El número ya está en uso.')

    expect(error.estado).toBe(400)
    expect(error.message).toBe('El número ya está en uso.')
  })

  it('admiten un mensaje propio', () => {
    expect(noEncontrado('No existe ese lote.').message).toBe('No existe ese lote.')
  })
})

describe('responderError', () => {
  it('traduce un ErrorHttp a su código y mensaje', async () => {
    const respuesta = responderError(new ErrorHttp(429, 'Demasiados intentos.'))

    expect(respuesta.status).toBe(429)
    expect((await leer(respuesta)).error).toBe('Demasiados intentos.')
  })

  it('traduce un ZodError a un 400 con los mensajes por campo', async () => {
    const esquema = z.object({ numero: z.number().int(), estado: z.string() })
    const fallo = esquema.safeParse({ numero: 1.5, estado: 42 })

    const respuesta = responderError(fallo.error)
    const cuerpo = await leer(respuesta)

    expect(respuesta.status).toBe(400)
    expect(cuerpo.error).toMatch(/Revisá los datos/)
    expect(cuerpo.detalles?.numero).toHaveLength(1)
    expect(cuerpo.detalles?.estado).toHaveLength(1)
  })

  it('junta varios mensajes del mismo campo en vez de quedarse con el último', async () => {
    const error = new z.ZodError([
      { code: 'custom', path: ['numero'], message: 'tiene que ser entero' },
      { code: 'custom', path: ['numero'], message: 'tiene que ser mayor a cero' },
    ])

    const cuerpo = await leer(responderError(error))

    expect(cuerpo.detalles?.numero).toEqual([
      'tiene que ser entero',
      'tiene que ser mayor a cero',
    ])
  })

  it('agrupa bajo "general" los errores que no apuntan a un campo', async () => {
    const error = new z.ZodError([
      { code: 'custom', path: [], message: 'No enviaste ningún cambio.' },
    ])

    const cuerpo = await leer(responderError(error))

    expect(cuerpo.detalles?.general).toEqual(['No enviaste ningún cambio.'])
  })

  /**
   * Un error inesperado no puede filtrar el stack ni el detalle del motor de
   * base de datos: sale como 500 generico y el detalle queda en el servidor.
   */
  it('no filtra detalles internos de un error inesperado', async () => {
    const silenciado = vi.spyOn(process.stderr, 'write').mockReturnValue(true)

    const respuesta = responderError(
      new Error('error: relation "Lote" does not exist at db.internal:5432'),
    )
    const cuerpo = await leer(respuesta)

    expect(respuesta.status).toBe(500)
    expect(cuerpo.error).toBe('Ocurrió un error inesperado.')
    expect(JSON.stringify(cuerpo)).not.toContain('relation')
    expect(JSON.stringify(cuerpo)).not.toContain('5432')

    silenciado.mockRestore()
  })

  it('registra el error inesperado en el servidor', () => {
    const silenciado = vi.spyOn(process.stderr, 'write').mockReturnValue(true)

    responderError(new Error('algo raro'))

    expect(silenciado).toHaveBeenCalledOnce()
    expect(String(silenciado.mock.calls[0][0])).toContain('algo raro')

    silenciado.mockRestore()
  })

  it('maneja excepciones que ni siquiera son Error', async () => {
    const silenciado = vi.spyOn(process.stderr, 'write').mockReturnValue(true)

    const respuesta = responderError('se rompió todo')

    expect(respuesta.status).toBe(500)
    expect((await leer(respuesta)).error).toBe('Ocurrió un error inesperado.')

    silenciado.mockRestore()
  })
})
