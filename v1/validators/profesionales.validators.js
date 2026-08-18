import { z } from 'zod'

export const createProfesionalSchema = z.object({
  nombre: z
    .string({
      required_error: 'El nombre es obligatorio'
    })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),

  apellido: z
    .string({
      required_error: 'El apellido es obligatorio'
    })
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido es demasiado largo'),

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
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga'),

  profesion: z
    .string({
      required_error: 'La profesión es obligatoria'
    })
    .trim()
    .min(2, 'La profesión debe tener al menos 2 caracteres')
    .max(100, 'La profesión es demasiado larga'),

  telefono: z
    .string()
    .trim()
    .max(30, 'El teléfono es demasiado largo')
    .optional()
    .default('')
})

export const updateProfesionalSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  apellido: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  email: z
    .string()
    .trim()
    .email('El email no es válido')
    .toLowerCase()
    .optional(),

  profesion: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  telefono: z
    .string()
    .trim()
    .max(30)
    .optional()
})

export const changeProfesionalStatusSchema = z.object({
  activo: z.boolean({
    required_error: 'El estado activo es obligatorio'
  })
})