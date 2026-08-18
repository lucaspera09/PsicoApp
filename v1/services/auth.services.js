import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../models/user.models.js'
import Profesional from '../models/profesional.models.js'

const createError = (message, statusCode = 400) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export const login = async (email, password) => {
  const user = await User.findOne({
    email: email.toLowerCase().trim()
  }).select('+password')

  if (!user) {
    throw createError('Email o contraseña incorrectos', 401)
  }

  if (!user.activo) {
    throw createError('El usuario se encuentra inactivo', 403)
  }

  const passwordValida = await bcrypt.compare(
    password,
    user.password
  )

  if (!passwordValida) {
    throw createError('Email o contraseña incorrectos', 401)
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    }
  )

  let profesional = null

  if (user.role === 'profesional') {
    profesional = await Profesional.findOne({
      user: user._id
    }).lean()
  }

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      activo: user.activo,
      profesional
    }
  }
}

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
    .lean()

  if (!user) {
    throw createError('Usuario no encontrado', 404)
  }

  let profesional = null

  if (user.role === 'profesional') {
    profesional = await Profesional.findOne({
      user: user._id
    }).lean()
  }

  return {
    ...user,
    profesional
  }
}