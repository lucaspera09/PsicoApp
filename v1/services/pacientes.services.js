import Paciente from '../models/paciente.models.js'
import Profesional from '../models/profesional.models.js'

const createError = (message, statusCode = 400) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const getProfesionalActual = async (user) => {
  if (!user || user.role !== 'profesional') {
    throw createError(
      'Solo los profesionales pueden acceder a pacientes',
      403
    )
  }

  const userId = user.id || user._id

  const profesional = await Profesional.findOne({
    user: userId,
    activo: true
  })

  if (!profesional) {
    throw createError(
      'Profesional no encontrado o inactivo',
      403
    )
  }

  return profesional
}

export const getAll = async (user, query = {}) => {
  const profesional = await getProfesionalActual(user)

  const {
    search = '',
    activo,
    page = 1,
    limit = 20
  } = query

  const filter = {
    profesionales: profesional._id
  }

  if (activo !== undefined) {
    filter.activo = activo === 'true'
  }

  if (search) {
    filter.$or = [
      {
        nombre: {
          $regex: search,
          $options: 'i'
        }
      },
      {
        apellido: {
          $regex: search,
          $options: 'i'
        }
      }
    ]
  }

  const pageNumber = Math.max(Number(page) || 1, 1)
  const limitNumber = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  )

  const skip = (pageNumber - 1) * limitNumber

  const [pacientes, total] = await Promise.all([
    Paciente.find(filter)
      .sort({ apellido: 1, nombre: 1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Paciente.countDocuments(filter)
  ])

  return {
    data: pacientes,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber)
  }
}

export const getById = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const paciente = await Paciente.findOne({
    _id: id,
    profesionales: profesional._id
  }).lean()

  if (!paciente) {
    throw createError('Paciente no encontrado', 404)
  }

  return paciente
}

export const create = async (data, user) => {
  const profesional = await getProfesionalActual(user)

  const paciente = await Paciente.create({
    ...data,

    profesionales: [
      profesional._id
    ],

    activo: true
  })

  return paciente
}

export const update = async (id, data, user) => {
  const profesional = await getProfesionalActual(user)

  const paciente = await Paciente.findOne({
    _id: id,
    profesionales: profesional._id
  })

  if (!paciente) {
    throw createError('Paciente no encontrado', 404)
  }

  const camposNoEditables = [
    '_id',
    'profesionales',
    'createdAt',
    'updatedAt'
  ]

  Object.keys(data).forEach((campo) => {
    if (!camposNoEditables.includes(campo)) {
      paciente[campo] = data[campo]
    }
  })

  await paciente.save()

  return paciente
}

export const changeStatus = async (
  id,
  activo,
  user
) => {
  const profesional = await getProfesionalActual(user)

  const paciente = await Paciente.findOne({
    _id: id,
    profesionales: profesional._id
  })

  if (!paciente) {
    throw createError('Paciente no encontrado', 404)
  }

  paciente.activo = Boolean(activo)

  await paciente.save()

  return paciente
}