import { afterEach, describe, expect, it, vi } from 'vitest'

import { ErrorApi, pedirJson } from '@/lib/api/cliente'

const responder = (cuerpo: unknown, estado = 200): Response =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  })

const simularFetch = (implementacion: typeof fetch): void => {
  vi.stubGlobal('fetch', vi.fn(implementacion))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pedirJson', () => {
  it('devuelve el cuerpo ya parseado', async () => {
    simularFetch(async () => responder({ lotes: [{ numero: 1 }] }))

    await expect(pedirJson('/api/lotes')).resolves.toEqual({ lotes: [{ numero: 1 }] })
  })

  it('manda JSON por defecto sin pisar las cabeceras propias', async () => {
    simularFetch(async () => responder({}))

    await pedirJson('/api/lotes/1', {
      method: 'PATCH',
      headers: { 'X-Origen': 'test' },
      body: '{"estado":"VENDIDO"}',
    })

    const [, opciones] = vi.mocked(fetch).mock.calls[0]
    const cabeceras = opciones?.headers as Record<string, string>

    expect(cabeceras['Content-Type']).toBe('application/json')
    expect(cabeceras['X-Origen']).toBe('test')
    expect(opciones?.method).toBe('PATCH')
  })

  it('deja que quien llama cambie el Content-Type', async () => {
    simularFetch(async () => responder({}))

    await pedirJson('/api/algo', { headers: { 'Content-Type': 'text/plain' } })

    const [, opciones] = vi.mocked(fetch).mock.calls[0]

    expect((opciones?.headers as Record<string, string>)['Content-Type']).toBe('text/plain')
  })

  it('propaga el mensaje que mandó el servidor', async () => {
    simularFetch(async () => responder({ error: 'No se encontró el lote.' }, 404))

    await expect(pedirJson('/api/lotes/999')).rejects.toThrow('No se encontró el lote.')
  })

  it('conserva el código de estado en el error', async () => {
    simularFetch(async () => responder({ error: 'Necesitás iniciar sesión.' }, 401))

    await expect(pedirJson('/api/lotes/1')).rejects.toMatchObject({ estado: 401 })
  })

  /** Un 500 de Next puede devolver HTML; el popup igual tiene que mostrar algo util. */
  it('arma un mensaje genérico si la respuesta de error no es JSON', async () => {
    simularFetch(async () => new Response('<html>Server Error</html>', { status: 500 }))

    await expect(pedirJson('/api/lotes')).rejects.toThrow(/La solicitud falló \(500\)/)
  })

  it('arma un mensaje genérico si el JSON de error no trae campo error', async () => {
    simularFetch(async () => responder({ otraCosa: true }, 400))

    await expect(pedirJson('/api/lotes')).rejects.toThrow(/La solicitud falló \(400\)/)
  })

  it('distingue la caída de red del error de la API', async () => {
    simularFetch(async () => {
      throw new TypeError('Failed to fetch')
    })

    const fallo = await pedirJson('/api/lotes').catch((error: unknown) => error)

    expect(fallo).toBeInstanceOf(ErrorApi)
    expect((fallo as ErrorApi).estado).toBe(0)
    expect((fallo as ErrorApi).message).toMatch(/Revisá tu conexión/)
  })

  it('siempre falla con un ErrorApi, así el llamador tiene un solo tipo que atajar', async () => {
    simularFetch(async () => responder({ error: 'ups' }, 503))

    await expect(pedirJson('/api/lotes')).rejects.toBeInstanceOf(ErrorApi)
  })
})
