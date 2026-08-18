import * as sesionesService from '../services/sesiones.services.js'

export const getByPaciente = async (req, res, next) => {
  try {
    const { pacienteId } = req.params

    const sesiones = await sesionesService.getByPaciente(
      pacienteId,
      req.user,
      req.query
    )

    res.status(200).json(sesiones)
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const sesion = await sesionesService.getById(
      id,
      req.user
    )

    res.status(200).json(sesion)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const sesion = await sesionesService.create(
      req.body,
      req.user
    )

    res.status(201).json(sesion)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const { id } = req.params

    const sesion = await sesionesService.update(
      id,
      req.body,
      req.user
    )

    res.status(200).json(sesion)
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params

    await sesionesService.remove(
      id,
      req.user
    )

    res.status(200).json({
      message: 'Sesión eliminada correctamente'
    })
  } catch (error) {
    next(error)
  }
}