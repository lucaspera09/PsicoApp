import Sesion from '../models/sesion.models.js'
import Paciente from '../models/paciente.models.js'
import Profesional from '../models/profesional.models.js'
import Turno from '../models/turno.models.js'

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

export const getByPaciente = async (
  pacienteId,
  user,
  query = {}
) => {
  const profesional = await getProfesionalActual(user)

  await validarPaciente(
    pacienteId,
    profesional._id
  )

  const filter = {
    paciente: pacienteId,
    profesional: profesional._id
  }

  if (query.desde || query.hasta) {
    filter.fecha = {}

    if (query.desde) {
      filter.fecha.$gte = new Date(query.desde)
    }

    if (query.hasta) {
      filter.fecha.$lte = new Date(query.hasta)
    }
  }

  return Sesion.find(filter)
    .sort({ fecha: -1 })
    .lean()
}

export const getById = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const sesion = await Sesion.findOne({
    _id: id,
    profesional: profesional._id
  }).lean()

  if (!sesion) {
    throw createError('Sesión no encontrada', 404)
  }

  return sesion
}

export const create = async (data, user) => {
  const profesional = await getProfesionalActual(user)

  await validarPaciente(
    data.paciente,
    profesional._id
  )

  if (data.turno) {
    const turno = await Turno.findOne({
      _id: data.turno,
      profesional: profesional._id,
      paciente: data.paciente
    })

    if (!turno) {
      throw createError(
        'El turno indicado no es válido',
        400
      )
    }
  }

  return Sesion.create({
    ...data,
    profesional: profesional._id,
    fecha: data.fecha || new Date()
  })
}

export const update = async (id, data, user) => {
  const profesional = await getProfesionalActual(user)

  const sesion = await Sesion.findOne({
    _id: id,
    profesional: profesional._id
  })

  if (!sesion) {
    throw createError('Sesión no encontrada', 404)
  }

  const camposPermitidos = [
    'fecha',
    'areas',
    'actividades',
    'observacion',
    'proximaSesion'
  ]

  camposPermitidos.forEach((campo) => {
    if (data[campo] !== undefined) {
      sesion[campo] = data[campo]
    }
  })

  await sesion.save()

  return sesion
}

export const remove = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const sesion = await Sesion.findOne({
    _id: id,
    profesional: profesional._id
  })

  if (!sesion) {
    throw createError('Sesión no encontrada', 404)
  }

  await sesion.deleteOne()

  return true
}