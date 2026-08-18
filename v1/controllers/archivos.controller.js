import * as archivosService from '../services/archivos.services.js'

export const getByPaciente = async (req, res, next) => {
  try {
    const { pacienteId } = req.params

    const archivos = await archivosService.getByPaciente(
      pacienteId,
      req.user
    )

    res.status(200).json(archivos)
  } catch (error) {
    next(error)
  }
}

export const upload = async (req, res, next) => {
  try {
    const archivo = await archivosService.upload({
      body: req.body,
      file: req.file,
      user: req.user
    })

    res.status(201).json(archivo)
  } catch (error) {
    next(error)
  }
}

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const archivo = await archivosService.getById(
      id,
      req.user
    )

    res.status(200).json(archivo)
  } catch (error) {
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params

    await archivosService.remove(
      id,
      req.user
    )

    res.status(200).json({
      message: 'Archivo eliminado correctamente'
    })
  } catch (error) {
    next(error)
  }
}