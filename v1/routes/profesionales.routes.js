import express from 'express'

import {
  getAll,
  getById,
  create,
  update,
  changeStatus,
  aprobarSolicitud,
  rechazarSolicitud
} from '../controllers/profesionales.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'

import authorize from '../middlewares/authorize.middleware.js'

import validateBody from '../middlewares/validateBody.middleware.js'

import {
  createProfesionalSchema,
  updateProfesionalSchema,
  changeProfesionalStatusSchema
} from '../validators/profesionales.validators.js'

const router =
  express.Router()

/*
  TODO ESTE MÓDULO
  ES SOLO PARA ADMIN
*/

router.use(
  authenticate
)

router.use(
  authorize('admin')
)

/*
  LISTADO
*/

router.get(
  '/',
  getAll
)

/*
  SOLICITUDES

  IMPORTANTE:
  van antes de /:id
*/

router.patch(
  '/:id/aprobar',
  aprobarSolicitud
)

router.patch(
  '/:id/rechazar',
  rechazarSolicitud
)

/*
  DETALLE
*/

router.get(
  '/:id',
  getById
)

/*
  CREAR DESDE ADMIN

  Se mantiene por ahora
  por compatibilidad.
*/

router.post(
  '/',

  validateBody(
    createProfesionalSchema
  ),

  create
)

/*
  EDITAR
*/

router.put(
  '/:id',

  validateBody(
    updateProfesionalSchema
  ),

  update
)

/*
  ACTIVAR / DESACTIVAR
*/

router.patch(
  '/:id/status',

  validateBody(
    changeProfesionalStatusSchema
  ),

  changeStatus
)

export default router