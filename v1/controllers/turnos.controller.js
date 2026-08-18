import * as turnosService from '../services/turnos.services.js'

export const getAll = async (req, res, next) => {
  try {
    const turnos = await turnosService.getAll(
      req.user,
      req.query
    )

    res.status(200).json(turnos)
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const turno = await turnosService.getById(
      id,
      req.user
    )

    res.status(200).json(turno)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const turno = await turnosService.create(
      req.body,
      req.user
    )

    res.status(201).json(turno)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const { id } = req.params

    const turno = await turnosService.update(
      id,
      req.body,
      req.user
    )

    res.status(200).json(turno)
  } catch (error) {
    next(error)
  }
}

export const changeStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    const turno = await turnosService.changeStatus(
      id,
      estado,
      req.user
    )

    res.status(200).json(turno)
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params

    await turnosService.remove(
      id,
      req.user
    )

    res.status(200).json({
      message: 'Turno eliminado correctamente'
    })
  } catch (error) {
    next(error)
  }
}