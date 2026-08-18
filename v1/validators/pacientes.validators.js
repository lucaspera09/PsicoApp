import { z } from 'zod'

const fechaValida = z
  .string()
  .refine(
    (fecha) => !Number.isNaN(Date.parse(fecha)),
    'La fecha no es válida'
  )

const fechaNacimientoValida = fechaValida.refine(
  (fecha) => new Date(fecha) <= new Date(),
  'La fecha de nacimiento no puede ser futura'
)

export const createPacienteSchema = z.object({
  nombre: z
    .string({
      required_error: 'El nombre es obligatorio'
    })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100),

  apellido: z
    .string({
      required_error: 'El apellido es obligatorio'
    })
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100),

  fechaNacimiento: fechaNacimientoValida,

  documento: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default(''),

  foto: z
    .string()
    .trim()
    .optional()
    .default(''),

  fechaIngreso: fechaValida.optional(),

  enfermedades: z
    .array(z.string().trim().min(1))
    .optional()
    .default([]),

  alergias: z
    .array(z.string().trim().min(1))
    .optional()
    .default([]),

  medicamentos: z
    .array(z.string().trim().min(1))
    .optional()
    .default([]),

  antecedentes: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .default(''),

  informacionImportante: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .default(''),

  observacionesGenerales: z
    .string()
    .trim()
    .max(10000)
    .optional()
    .default('')
})

export const updatePacienteSchema = z.object({
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

  fechaNacimiento: fechaNacimientoValida.optional(),

  documento: z
    .string()
    .trim()
    .max(50)
    .optional(),

  foto: z
    .string()
    .trim()
    .optional(),

  fechaIngreso: fechaValida.optional(),

  enfermedades: z
    .array(z.string().trim().min(1))
    .optional(),

  alergias: z
    .array(z.string().trim().min(1))
    .optional(),

  medicamentos: z
    .array(z.string().trim().min(1))
    .optional(),

  antecedentes: z
    .string()
    .trim()
    .max(5000)
    .optional(),

  informacionImportante: z
    .string()
    .trim()
    .max(5000)
    .optional(),

  observacionesGenerales: z
    .string()
    .trim()
    .max(10000)
    .optional()
})

export const changePacienteStatusSchema = z.object({
  activo: z.boolean({
    required_error: 'El estado activo es obligatorio'
  })
})