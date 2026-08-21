import { z } from 'zod'

export const loginSchema =
  z.object({
    email: z
      .string({
        required_error:
          'El email es obligatorio'
      })
      .trim()
      .email(
        'El email no es válido'
      )
      .toLowerCase(),

    password: z
      .string({
        required_error:
          'La contraseña es obligatoria'
      })
      .min(
        1,
        'La contraseña es obligatoria'
      )
  })

export const registroProfesionalSchema =
  z.object({
    nombre: z
      .string({
        required_error:
          'El nombre es obligatorio'
      })
      .trim()
      .min(
        2,
        'El nombre debe tener al menos 2 caracteres'
      ),

    apellido: z
      .string({
        required_error:
          'El apellido es obligatorio'
      })
      .trim()
      .min(
        2,
        'El apellido debe tener al menos 2 caracteres'
      ),

    profesion: z
      .string({
        required_error:
          'La profesión es obligatoria'
      })
      .trim()
      .min(
        2,
        'La profesión es obligatoria'
      ),

    telefono: z
      .string()
      .trim()
      .optional()
      .default(''),

    email: z
      .string({
        required_error:
          'El email es obligatorio'
      })
      .trim()
      .email(
        'El email no es válido'
      )
      .toLowerCase(),

    password: z
      .string({
        required_error:
          'La contraseña es obligatoria'
      })
      .min(
        8,
        'La contraseña debe tener al menos 8 caracteres'
      )
      .max(
        100,
        'La contraseña es demasiado larga'
      )
  })