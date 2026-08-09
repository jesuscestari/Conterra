import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { prepararBase } from '../ayuda/baseDePrueba'

const base = await prepararBase()

// Importacion dinamica: `@/lib/db` lee DATABASE_URL al importarse.
const { prisma } = await import('@/lib/db')
const { ErrorHttp } = await import('@/lib/api/errores')
const { identificarCliente, limpiarIntentos, registrarIntento } = await import('@/lib/api/limite')

const VENTANA_MS = 60_000
const MAXIMO = 3
const CLAVE = 'login:203.0.113.7'

const intentar = (clave = CLAVE): Promise<void> =>
  registrarIntento({ clave, maximoIntentos: MAXIMO, ventanaMs: VENTANA_MS })

const agotarMaximo = async (clave = CLAVE): Promise<void> => {
  for (let i = 0; i < MAXIMO; i += 1) await intentar(clave)
}

/** Adelanta el reloj de la ventana corriendo su vencimiento hacia atras. */
const vencerVentana = async (clave = CLAVE): Promise<void> => {
  await prisma.intentoAcceso.update({
    where: { clave },
    data: { reiniciaEn: new Date(Date.now() - 1000) },
  })
}

const fallo = async (clave = CLAVE): Promise<InstanceType<typeof ErrorHttp>> => {
  const capturado = await intentar(clave).then(
    () => null,
    (error: unknown) => error,
  )

  expect(capturado).toBeInstanceOf(ErrorHttp)

  return capturado as InstanceType<typeof ErrorHttp>
}

beforeEach(async () => {
  await prisma.intentoAcceso.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
  await base.cerrar()
})

describe('registrarIntento', () => {
  it('deja pasar hasta el máximo de intentos', async () => {
    await expect(agotarMaximo()).resolves.toBeUndefined()
  })

  it('bloquea el intento siguiente al máximo', async () => {
    await agotarMaximo()

    await expect(intentar()).rejects.toBeInstanceOf(ErrorHttp)
  })

  it('responde 429 y dice cuánto falta', async () => {
    await agotarMaximo()

    const error = await fallo()

    expect(error.estado).toBe(429)
    expect(error.message).toMatch(/Probá de nuevo en \d+ segundos/)
  })

  it('sigue bloqueando mientras la ventana no venza', async () => {
    await agotarMaximo()

    await expect(intentar()).rejects.toThrow()
    await expect(intentar()).rejects.toThrow()
  })

  it('vuelve a permitir cuando vence la ventana', async () => {
    await agotarMaximo()
    await expect(intentar()).rejects.toThrow()

    await vencerVentana()

    await expect(intentar()).resolves.toBeUndefined()
  })

  it('arranca una ventana nueva después de vencer, no hereda el contador', async () => {
    await agotarMaximo()
    await vencerVentana()

    // Si arrastrara el contador viejo, el primero de estos ya bloquearia.
    await expect(agotarMaximo()).resolves.toBeUndefined()
  })

  it('cuenta cada clave por separado, así una IP no bloquea a otra', async () => {
    await agotarMaximo()

    await expect(intentar('login:198.51.100.4')).resolves.toBeUndefined()
  })

  /**
   * Es la razon de moverlo a la base: antes vivia en memoria del proceso y
   * cualquier reinicio, o una segunda instancia, dejaba el contador en cero.
   */
  it('el contador sobrevive a que se reinicie el proceso', async () => {
    await agotarMaximo()

    // Un proceso nuevo no comparte nada con este salvo la base.
    const fila = await prisma.intentoAcceso.findUnique({ where: { clave: CLAVE } })

    expect(fila?.intentos).toBe(MAXIMO)
  })

  it('borra las ventanas vencidas de otras claves', async () => {
    await intentar('login:vieja')
    await vencerVentana('login:vieja')

    await intentar()

    expect(await prisma.intentoAcceso.findUnique({ where: { clave: 'login:vieja' } })).toBeNull()
  })
})

describe('limpiarIntentos', () => {
  it('borra el historial de la clave', async () => {
    await agotarMaximo()

    await limpiarIntentos(CLAVE)

    await expect(intentar()).resolves.toBeUndefined()
  })

  it('no toca las demás claves', async () => {
    await intentar('login:otra')

    await limpiarIntentos(CLAVE)

    expect(await prisma.intentoAcceso.findUnique({ where: { clave: 'login:otra' } })).not.toBeNull()
  })

  it('no se queja de una clave que no existe', async () => {
    await expect(limpiarIntentos('nunca-vista')).resolves.toBeUndefined()
  })
})

describe('identificarCliente', () => {
  const conCabeceras = (cabeceras: Record<string, string>): Request =>
    new Request('http://localhost/api/login', { headers: cabeceras })

  it('usa la primera IP de x-forwarded-for, que es la del cliente real', () => {
    expect(identificarCliente(conCabeceras({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      '203.0.113.7',
    )
  })

  it('recorta los espacios de la cabecera', () => {
    expect(identificarCliente(conCabeceras({ 'x-forwarded-for': '  203.0.113.7  ' }))).toBe(
      '203.0.113.7',
    )
  })

  it('cae en x-real-ip si no hay x-forwarded-for', () => {
    expect(identificarCliente(conCabeceras({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
  })

  /** Sin cabeceras de proxy todos comparten cubeta: es restrictivo, no permisivo. */
  it('devuelve un identificador fijo cuando no puede saber quién es', () => {
    expect(identificarCliente(conCabeceras({}))).toBe('desconocido')
    expect(identificarCliente(conCabeceras({ 'x-forwarded-for': '' }))).toBe('desconocido')
  })
})
