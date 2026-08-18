import Responsable from '../models/responsable.models.js'
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

export const getByPaciente = async (
  pacienteId,
  user
) => {
  const profesional = await getProfesionalActual(user)

  await validarPaciente(
    pacienteId,
    profesional._id
  )

  return Responsable.find({
    paciente: pacienteId
  })
    .sort({ principal: -1, apellido: 1 })
    .lean()
}

export const getById = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const responsable = await Responsable.findById(id)

  if (!responsable) {
    throw createError('Responsable no encontrado', 404)
  }

  await validarPaciente(
    responsable.paciente,
    profesional._id
  )

  return responsable
}

export const create = async (data, user) => {
  const profesional = await getProfesionalActual(user)

  await validarPaciente(
    data.paciente,
    profesional._id
  )

  return Responsable.create({
    ...data
  })
}

export const update = async (id, data, user) => {
  const profesional = await getProfesionalActual(user)

  const responsable = await Responsable.findById(id)

  if (!responsable) {
    throw createError('Responsable no encontrado', 404)
  }

  await validarPaciente(
    responsable.paciente,
    profesional._id
  )

  const camposNoEditables = [
    '_id',
    'paciente',
    'createdAt',
    'updatedAt'
  ]

  Object.keys(data).forEach((campo) => {
    if (!camposNoEditables.includes(campo)) {
      responsable[campo] = data[campo]
    }
  })

  await responsable.save()

  return responsable
}

export const remove = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const responsable = await Responsable.findById(id)

  if (!responsable) {
    throw createError('Responsable no encontrado', 404)
  }

  await validarPaciente(
    responsable.paciente,
    profesional._id
  )

  await responsable.deleteOne()

  return true
}