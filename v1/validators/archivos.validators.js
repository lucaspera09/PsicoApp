import { z } from 'zod'

const objectId = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    'El ID del paciente no es válido'
  )

export const uploadArchivoSchema = z.object({
  paciente: objectId,

  nombre: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional(),

  descripcion: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .default('')
})