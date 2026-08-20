import { z } from 'zod'

const horaSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    'La hora debe tener formato HH:mm'
  )

const fechaOpcionalSchema = z
  .string()
  .datetime()
  .optional()
  .nullable()

export const crearHorarioSemanalSchema = z
  .object({
    pacientes: z
      .array(
        z
          .string()
          .min(
            1,
            'El paciente es obligatorio'
          )
      )
      .min(
        1,
        'Debe seleccionar al menos un paciente'
      ),

    diaSemana: z
      .number()
      .int()
      .min(0)
      .max(6),

    horaInicio: horaSchema,

    horaFin: horaSchema,

    fechaDesde:
      fechaOpcionalSchema,

    fechaHasta:
      fechaOpcionalSchema,

    activo: z
      .boolean()
      .optional()
  })
  .refine(
    (data) =>
      data.horaFin >
      data.horaInicio,
    {
      message:
        'La hora de fin debe ser posterior a la hora de inicio',

      path: ['horaFin']
    }
  )

export const actualizarHorarioSemanalSchema =
  z
    .object({
      pacientes: z
        .array(
          z
            .string()
            .min(
              1,
              'El paciente es obligatorio'
            )
        )
        .min(
          1,
          'Debe seleccionar al menos un paciente'
        )
        .optional(),

      diaSemana: z
        .number()
        .int()
        .min(0)
        .max(6)
        .optional(),

      horaInicio:
        horaSchema.optional(),

      horaFin:
        horaSchema.optional(),

      fechaDesde:
        fechaOpcionalSchema,

      fechaHasta:
        fechaOpcionalSchema,

      activo: z
        .boolean()
        .optional()
    })
    .refine(
      (data) => {
        if (
          data.horaInicio &&
          data.horaFin
        ) {
          return (
            data.horaFin >
            data.horaInicio
          )
        }

        return true
      },
      {
        message:
          'La hora de fin debe ser posterior a la hora de inicio',

        path: ['horaFin']
      }
    )