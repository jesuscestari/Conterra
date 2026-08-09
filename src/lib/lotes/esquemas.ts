import { z } from 'zod'

import { ESTADOS_LOTE } from '../plano/estado'

/** Tope alto pero finito, para que un dedo pesado no cargue un precio absurdo. */
const PRECIO_MAXIMO_USD = 100_000_000
const SUPERFICIE_MAXIMA_M2 = 100_000
const OBSERVACION_MAXIMA = 500

const textoOpcional = z
  .string()
  .trim()
  .max(OBSERVACION_MAXIMA, `La observación no puede superar los ${OBSERVACION_MAXIMA} caracteres.`)
  .transform((valor) => (valor.length === 0 ? null : valor))

export const esquemaEstado = z.enum(ESTADOS_LOTE, {
  message: 'El estado indicado no es válido.',
})

/**
 * Actualizacion parcial de un lote. Sirve tanto para el formulario de edicion
 * completo como para el cambio rapido de estado, que manda solo `estado`.
 */
export const esquemaActualizacionLote = z
  .object({
    /**
     * El número oficial es editable porque el emparejamiento automático entre
     * el plano de mensura y el de marketing deja algunos lotes cambiados.
     */
    numero: z
      .number({ message: 'El número de lote tiene que ser un número.' })
      .int('El número de lote tiene que ser entero.')
      .min(1, 'El número de lote tiene que ser mayor a cero.')
      .max(9999, 'El número de lote supera el máximo permitido.'),
    estado: esquemaEstado,
    precioUsd: z
      .number({ message: 'El precio tiene que ser un número.' })
      .int('El precio se carga en dólares enteros.')
      .min(0, 'El precio no puede ser negativo.')
      .max(PRECIO_MAXIMO_USD, 'El precio supera el máximo permitido.')
      .nullable(),
    superficieM2: z
      .number({ message: 'La superficie tiene que ser un número.' })
      .positive('La superficie tiene que ser mayor a cero.')
      .max(SUPERFICIE_MAXIMA_M2, 'La superficie supera el máximo permitido.'),
    observacion: textoOpcional.nullable(),
  })
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No enviaste ningún cambio.',
  })

export type ActualizacionLote = z.infer<typeof esquemaActualizacionLote>
