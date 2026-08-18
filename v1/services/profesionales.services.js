import bcrypt from 'bcryptjs'

import User from '../models/user.models.js'
import Profesional from '../models/profesional.models.js'

const createError = (message, statusCode = 400) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export const getAll = async (query = {}) => {
  const {
    search = '',
    activo,
    page = 1,
    limit = 20
  } = query

  const filter = {}

  if (search) {
    filter.$or = [
      { nombre: { $regex: search, $options: 'i' } },
      { apellido: { $regex: search, $options: 'i' } },
      { profesion: { $regex: search, $options: 'i' } }
    ]
  }

  if (activo !== undefined) {
    filter.activo = activo === 'true'
  }

  const pageNumber = Math.max(Number(page) || 1, 1)
  const limitNumber = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  )

  const skip = (pageNumber - 1) * limitNumber

  const [profesionales, total] = await Promise.all([
    Profesional.find(filter)
      .populate('user', 'email role activo')
      .sort({ apellido: 1, nombre: 1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Profesional.countDocuments(filter)
  ])

  return {
    data: profesionales,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber)
  }
}

export const getById = async (id) => {
  const profesional = await Profesional.findById(id)
    .populate('user', 'email role activo')
    .lean()

  if (!profesional) {
    throw createError('Profesional no encontrado', 404)
  }

  return profesional
}

export const create = async (data) => {
  const {
    nombre,
    apellido,
    email,
    password,
    profesion,
    telefono
  } = data

  const emailNormalizado = email.toLowerCase().trim()

  const userExistente = await User.findOne({
    email: emailNormalizado
  })

  if (userExistente) {
    throw createError(
      'Ya existe un usuario con ese email',
      409
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await User.create({
    email: emailNormalizado,
    password: passwordHash,
    role: 'profesional',
    activo: true
  })

  try {
    const profesional = await Profesional.create({
      user: user._id,
      nombre,
      apellido,
      profesion,
      telefono,
      activo: true
    })

    return await Profesional.findById(profesional._id)
      .populate('user', 'email role activo')
      .lean()
  } catch (error) {
    await User.findByIdAndDelete(user._id)

    throw error
  }
}

export const update = async (id, data) => {
  const profesional = await Profesional.findById(id)

  if (!profesional) {
    throw createError('Profesional no encontrado', 404)
  }

  const camposPermitidos = [
    'nombre',
    'apellido',
    'profesion',
    'telefono'
  ]

  camposPermitidos.forEach((campo) => {
    if (data[campo] !== undefined) {
      profesional[campo] = data[campo]
    }
  })

  await profesional.save()

  if (data.email) {
    const emailNormalizado = data.email.toLowerCase().trim()

    const usuarioConEmail = await User.findOne({
      email: emailNormalizado,
      _id: { $ne: profesional.user }
    })

    if (usuarioConEmail) {
      throw createError(
        'Ya existe otro usuario con ese email',
        409
      )
    }

    await User.findByIdAndUpdate(
      profesional.user,
      {
        email: emailNormalizado
      }
    )
  }

  return Profesional.findById(id)
    .populate('user', 'email role activo')
    .lean()
}

export const changeStatus = async (id, activo) => {
  const profesional = await Profesional.findById(id)

  if (!profesional) {
    throw createError('Profesional no encontrado', 404)
  }

  profesional.activo = Boolean(activo)

  await profesional.save()

  await User.findByIdAndUpdate(
    profesional.user,
    {
      activo: Boolean(activo)
    }
  )

  return Profesional.findById(id)
    .populate('user', 'email role activo')
    .lean()
}