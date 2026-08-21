import bcrypt from 'bcryptjs'

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
  LISTADO
*/

export const getAll =
  async (
    query = {}
  ) => {
    const {
      search = '',
      activo,
      estadoCuenta,
      page = 1,
      limit = 20
    } = query

    const filter = {}

    if (search) {
      filter.$or = [
        {
          nombre: {
            $regex:
              search,

            $options:
              'i'
          }
        },

        {
          apellido: {
            $regex:
              search,

            $options:
              'i'
          }
        },

        {
          profesion: {
            $regex:
              search,

            $options:
              'i'
          }
        }
      ]
    }

    if (
      activo !== undefined
    ) {
      filter.activo =
        activo === 'true'
    }

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      )

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 20,
          1
        ),
        100
      )

    const skip =
      (
        pageNumber - 1
      ) *
      limitNumber

    let profesionales =
      await Profesional.find(
        filter
      )
        .populate(
          'user',
          'email role activo estadoCuenta createdAt'
        )
        .sort({
          createdAt: -1
        })
        .lean()

    /*
      Filtro por estado de cuenta.

      Los usuarios viejos sin
      estadoCuenta cuentan como
      aprobados.
    */

    if (estadoCuenta) {
      profesionales =
        profesionales.filter(
          (profesional) => {
            const estado =
              profesional.user
                ?.estadoCuenta ||
              'aprobado'

            return (
              estado ===
              estadoCuenta
            )
          }
        )
    }

    const total =
      profesionales.length

    const data =
      profesionales.slice(
        skip,
        skip +
          limitNumber
      )

    return {
      data,

      total,

      page:
        pageNumber,

      limit:
        limitNumber,

      totalPages:
        Math.ceil(
          total /
          limitNumber
        )
    }
  }

/*
  DETALLE
*/

export const getById =
  async (id) => {
    const profesional =
      await Profesional
        .findById(id)
        .populate(
          'user',
          'email role activo estadoCuenta createdAt'
        )
        .lean()

    if (!profesional) {
      throw createError(
        'Profesional no encontrado',
        404
      )
    }

    return profesional
  }

/*
  CREACIÓN DESDE ADMIN

  La dejamos por compatibilidad
  con el sistema actual.

  Más adelante podemos retirar
  esta opción del frontend.
*/

export const create =
  async (data) => {
    const {
      nombre,
      apellido,
      email,
      password,
      profesion,
      telefono
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
        'Ya existe un usuario con ese email',
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
          'aprobado',

        activo:
          true
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
            true
        })

      return await Profesional
        .findById(
          profesional._id
        )
        .populate(
          'user',
          'email role activo estadoCuenta'
        )
        .lean()

    } catch (error) {
      await User
        .findByIdAndDelete(
          user._id
        )

      throw error
    }
  }

/*
  EDITAR DATOS
*/

export const update =
  async (
    id,
    data
  ) => {
    const profesional =
      await Profesional
        .findById(id)

    if (!profesional) {
      throw createError(
        'Profesional no encontrado',
        404
      )
    }

    const camposPermitidos = [
      'nombre',
      'apellido',
      'profesion',
      'telefono'
    ]

    camposPermitidos.forEach(
      (campo) => {
        if (
          data[campo] !==
          undefined
        ) {
          profesional[campo] =
            data[campo]
        }
      }
    )

    await profesional.save()

    if (data.email) {
      const emailNormalizado =
        data.email
          .toLowerCase()
          .trim()

      const usuarioConEmail =
        await User.findOne({
          email:
            emailNormalizado,

          _id: {
            $ne:
              profesional.user
          }
        })

      if (usuarioConEmail) {
        throw createError(
          'Ya existe otro usuario con ese email',
          409
        )
      }

      await User
        .findByIdAndUpdate(
          profesional.user,
          {
            email:
              emailNormalizado
          }
        )
    }

    return Profesional
      .findById(id)
      .populate(
        'user',
        'email role activo estadoCuenta'
      )
      .lean()
  }

/*
  ACTIVAR / DESACTIVAR

  Esto se usa después de que
  la cuenta ya fue aprobada.
*/

export const changeStatus =
  async (
    id,
    activo
  ) => {
    const profesional =
      await Profesional
        .findById(id)

    if (!profesional) {
      throw createError(
        'Profesional no encontrado',
        404
      )
    }

    const user =
      await User.findById(
        profesional.user
      )

    if (!user) {
      throw createError(
        'Usuario asociado no encontrado',
        404
      )
    }

    const estado =
      user.estadoCuenta ||
      'aprobado'

    if (
      estado !==
      'aprobado'
    ) {
      throw createError(
        'Solo se puede activar o desactivar una cuenta aprobada',
        400
      )
    }

    profesional.activo =
      Boolean(activo)

    user.activo =
      Boolean(activo)

    await Promise.all([
      profesional.save(),
      user.save()
    ])

    return Profesional
      .findById(id)
      .populate(
        'user',
        'email role activo estadoCuenta'
      )
      .lean()
  }

/*
  APROBAR SOLICITUD
*/

export const aprobarSolicitud =
  async (id) => {
    const profesional =
      await Profesional
        .findById(id)

    if (!profesional) {
      throw createError(
        'Profesional no encontrado',
        404
      )
    }

    const user =
      await User.findById(
        profesional.user
      )

    if (!user) {
      throw createError(
        'Usuario asociado no encontrado',
        404
      )
    }

    const estadoActual =
      user.estadoCuenta ||
      'aprobado'

    if (
      estadoActual ===
      'aprobado'
    ) {
      throw createError(
        'Esta cuenta ya fue aprobada',
        400
      )
    }

    user.estadoCuenta =
      'aprobado'

    user.activo =
      true

    profesional.activo =
      true

    await Promise.all([
      user.save(),
      profesional.save()
    ])

    return Profesional
      .findById(id)
      .populate(
        'user',
        'email role activo estadoCuenta createdAt'
      )
      .lean()
  }

/*
  RECHAZAR SOLICITUD
*/

export const rechazarSolicitud =
  async (id) => {
    const profesional =
      await Profesional
        .findById(id)

    if (!profesional) {
      throw createError(
        'Profesional no encontrado',
        404
      )
    }

    const user =
      await User.findById(
        profesional.user
      )

    if (!user) {
      throw createError(
        'Usuario asociado no encontrado',
        404
      )
    }

    if (
      user.estadoCuenta ===
      'aprobado'
    ) {
      throw createError(
        'Una cuenta ya aprobada no puede rechazarse como solicitud',
        400
      )
    }

    user.estadoCuenta =
      'rechazado'

    user.activo =
      false

    profesional.activo =
      false

    await Promise.all([
      user.save(),
      profesional.save()
    ])

    return Profesional
      .findById(id)
      .populate(
        'user',
        'email role activo estadoCuenta createdAt'
      )
      .lean()
  }