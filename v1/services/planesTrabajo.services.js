import PlanTrabajo from '../models/planTrabajo.models.js'
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

  return PlanTrabajo.find({
    paciente: pacienteId,
    profesional: profesional._id
  })
    .sort({ createdAt: -1 })
    .lean()
}

export const getById = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const plan = await PlanTrabajo.findOne({
    _id: id,
    profesional: profesional._id
  }).lean()

  if (!plan) {
    throw createError(
      'Plan de trabajo no encontrado',
      404
    )
  }

  return plan
}

export const create = async (data, user) => {
  const profesional = await getProfesionalActual(user)

  await validarPaciente(
    data.paciente,
    profesional._id
  )

  return PlanTrabajo.create({
    ...data,
    profesional: profesional._id
  })
}

export const update = async (id, data, user) => {
  const profesional = await getProfesionalActual(user)

  const plan = await PlanTrabajo.findOne({
    _id: id,
    profesional: profesional._id
  })

  if (!plan) {
    throw createError(
      'Plan de trabajo no encontrado',
      404
    )
  }

  const camposPermitidos = [
    'titulo',
    'descripcion',
    'objetivos',
    'fechaInicio',
    'fechaFin',
    'activo'
  ]

  camposPermitidos.forEach((campo) => {
    if (data[campo] !== undefined) {
      plan[campo] = data[campo]
    }
  })

  await plan.save()

  return plan
}

export const remove = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const plan = await PlanTrabajo.findOne({
    _id: id,
    profesional: profesional._id
  })

  if (!plan) {
    throw createError(
      'Plan de trabajo no encontrado',
      404
    )
  }

  await plan.deleteOne()

  return true
}