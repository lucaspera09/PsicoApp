import { z } from 'zod'

const objectId = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    'El ID del paciente no es válido'
  )

const fechaValida = z
  .string()
  .refine(
    (fecha) => !Number.isNaN(Date.parse(fecha)),
    'La fecha no es válida'
  )

const objetivoSchema = z.object({
  descripcion: z
    .string({
      required_error:
        'La descripción del objetivo es obligatoria'
    })
    .trim()
    .min(1)
    .max(1000),

  estado: z
    .enum([
      'pendiente',
      'en_progreso',
      'logrado'
    ])
    .optional()
    .default('pendiente'),

  observacion: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .default('')
})

export const createPlanTrabajoSchema = z.object({
  paciente: objectId,

  titulo: z
    .string({
      required_error: 'El título es obligatorio'
    })
    .trim()
    .min(2)
    .max(200),

  descripcion: z
    .string()
    .trim()
    .max(10000)
    .optional()
    .default(''),

  objetivos: z
    .array(objetivoSchema)
    .optional()
    .default([]),

  fechaInicio: fechaValida.optional(),

  fechaFin: fechaValida
    .nullable()
    .optional(),

  activo: z
    .boolean()
    .optional()
    .default(true)
})

export const updatePlanTrabajoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .optional(),

  descripcion: z
    .string()
    .trim()
    .max(10000)
    .optional(),

  objetivos: z
    .array(objetivoSchema)
    .optional(),

  fechaInicio: fechaValida.optional(),

  fechaFin: fechaValida
    .nullable()
    .optional(),

  activo: z
    .boolean()
    .optional()
})