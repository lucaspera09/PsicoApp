import * as profesionalesService from '../services/profesionales.services.js'

export const getAll =
  async (
    req,
    res,
    next
  ) => {
    try {
      const profesionales =
        await profesionalesService
          .getAll(
            req.query
          )

      res
        .status(200)
        .json(
          profesionales
        )
    } catch (error) {
      next(error)
    }
  }

export const getById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params

      const profesional =
        await profesionalesService
          .getById(id)

      res
        .status(200)
        .json(
          profesional
        )
    } catch (error) {
      next(error)
    }
  }

export const create =
  async (
    req,
    res,
    next
  ) => {
    try {
      const profesional =
        await profesionalesService
          .create(
            req.body
          )

      res
        .status(201)
        .json(
          profesional
        )
    } catch (error) {
      next(error)
    }
  }

export const update =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params

      const profesional =
        await profesionalesService
          .update(
            id,
            req.body
          )

      res
        .status(200)
        .json(
          profesional
        )
    } catch (error) {
      next(error)
    }
  }

export const changeStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params

      const { activo } =
        req.body

      const profesional =
        await profesionalesService
          .changeStatus(
            id,
            activo
          )

      res
        .status(200)
        .json(
          profesional
        )
    } catch (error) {
      next(error)
    }
  }

/*
  APROBAR SOLICITUD
*/

export const aprobarSolicitud =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params

      const profesional =
        await profesionalesService
          .aprobarSolicitud(
            id
          )

      res
        .status(200)
        .json({
          message:
            'Solicitud aprobada correctamente',

          data:
            profesional
        })
    } catch (error) {
      next(error)
    }
  }

/*
  RECHAZAR SOLICITUD
*/

export const rechazarSolicitud =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } =
        req.params

      const profesional =
        await profesionalesService
          .rechazarSolicitud(
            id
          )

      res
        .status(200)
        .json({
          message:
            'Solicitud rechazada',

          data:
            profesional
        })
    } catch (error) {
      next(error)
    }
  }