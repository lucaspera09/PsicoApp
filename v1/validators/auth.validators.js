import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'El email es obligatorio'
    })
    .trim()
    .email('El email no es válido')
    .toLowerCase(),

  password: z
    .string({
      required_error: 'La contraseña es obligatoria'
    })
    .min(1, 'La contraseña es obligatoria')
})