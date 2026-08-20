import Turno from '../models/turno.models.js'
import Paciente from '../models/paciente.models.js'
import Profesional from '../models/profesional.models.js'

const createError = (
  message,
  statusCode = 400
) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const getProfesionalActual =
  async (user) => {
    if (
      !user ||
      user.role !== 'profesional'
    ) {
      throw createError(
        'Acceso no autorizado',
        403
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
        'Profesional no encontrado',
        403
      )
    }

    return profesional
  }

/*
  Valida que todos los pacientes:
  - existan
  - estén activos
  - pertenezcan al profesional
*/
const validarPacientes =
  async (
    participantes,
    profesionalId
  ) => {
    if (
      !Array.isArray(
        participantes
      ) ||
      participantes.length === 0
    ) {
      throw createError(
        'Debe seleccionar al menos un paciente',
        400
      )
    }

    const pacientesIds =
      participantes.map(
        (participante) =>
          participante.paciente
      )

    const idsString =
      pacientesIds.map(
        (id) =>
          id.toString()
      )

    const idsUnicos = [
      ...new Set(idsString)
    ]

    if (
      idsUnicos.length !==
      idsString.length
    ) {
      throw createError(
        'No puede haber pacientes repetidos en el mismo turno',
        400
      )
    }

    const pacientes =
      await Paciente.find({
        _id: {
          $in:
            idsUnicos
        },

        profesionales:
          profesionalId,

        activo: true
      })

    if (
      pacientes.length !==
      idsUnicos.length
    ) {
      throw createError(
        'Uno o más pacientes no existen, están inactivos o no están asignados al profesional',
        400
      )
    }

    return pacientes
  }

export const getAll =
  async (
    user,
    query = {}
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    const {
      desde,
      hasta,
      pacienteId,
      estado
    } = query

    const filter = {
      profesional:
        profesional._id
    }

    /*
      Buscar todos los turnos
      donde participe ese paciente.
    */
    if (pacienteId) {
      filter[
        'participantes.paciente'
      ] = pacienteId
    }

    /*
      Si además filtramos por estado,
      buscamos un participante con
      ese estado.

      Más adelante, si queremos,
      podemos hacer un $elemMatch
      combinando paciente + estado.
    */
    if (estado) {
      filter[
        'participantes.estado'
      ] = estado
    }

    if (desde || hasta) {
      filter.fechaInicio = {}

      if (desde) {
        filter.fechaInicio.$gte =
          new Date(desde)
      }

      if (hasta) {
        filter.fechaInicio.$lte =
          new Date(hasta)
      }
    }

    return Turno.find(filter)
      .populate(
        'participantes.paciente',
        'nombre apellido fechaNacimiento'
      )
      .sort({
        fechaInicio: 1
      })
      .lean()
  }

export const getById =
  async (
    id,
    user
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    const turno =
      await Turno.findOne({
        _id: id,
        profesional:
          profesional._id
      }).populate(
        'participantes.paciente',
        'nombre apellido fechaNacimiento'
      )

    if (!turno) {
      throw createError(
        'Turno no encontrado',
        404
      )
    }

    return turno
  }

export const create =
  async (
    data,
    user
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    await validarPacientes(
      data.participantes,
      profesional._id
    )

    if (
      new Date(
        data.fechaFin
      ) <=
      new Date(
        data.fechaInicio
      )
    ) {
      throw createError(
        'La fecha de finalización debe ser posterior al inicio',
        400
      )
    }

    const participantes =
      data.participantes.map(
        (participante) => ({
          paciente:
            participante.paciente,

          estado:
            participante.estado ||
            'programado'
        })
      )

    const turno =
      await Turno.create({
        participantes,

        profesional:
          profesional._id,

        fechaInicio:
          data.fechaInicio,

        fechaFin:
          data.fechaFin,

        recurrente:
          data.recurrente ??
          false,

        recurrencia:
          data.recurrencia ??
          null,

        observacion:
          data.observacion ||
          ''
      })

    return Turno.findById(
      turno._id
    )
      .populate(
        'participantes.paciente',
        'nombre apellido fechaNacimiento'
      )
      .lean()
  }

export const update =
  async (
    id,
    data,
    user
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    const turno =
      await Turno.findOne({
        _id: id,

        profesional:
          profesional._id
      })

    if (!turno) {
      throw createError(
        'Turno no encontrado',
        404
      )
    }

    /*
      Si cambian los participantes,
      validamos nuevamente todos.
    */
    if (data.participantes) {
      await validarPacientes(
        data.participantes,
        profesional._id
      )

      turno.participantes =
        data.participantes.map(
          (participante) => ({
            paciente:
              participante.paciente,

            estado:
              participante.estado ||
              'programado'
          })
        )
    }

    if (
      data.fechaInicio !==
      undefined
    ) {
      turno.fechaInicio =
        data.fechaInicio
    }

    if (
      data.fechaFin !==
      undefined
    ) {
      turno.fechaFin =
        data.fechaFin
    }

    /*
      Hay que validar usando
      los valores finales porque
      puede actualizarse solamente
      una de las dos fechas.
    */
    if (
      new Date(
        turno.fechaFin
      ) <=
      new Date(
        turno.fechaInicio
      )
    ) {
      throw createError(
        'La fecha de finalización debe ser posterior al inicio',
        400
      )
    }

    if (
      data.recurrente !==
      undefined
    ) {
      turno.recurrente =
        data.recurrente
    }

    if (
      data.recurrencia !==
      undefined
    ) {
      turno.recurrencia =
        data.recurrencia
    }

    if (
      data.observacion !==
      undefined
    ) {
      turno.observacion =
        data.observacion
    }

    await turno.save()

    return Turno.findById(
      turno._id
    )
      .populate(
        'participantes.paciente',
        'nombre apellido fechaNacimiento'
      )
      .lean()
  }

/*
  Cambia el estado de UN paciente
  dentro del turno.

  Ejemplo:

  Carlos -> realizado
  Sofía  -> no_asistio
  Mateo  -> programado
*/
export const changeStatus =
  async (
    id,
    pacienteId,
    estado,
    user
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    const estadosPermitidos = [
      'programado',
      'realizado',
      'cancelado',
      'no_asistio'
    ]

    if (
      !estadosPermitidos.includes(
        estado
      )
    ) {
      throw createError(
        'Estado de turno inválido',
        400
      )
    }

    const turno =
      await Turno.findOne({
        _id: id,

        profesional:
          profesional._id
      })

    if (!turno) {
      throw createError(
        'Turno no encontrado',
        404
      )
    }

    const participante =
      turno.participantes.find(
        (item) =>
          item.paciente
            .toString() ===
          pacienteId.toString()
      )

    if (!participante) {
      throw createError(
        'El paciente no pertenece a este turno',
        404
      )
    }

    participante.estado =
      estado

    await turno.save()

    return Turno.findById(
      turno._id
    )
      .populate(
        'participantes.paciente',
        'nombre apellido fechaNacimiento'
      )
      .lean()
  }

export const remove =
  async (
    id,
    user
  ) => {
    const profesional =
      await getProfesionalActual(
        user
      )

    const turno =
      await Turno.findOne({
        _id: id,

        profesional:
          profesional._id
      })

    if (!turno) {
      throw createError(
        'Turno no encontrado',
        404
      )
    }

    await turno.deleteOne()

    return true
  }