import HorarioSemanal from '../models/horarioSemanal.models.js'
import Paciente from '../models/paciente.models.js'
import Profesional from '../models/profesional.models.js'

const createError = (
  status,
  message
) => {
  const error =
    new Error(message)

  error.status = status

  return error
}

const getProfesionalActual =
  async (user) => {
    if (
      !user ||
      user.role !==
        'profesional'
    ) {
      throw createError(
        403,
        'Acceso no autorizado'
      )
    }

    const profesional =
      await Profesional.findOne({
        user:
          user.id ||
          user._id,

        activo: true
      })

    if (!profesional) {
      throw createError(
        403,
        'Profesional no encontrado'
      )
    }

    return profesional
  }

const validarPacientes =
  async (
    pacientesIds,
    profesional
  ) => {
    if (
      !Array.isArray(
        pacientesIds
      ) ||
      pacientesIds.length === 0
    ) {
      throw createError(
        400,
        'Debe seleccionar al menos un paciente'
      )
    }

    const idsSinDuplicados = [
      ...new Set(
        pacientesIds.map(
          (id) =>
            id.toString()
        )
      )
    ]

    if (
      idsSinDuplicados.length !==
      pacientesIds.length
    ) {
      throw createError(
        400,
        'No puede haber pacientes repetidos'
      )
    }

    const pacientes =
      await Paciente.find({
        _id: {
          $in:
            idsSinDuplicados
        },

        profesionales:
          profesional._id,

        activo: true
      })

    if (
      pacientes.length !==
      idsSinDuplicados.length
    ) {
      throw createError(
        400,
        'Uno o más pacientes no existen, están inactivos o no están asignados al profesional'
      )
    }

    return pacientes
  }

export const listarHorariosSemanales =
  async (user) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    return HorarioSemanal.find({
      profesional:
        profesional._id,

      activo: true
    })
      .populate(
        'pacientes',
        'nombre apellido fechaNacimiento'
      )
      .sort({
        diaSemana: 1,
        horaInicio: 1
      })
      .lean()
  }

export const obtenerHorarioSemanalPorId =
  async (
    id,
    user
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    const horario =
      await HorarioSemanal.findOne(
        {
          _id: id,

          profesional:
            profesional._id
        }
      )
        .populate(
          'pacientes',
          'nombre apellido fechaNacimiento'
        )
        .lean()

    if (!horario) {
      throw createError(
        404,
        'Horario semanal no encontrado'
      )
    }

    return horario
  }

export const crearHorarioSemanal =
  async (
    data,
    user
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    await validarPacientes(
      data.pacientes,
      profesional
    )

    if (
      data.horaFin <=
      data.horaInicio
    ) {
      throw createError(
        400,
        'La hora de fin debe ser posterior a la hora de inicio'
      )
    }

    /*
      IMPORTANTE:

      NO bloqueamos que haya otro
      horario en la misma hora.

      Por ejemplo:

      lunes 16:00
      Carlos + Sofía

      y también podría existir
      otro bloque si alguna vez
      fuese necesario.

      Lo único que evitamos acá
      es guardar exactamente el
      mismo grupo de pacientes
      dos veces en el mismo horario.
    */

    const horariosMismaHora =
      await HorarioSemanal.find({
        profesional:
          profesional._id,

        diaSemana:
          data.diaSemana,

        horaInicio:
          data.horaInicio,

        activo: true
      })

    const nuevosPacientes = [
      ...data.pacientes
    ]
      .map(
        (id) =>
          id.toString()
      )
      .sort()

    const duplicado =
      horariosMismaHora.some(
        (horario) => {
          const pacientesHorario =
            horario.pacientes
              .map(
                (id) =>
                  id.toString()
              )
              .sort()

          if (
            pacientesHorario.length !==
            nuevosPacientes.length
          ) {
            return false
          }

          return pacientesHorario.every(
            (
              id,
              index
            ) =>
              id ===
              nuevosPacientes[
                index
              ]
          )
        }
      )

    if (duplicado) {
      throw createError(
        409,
        'Ya existe ese horario para los mismos pacientes'
      )
    }

    const horario =
      await HorarioSemanal.create(
        {
          pacientes:
            data.pacientes,

          profesional:
            profesional._id,

          diaSemana:
            data.diaSemana,

          horaInicio:
            data.horaInicio,

          horaFin:
            data.horaFin,

          fechaDesde:
            data.fechaDesde ||
            new Date(),

          fechaHasta:
            data.fechaHasta ||
            null,

          activo:
            data.activo ??
            true
        }
      )

    return HorarioSemanal.findById(
      horario._id
    )
      .populate(
        'pacientes',
        'nombre apellido fechaNacimiento'
      )
      .lean()
  }

export const actualizarHorarioSemanal =
  async (
    id,
    data,
    user
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    const horario =
      await HorarioSemanal.findOne(
        {
          _id: id,

          profesional:
            profesional._id
        }
      )

    if (!horario) {
      throw createError(
        404,
        'Horario semanal no encontrado'
      )
    }

    if (data.pacientes) {
      await validarPacientes(
        data.pacientes,
        profesional
      )

      horario.pacientes =
        data.pacientes
    }

    if (
      data.diaSemana !==
      undefined
    ) {
      horario.diaSemana =
        data.diaSemana
    }

    if (
      data.horaInicio !==
      undefined
    ) {
      horario.horaInicio =
        data.horaInicio
    }

    if (
      data.horaFin !==
      undefined
    ) {
      horario.horaFin =
        data.horaFin
    }

    if (
      data.fechaDesde !==
      undefined
    ) {
      horario.fechaDesde =
        data.fechaDesde
          ? new Date(
              data.fechaDesde
            )
          : horario.fechaDesde
    }

    if (
      data.fechaHasta !==
      undefined
    ) {
      horario.fechaHasta =
        data.fechaHasta
          ? new Date(
              data.fechaHasta
            )
          : null
    }

    if (
      data.activo !==
      undefined
    ) {
      horario.activo =
        data.activo
    }

    if (
      horario.horaFin <=
      horario.horaInicio
    ) {
      throw createError(
        400,
        'La hora de fin debe ser posterior a la hora de inicio'
      )
    }

    await horario.save()

    return HorarioSemanal.findById(
      horario._id
    )
      .populate(
        'pacientes',
        'nombre apellido fechaNacimiento'
      )
      .lean()
  }

export const desactivarHorarioSemanal =
  async (
    id,
    user
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    const horario =
      await HorarioSemanal.findOne(
        {
          _id: id,

          profesional:
            profesional._id
        }
      )

    if (!horario) {
      throw createError(
        404,
        'Horario semanal no encontrado'
      )
    }

    horario.activo =
      false

    if (
      !horario.fechaHasta
    ) {
      horario.fechaHasta =
        new Date()
    }

    await horario.save()

    return true
  }