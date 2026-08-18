import * as pacientesService from '../services/pacientes.services.js'

export const getAll = async (req, res, next) => {
  try {
    const pacientes = await pacientesService.getAll(
      req.user,
      req.query
    )

    res.status(200).json(pacientes)
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const paciente = await pacientesService.getById(
      id,
      req.user
    )

    res.status(200).json(paciente)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const paciente = await pacientesService.create(
      req.body,
      req.user
    )

    res.status(201).json(paciente)
  } catch (error) {
    next(error)
  }
}

export const update = async (req, res, next) => {
  try {
    const { id } = req.params

    const paciente = await pacientesService.update(
      id,
      req.body,
      req.user
    )

    res.status(200).json(paciente)
  } catch (error) {
    next(error)
  }
}

export const changeStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { activo } = req.body

    const paciente = await pacientesService.changeStatus(
      id,
      activo,
      req.user
    )

    res.status(200).json(paciente)
  } catch (error) {
    next(error)
  }
}