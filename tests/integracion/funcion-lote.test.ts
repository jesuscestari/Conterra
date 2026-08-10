import type { Context } from '@netlify/functions'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ADMIN = { id: 'adm-1', email: 'admin@lotes.test', nombre: 'Admin' }

const actualizarLote = vi.fn(async (id: string) => ({
  id,
  numero: 1,
  superficieM2: 650,
  precioUsd: null,
  estado: 'DISPONIBLE',
  observacion: null,
  editadoEn: '2026-01-01T00:00:00.000Z',
}))

vi.mock('@/lib/auth/guardia', () => ({ requerirAdmin: async () => ADMIN }))
vi.mock('@/lib/lotes/repositorio', () => ({ actualizarLote: (id: string) => actualizarLote(id) }))

const manejador = (await import('../../netlify/functions/lote.mts')).default

const peticion = (id: string): Request =>
  new Request(`https://ejemplo.test/api/lotes/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ estado: 'VENDIDO' }),
  })

/** Solo se usa `params`; el resto del contexto de Netlify no interviene. */
const contexto = (params: Record<string, string>): Context =>
  ({ params }) as unknown as Context

beforeEach(() => {
  actualizarLote.mockClear()
})

describe('PATCH /api/lotes/:id', () => {
  it('edita el lote cuando llega el parámetro', async () => {
    const respuesta = await manejador(peticion('L001'), contexto({ id: 'L001' }))

    expect(respuesta.status).toBe(200)
    expect(actualizarLote).toHaveBeenCalledWith('L001')
  })

  /**
   * Regresión: ante un 404 Netlify reintenta la ruta con `.html` e
   * `/index.html`. Con el segmento de más, `/api/lotes/:id` no matchea y
   * `params` llega vacío. Antes ese `undefined` viajaba hasta Prisma y el 404
   * legítimo salía como un 500 con stack en los logs.
   */
  it('responde 404 y no toca la base si falta el parámetro', async () => {
    const respuesta = await manejador(peticion('L999/index.html'), contexto({}))

    expect(respuesta.status).toBe(404)
    expect(actualizarLote).not.toHaveBeenCalled()
  })
})
