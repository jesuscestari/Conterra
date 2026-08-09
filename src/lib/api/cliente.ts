interface CuerpoDeError {
  readonly error?: string
}

/** Error de red o de la API, ya con un mensaje mostrable al usuario. */
export class ErrorApi extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje)
    this.name = 'ErrorApi'
  }
}

const leerMensaje = async (respuesta: Response): Promise<string> => {
  try {
    const cuerpo: CuerpoDeError = await respuesta.json()

    return cuerpo.error ?? `La solicitud falló (${respuesta.status}).`
  } catch {
    return `La solicitud falló (${respuesta.status}).`
  }
}

/**
 * `fetch` con manejo de errores unificado: cualquier respuesta que no sea 2xx
 * se convierte en un ErrorApi con el mensaje que mando el servidor.
 *
 * Las rutas van absolutas desde la raiz del dominio: el plano vive dentro del
 * sitio principal, no colgado de un prefijo, asi que no hay nada que anteponer.
 */
export const pedirJson = async <T>(url: string, opciones?: RequestInit): Promise<T> => {
  let respuesta: Response

  try {
    respuesta = await fetch(url, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones?.headers },
    })
  } catch (error) {
    throw new ErrorApi(
      0,
      `No se pudo conectar con el servidor. Revisá tu conexión. (${
        error instanceof Error ? error.message : String(error)
      })`,
    )
  }

  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, await leerMensaje(respuesta))
  }

  return respuesta.json() as Promise<T>
}
