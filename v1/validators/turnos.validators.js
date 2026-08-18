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

const estadosTurno = [
  'programado',
  'realizado',
  'cancelado',
  'no_asistio'
]

const recurrenciaSchema = z.object({
  tipo: z
    .literal('semanal')
    .optional()
    .default('semanal'),

  diasSemana: z
    .array(
      z
        .number()
        .int()
        .min(0)
        .max(6)
    )
    .min(
      1,
      'Debe seleccionar al menos un día de la semana'
    ),

  fechaHasta: fechaValida
    .nullable()
    .optional()
})

export const createTurnoSchema = z
  .object({
    paciente: objectId,

    fechaInicio: fechaValida,

    fechaFin: fechaValida,

    estado: z
      .enum(estadosTurno)
      .optional()
      .default('programado'),

    recurrente: z
      .boolean()
      .optional()
      .default(false),

    recurrencia: recurrenciaSchema
      .nullable()
      .optional(),

    observacion: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .default('')
  })
  .refine(
    (data) =>
      new Date(data.fechaFin) >
      new Date(data.fechaInicio),
    {
      message:
        'La fecha de finalización debe ser posterior al inicio',
      path: ['fechaFin']
    }
  )
  .refine(
    (data) =>
      !data.recurrente ||
      data.recurrencia != null,
    {
      message:
        'Debe indicar la recurrencia del turno',
      path: ['recurrencia']
    }
  )

export const updateTurnoSchema = z.object({
  paciente: objectId.optional(),

  fechaInicio: fechaValida.optional(),

  fechaFin: fechaValida.optional(),

  recurrente: z
    .boolean()
    .optional(),

  recurrencia: recurrenciaSchema
    .nullable()
    .optional(),

  observacion: z
    .string()
    .trim()
    .max(5000)
    .optional()
})

export const changeTurnoStatusSchema = z.object({
  estado: z.enum(estadosTurno, {
    errorMap: () => ({
      message:
        'El estado debe ser programado, realizado, cancelado o no_asistio'
    })
  })
})