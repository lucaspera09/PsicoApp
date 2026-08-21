import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../models/user.models.js'
import Profesional from '../models/profesional.models.js'

const createError = (
  message,
  statusCode = 400
) => {
  const error =
    new Error(message)

  error.statusCode =
    statusCode

  return error
}

/*
  REGISTRO PÚBLICO DE PROFESIONAL

  El profesional:
  - crea su propia contraseña
  - queda pendiente
  - no puede iniciar sesión
    hasta que el admin lo apruebe
*/

export const registrarProfesional =
  async (data) => {
    const {
      nombre,
      apellido,
      profesion,
      telefono = '',
      email,
      password
    } = data

    const emailNormalizado =
      email
        .toLowerCase()
        .trim()

    const userExistente =
      await User.findOne({
        email:
          emailNormalizado
      })

    if (userExistente) {
      throw createError(
        'Ya existe una cuenta con ese email',
        409
      )
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      )

    const user =
      await User.create({
        email:
          emailNormalizado,

        password:
          passwordHash,

        role:
          'profesional',

        estadoCuenta:
          'pendiente',

        activo:
          false
      })

    try {
      const profesional =
        await Profesional.create({
          user:
            user._id,

          nombre,

          apellido,

          profesion,

          telefono,

          activo:
            false
        })

      return {
        message:
          'Tu solicitud fue enviada correctamente. Un administrador deberá aprobar tu cuenta antes de que puedas ingresar.',

        profesional: {
          id:
            profesional._id,

          nombre:
            profesional.nombre,

          apellido:
            profesional.apellido,

          profesion:
            profesional.profesion,

          email:
            user.email,

          estadoCuenta:
            'pendiente'
        }
      }
    } catch (error) {
      /*
        Si falla la creación del
        profesional, eliminamos
        el User creado.
      */

      await User.findByIdAndDelete(
        user._id
      )

      throw error
    }
  }

/*
  LOGIN
*/

export const login =
  async (
    email,
    password
  ) => {
    const user =
      await User.findOne({
        email:
          email
            .toLowerCase()
            .trim()
      })
        .select('+password')

    if (!user) {
      throw createError(
        'Email o contraseña incorrectos',
        401
      )
    }

    /*
      IMPORTANTE:

      Los usuarios viejos pueden
      no tener estadoCuenta.

      En ese caso los consideramos
      aprobados para no romper
      cuentas existentes.
    */

    const estadoCuenta =
      user.estadoCuenta ||
      'aprobado'

    if (
      estadoCuenta ===
      'pendiente'
    ) {
      throw createError(
        'Tu cuenta está pendiente de aprobación',
        403
      )
    }

    if (
      estadoCuenta ===
      'rechazado'
    ) {
      throw createError(
        'Tu solicitud de acceso fue rechazada',
        403
      )
    }

    if (!user.activo) {
      throw createError(
        'El usuario se encuentra inactivo',
        403
      )
    }

    const passwordValida =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!passwordValida) {
      throw createError(
        'Email o contraseña incorrectos',
        401
      )
    }

    const token =
      jwt.sign(
        {
          id:
            user._id,

          role:
            user.role
        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            process.env
              .JWT_EXPIRES_IN ||
            '8h'
        }
      )

    let profesional =
      null

    if (
      user.role ===
      'profesional'
    ) {
      profesional =
        await Profesional.findOne({
          user:
            user._id
        }).lean()
    }

    return {
      token,

      user: {
        id:
          user._id,

        email:
          user.email,

        role:
          user.role,

        activo:
          user.activo,

        estadoCuenta,

        profesional
      }
    }
  }

/*
  USUARIO ACTUAL
*/

export const getCurrentUser =
  async (userId) => {
    const user =
      await User.findById(
        userId
      )
        .select('-password')
        .lean()

    if (!user) {
      throw createError(
        'Usuario no encontrado',
        404
      )
    }

    let profesional =
      null

    if (
      user.role ===
      'profesional'
    ) {
      profesional =
        await Profesional.findOne({
          user:
            user._id
        }).lean()
    }

    return {
      ...user,

      estadoCuenta:
        user.estadoCuenta ||
        'aprobado',

      profesional
    }
  }