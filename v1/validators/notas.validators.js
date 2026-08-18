import { z } from 'zod'

const objectId = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    'El ID del paciente no es válido'
  )

const tiposNota = [
  'entrevista',
  'llamada',
  'comentario_padres',
  'reunion',
  'observacion',
  'otro'
]

const fechaValida = z
  .string()
  .refine(
    (fecha) => !Number.isNaN(Date.parse(fecha)),
    'La fecha no es válida'
  )

export const createNotaSchema = z.object({
  paciente: objectId,

  titulo: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default(''),

  tipo: z
    .enum(tiposNota)
    .optional()
    .default('otro'),

  contenido: z
    .string({
      required_error: 'El contenido de la nota es obligatorio'
    })
    .trim()
    .min(1, 'La nota no puede estar vacía')
    .max(20000, 'La nota es demasiado larga'),

  fecha: fechaValida.optional()
})

export const updateNotaSchema = z.object({
  titulo: z
    .string()
    .trim()
    .max(200)
    .optional(),

  tipo: z
    .enum(tiposNota)
    .optional(),

  contenido: z
    .string()
    .trim()
    .min(1, 'La nota no puede quedar vacía')
    .max(20000)
    .optional(),

  fecha: fechaValida.optional()
})