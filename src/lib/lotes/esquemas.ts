import { z } from 'zod'

import { ESTADOS_LOTE } from '../plano/estado'

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
    /**
     * Tramo comercial del lote. Reemplaza al viejo `precioUsd`: desde que las
     * categorías son datos, el precio se define una vez por tramo y el lote
     * solo apunta a cuál le toca.
     *
     * `null` deja al lote sin tramo, que es lo correcto para uno fuera de
     * comercialización.
     */
    categoriaId: z
      .string({ message: 'La categoría tiene que ser un identificador.' })
      .trim()
      .min(1, 'La categoría no puede estar vacía.')
      .nullable(),
    superficieM2: z
      .number({ message: 'La superficie tiene que ser un número.' })
      .positive('La superficie tiene que ser mayor a cero.')
      .max(SUPERFICIE_MAXIMA_M2, 'La superficie supera el máximo permitido.'),
    observacion: textoOpcional.nullable(),
  })
  // Estricto a proposito: cuando el precio se mudo del lote a la categoria, un
  // cliente viejo que siguiera mandando `precioUsd` habria visto un 200 con el
  // precio descartado en silencio. Asi recibe un error y se entera.
  .strict()
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No enviaste ningún cambio.',
  })

export type ActualizacionLote = z.infer<typeof esquemaActualizacionLote>
