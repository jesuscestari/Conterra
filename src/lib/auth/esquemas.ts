import { z } from 'zod'

export const esquemaLogin = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresá tu email.')
    .email('El email no tiene un formato válido.')
    .toLowerCase(),
  password: z.string().min(1, 'Ingresá tu contraseña.').max(200),
})

export type DatosLogin = z.infer<typeof esquemaLogin>
