import { z } from 'zod'

const objectId = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    'El ID no es válido'
  )

const fechaValida = z
  .string()
  .refine(
    (fecha) => !Number.isNaN(Date.parse(fecha)),
    'La fecha no es válida'
  )

export const createSesionSchema = z.object({
  paciente: objectId,

  turno: objectId
    .nullable()
    .optional(),

  fecha: fechaValida.optional(),

  areas: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(100)
    )
    .optional()
    .default([]),

  actividades: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(200)
    )
    .optional()
    .default([]),

  observacion: z
    .string()
    .trim()
    .max(20000)
    .optional()
    .default(''),

  proximaSesion: z
    .string()
    .trim()
    .max(10000)
    .optional()
    .default('')
})

export const updateSesionSchema = z.object({
  fecha: fechaValida.optional(),

  areas: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(100)
    )
    .optional(),

  actividades: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(200)
    )
    .optional(),

  observacion: z
    .string()
    .trim()
    .max(20000)
    .optional(),

  proximaSesion: z
    .string()
    .trim()
    .max(10000)
    .optional()
})