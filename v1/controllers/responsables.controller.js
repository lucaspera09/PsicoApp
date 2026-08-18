import * as responsablesService from '../services/responsables.services.js'

export const getByPaciente = async (req, res, next) => {
  try {
    const { pacienteId } = req.params

    const responsables = await responsablesService.getByPaciente(
      pacienteId,
      req.user
    )

    res.status(200).json(responsables)
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const responsable = await responsablesService.getById(
      id,
      req.user
    )

    res.status(200).json(responsable)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const responsable = await responsablesService.create(
      req.body,
      req.user
    )

    res.status(201).json(responsable)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const { id } = req.params

    const responsable = await responsablesService.update(
      id,
      req.body,
      req.user
    )

    res.status(200).json(responsable)
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params

    await responsablesService.remove(
      id,
      req.user
    )

    res.status(200).json({
      message: 'Responsable eliminado correctamente'
    })
  } catch (error) {
    next(error)
  }
}