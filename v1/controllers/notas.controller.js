import * as notasService from '../services/notas.services.js'

export const getByPaciente = async (req, res, next) => {
  try {
    const { pacienteId } = req.params

    const notas = await notasService.getByPaciente(
      pacienteId,
      req.user
    )

    res.status(200).json(notas)
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const nota = await notasService.getById(
      id,
      req.user
    )

    res.status(200).json(nota)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const nota = await notasService.create(
      req.body,
      req.user
    )

    res.status(201).json(nota)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const { id } = req.params

    const nota = await notasService.update(
      id,
      req.body,
      req.user
    )

    res.status(200).json(nota)
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params

    await notasService.remove(
      id,
      req.user
    )

    res.status(200).json({
      message: 'Nota eliminada correctamente'
    })
  } catch (error) {
    next(error)
  }
}