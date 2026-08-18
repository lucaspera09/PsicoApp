import Turno from '../models/turno.models.js'
import Paciente from '../models/paciente.models.js'
import Profesional from '../models/profesional.models.js'

const createError = (message, statusCode = 400) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const getProfesionalActual = async (user) => {
  if (!user || user.role !== 'profesional') {
    throw createError('Acceso no autorizado', 403)
  }

  const profesional = await Profesional.findOne({
    user: user.id || user._id,
    activo: true
  })

  if (!profesional) {
    throw createError('Profesional no encontrado', 403)
  }

  return profesional
}

const validarPaciente = async (
  pacienteId,
  profesionalId
) => {
  const paciente = await Paciente.findOne({
    _id: pacienteId,
    profesionales: profesionalId
  })

  if (!paciente) {
    throw createError('Paciente no encontrado', 404)
  }

  return paciente
}

export const getAll = async (user, query = {}) => {
  const profesional = await getProfesionalActual(user)

  const {
    desde,
    hasta,
    pacienteId,
    estado
  } = query

  const filter = {
    profesional: profesional._id
  }

  if (pacienteId) {
    filter.paciente = pacienteId
  }

  if (estado) {
    filter.estado = estado
  }

  if (desde || hasta) {
    filter.fechaInicio = {}

    if (desde) {
      filter.fechaInicio.$gte = new Date(desde)
    }

    if (hasta) {
      filter.fechaInicio.$lte = new Date(hasta)
    }
  }

  return Turno.find(filter)
    .populate(
      'paciente',
      'nombre apellido fechaNacimiento'
    )
    .sort({ fechaInicio: 1 })
    .lean()
}

export const getById = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const turno = await Turno.findOne({
    _id: id,
    profesional: profesional._id
  }).populate(
    'paciente',
    'nombre apellido fechaNacimiento'
  )

  if (!turno) {
    throw createError('Turno no encontrado', 404)
  }

  return turno
}

export const create = async (data, user) => {
  const profesional = await getProfesionalActual(user)

  await validarPaciente(
    data.paciente,
    profesional._id
  )

  const turno = await Turno.create({
    ...data,
    profesional: profesional._id,
    estado: data.estado || 'programado'
  })

  return Turno.findById(turno._id)
    .populate('paciente', 'nombre apellido')
    .lean()
}

export const update = async (id, data, user) => {
  const profesional = await getProfesionalActual(user)

  const turno = await Turno.findOne({
    _id: id,
    profesional: profesional._id
  })

  if (!turno) {
    throw createError('Turno no encontrado', 404)
  }

  if (data.paciente) {
    await validarPaciente(
      data.paciente,
      profesional._id
    )
  }

  const camposNoEditables = [
    '_id',
    'profesional',
    'createdAt',
    'updatedAt'
  ]

  Object.keys(data).forEach((campo) => {
    if (!camposNoEditables.includes(campo)) {
      turno[campo] = data[campo]
    }
  })

  await turno.save()

  return turno
}

export const changeStatus = async (
  id,
  estado,
  user
) => {
  const profesional = await getProfesionalActual(user)

  const estadosPermitidos = [
    'programado',
    'realizado',
    'cancelado',
    'no_asistio'
  ]

  if (!estadosPermitidos.includes(estado)) {
    throw createError(
      'Estado de turno inválido',
      400
    )
  }

  const turno = await Turno.findOne({
    _id: id,
    profesional: profesional._id
  })

  if (!turno) {
    throw createError('Turno no encontrado', 404)
  }

  turno.estado = estado

  await turno.save()

  return turno
}

export const remove = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const turno = await Turno.findOne({
    _id: id,
    profesional: profesional._id
  })

  if (!turno) {
    throw createError('Turno no encontrado', 404)
  }

  await turno.deleteOne()

  return true
}