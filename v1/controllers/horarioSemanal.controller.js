import * as horarioSemanalService from '../services/horarioSemanal.service.js'

export const listar = async (req, res, next) => {
  try {
    const horarios =
      await horarioSemanalService.listarHorariosSemanales(
        req.user
      )

    res.status(200).json(horarios)
  } catch (error) {
    next(error)
  }
}

export const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params

    const horario =
      await horarioSemanalService.obtenerHorarioSemanalPorId(
        id,
        req.user
      )

    res.status(200).json(horario)
  } catch (error) {
    next(error)
  }
}

export const crear = async (req, res, next) => {
  try {
    const horario =
      await horarioSemanalService.crearHorarioSemanal(
        req.body,
        req.user
      )

    res.status(201).json(horario)
  } catch (error) {
    next(error)
  }
}

export const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params

    const horario =
      await horarioSemanalService.actualizarHorarioSemanal(
        id,
        req.body,
        req.user
      )

    res.status(200).json(horario)
  } catch (error) {
    next(error)
  }
}

export const desactivar = async (req, res, next) => {
  try {
    const { id } = req.params

    await horarioSemanalService.desactivarHorarioSemanal(
      id,
      req.user
    )

    res.status(200).json({
      message: 'Horario semanal desactivado correctamente'
    })
  } catch (error) {
    next(error)
  }
}