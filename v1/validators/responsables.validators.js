import { z } from 'zod'

const objectId = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    'El ID no es válido'
  )

export const createResponsableSchema = z.object({
  paciente: objectId,

  nombre: z
    .string({
      required_error: 'El nombre es obligatorio'
    })
    .trim()
    .min(2)
    .max(100),

  apellido: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default(''),

  relacion: z
    .string({
      required_error: 'La relación con el paciente es obligatoria'
    })
    .trim()
    .min(2)
    .max(50),

  telefono: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default(''),

  email: z
    .union([
      z.string().trim().email('El email no es válido'),
      z.literal('')
    ])
    .optional()
    .default(''),

  principal: z
    .boolean()
    .optional()
    .default(false),

  contactoEmergencia: z
    .boolean()
    .optional()
    .default(false),

  observaciones: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .default('')
})

export const updateResponsableSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  apellido: z
    .string()
    .trim()
    .max(100)
    .optional(),

  relacion: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .optional(),

  telefono: z
    .string()
    .trim()
    .max(30)
    .optional(),

  email: z
    .union([
      z.string().trim().email('El email no es válido'),
      z.literal('')
    ])
    .optional(),

  principal: z
    .boolean()
    .optional(),

  contactoEmergencia: z
    .boolean()
    .optional(),

  observaciones: z
    .string()
    .trim()
    .max(5000)
    .optional()
})
