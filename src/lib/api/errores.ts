import { ZodError } from 'zod'

/** Error con codigo HTTP y mensaje pensado para mostrarle al usuario. */
export class ErrorHttp extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje)
    this.name = 'ErrorHttp'
  }
}

export const noAutorizado = (mensaje = 'Necesitás iniciar sesión.'): ErrorHttp =>
  new ErrorHttp(401, mensaje)

export const noEncontrado = (mensaje = 'No se encontró el recurso.'): ErrorHttp =>
  new ErrorHttp(404, mensaje)

export const datosInvalidos = (mensaje: string): ErrorHttp => new ErrorHttp(400, mensaje)

interface CuerpoDeError {
  readonly error: string
  readonly detalles?: Readonly<Record<string, readonly string[]>>
}

const mensajeDeZod = (error: ZodError): CuerpoDeError => ({
  error: 'Revisá los datos ingresados.',
  detalles: error.issues.reduce<Record<string, string[]>>((acumulado, incidencia) => {
    const campo = incidencia.path.join('.') || 'general'

    return { ...acumulado, [campo]: [...(acumulado[campo] ?? []), incidencia.message] }
  }, {}),
})

/**
 * Traduce cualquier excepcion a una respuesta JSON. Los errores inesperados se
 * registran en el servidor y salen al cliente como un 500 generico, para no
 * filtrar detalles internos.
 */
export const responderError = (error: unknown): Response => {
  if (error instanceof ZodError) {
    return Response.json(mensajeDeZod(error) satisfies CuerpoDeError, { status: 400 })
  }

  if (error instanceof ErrorHttp) {
    return Response.json({ error: error.message } satisfies CuerpoDeError, {
      status: error.estado,
    })
  }

  process.stderr.write(
    `[api] Error inesperado: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`,
  )

  return Response.json({ error: 'Ocurrió un error inesperado.' } satisfies CuerpoDeError, {
    status: 500,
  })
}
