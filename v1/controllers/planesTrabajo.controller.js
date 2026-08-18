import * as planesTrabajoService from '../services/planesTrabajo.services.js'

export const getByPaciente = async (req, res, next) => {
  try {
    const { pacienteId } = req.params

    const planes = await planesTrabajoService.getByPaciente(
      pacienteId,
      req.user
    )

    res.status(200).json(planes)
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const plan = await planesTrabajoService.getById(
      id,
      req.user
    )

    res.status(200).json(plan)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const plan = await planesTrabajoService.create(
      req.body,
      req.user
    )

    res.status(201).json(plan)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const { id } = req.params

    const plan = await planesTrabajoService.update(
      id,
      req.body,
      req.user
    )

    res.status(200).json(plan)
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params

    await planesTrabajoService.remove(
      id,
      req.user
    )

    res.status(200).json({
      message: 'Plan de trabajo eliminado correctamente'
    })
  } catch (error) {
    next(error)
  }
}