import Nota from '../models/nota.models.js'
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

  return Nota.find({
    paciente: pacienteId
  })
    .populate(
      'profesional',
      'nombre apellido profesion'
    )
    .sort({ fecha: -1, createdAt: -1 })
    .lean()
}

export const getById = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const nota = await Nota.findById(id)

  if (!nota) {
    throw createError('Nota no encontrada', 404)
  }

  await validarPaciente(
    nota.paciente,
    profesional._id
  )

  return nota
}

export const create = async (data, user) => {
  const profesional = await getProfesionalActual(user)

  await validarPaciente(
    data.paciente,
    profesional._id
  )

  return Nota.create({
    ...data,

    profesional: profesional._id,

    fecha: data.fecha || new Date()
  })
}

export const update = async (id, data, user) => {
  const profesional = await getProfesionalActual(user)

  const nota = await Nota.findById(id)

  if (!nota) {
    throw createError('Nota no encontrada', 404)
  }

  await validarPaciente(
    nota.paciente,
    profesional._id
  )

  if (
    nota.profesional.toString() !==
    profesional._id.toString()
  ) {
    throw createError(
      'No podés modificar una nota creada por otro profesional',
      403
    )
  }

  const camposPermitidos = [
    'titulo',
    'tipo',
    'contenido',
    'fecha'
  ]

  camposPermitidos.forEach((campo) => {
    if (data[campo] !== undefined) {
      nota[campo] = data[campo]
    }
  })

  await nota.save()

  return nota
}

export const remove = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const nota = await Nota.findById(id)

  if (!nota) {
    throw createError('Nota no encontrada', 404)
  }

  await validarPaciente(
    nota.paciente,
    profesional._id
  )

  if (
    nota.profesional.toString() !==
    profesional._id.toString()
  ) {
    throw createError(
      'No podés eliminar una nota creada por otro profesional',
      403
    )
  }

  await nota.deleteOne()

  return true
}