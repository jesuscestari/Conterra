import { z } from 'zod'

const PRECIO_MAXIMO_USD = 100_000_000
const NOMBRE_MAXIMO = 40

/**
 * Color de relleno en hexadecimal de seis digitos.
 *
 * Se exige la forma larga y no la corta de tres para que el valor guardado sea
 * siempre comparable: `#fff` y `#ffffff` son el mismo color pero distinto texto,
 * y eso complica detectar colores repetidos entre categorias.
 */
const esquemaColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'El color tiene que ser hexadecimal, con la forma #rrggbb.')
  .transform((valor) => valor.toLowerCase())

const esquemaNombre = z
  .string()
  .trim()
  .min(1, 'La categoría necesita un nombre.')
  .max(NOMBRE_MAXIMO, `El nombre no puede superar los ${NOMBRE_MAXIMO} caracteres.`)

const esquemaPrecio = z
  .number({ message: 'El precio tiene que ser un número.' })
  .int('El precio se carga en dólares enteros.')
  .min(0, 'El precio no puede ser negativo.')
  .max(PRECIO_MAXIMO_USD, 'El precio supera el máximo permitido.')
  .nullable()

const esquemaOrden = z
  .number({ message: 'El orden tiene que ser un número.' })
  .int('El orden tiene que ser entero.')
  .min(0, 'El orden no puede ser negativo.')
  .max(9999, 'El orden supera el máximo permitido.')

export const esquemaNuevaCategoria = z.object({
  nombre: esquemaNombre,
  color: esquemaColor,
  precioUsd: esquemaPrecio.default(null),
  orden: esquemaOrden.default(0),
})

export const esquemaActualizacionCategoria = z
  .object({
    nombre: esquemaNombre,
    color: esquemaColor,
    precioUsd: esquemaPrecio,
    orden: esquemaOrden,
  })
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No enviaste ningún cambio.',
  })

export type NuevaCategoria = z.infer<typeof esquemaNuevaCategoria>
export type ActualizacionCategoria = z.infer<typeof esquemaActualizacionCategoria>
