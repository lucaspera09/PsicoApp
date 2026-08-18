import Archivo from '../models/archivo.models.js'
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

  return Archivo.find({
    paciente: pacienteId
  })
    .sort({ createdAt: -1 })
    .lean()
}

export const getById = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const archivo = await Archivo.findById(id)

  if (!archivo) {
    throw createError('Archivo no encontrado', 404)
  }

  await validarPaciente(
    archivo.paciente,
    profesional._id
  )

  return archivo
}

export const upload = async ({
  body,
  file,
  user
}) => {
  const profesional = await getProfesionalActual(user)

  if (!file) {
    throw createError(
      'No se recibió ningún archivo',
      400
    )
  }

  await validarPaciente(
    body.paciente,
    profesional._id
  )

  const archivo = await Archivo.create({
    paciente: body.paciente,

    profesional: profesional._id,

    nombre:
      body.nombre ||
      file.originalname,

    nombreOriginal:
      file.originalname,

    tipo:
      file.mimetype,

    tamaño:
      file.size,

    url:
      file.path,

    storageId:
      file.filename
  })

  return archivo
}

export const remove = async (id, user) => {
  const profesional = await getProfesionalActual(user)

  const archivo = await Archivo.findById(id)

  if (!archivo) {
    throw createError('Archivo no encontrado', 404)
  }

  await validarPaciente(
    archivo.paciente,
    profesional._id
  )

  await archivo.deleteOne()

  /*
    Cuando configuremos Cloudinary/S3,
    antes de eliminar el registro también
    eliminaremos el archivo físico.
  */

  return true
}