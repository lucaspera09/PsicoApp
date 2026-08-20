import express from 'express'

import {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  desactivar
} from '../controllers/horarioSemanal.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'

import authorize from '../middlewares/authorize.middleware.js'

import validateBody from '../middlewares/validateBody.middleware.js'

import {
  crearHorarioSemanalSchema,
  actualizarHorarioSemanalSchema
} from '../validators/horarioSemanal.validator.js'

const router = express.Router()

router.use(authenticate)

router.use(
  authorize('profesional')
)

router.get(
  '/',
  listar
)

router.get(
  '/:id',
  obtenerPorId
)

router.post(
  '/',
  validateBody(
    crearHorarioSemanalSchema
  ),
  crear
)

router.put(
  '/:id',
  validateBody(
    actualizarHorarioSemanalSchema
  ),
  actualizar
)

router.delete(
  '/:id',
  desactivar
)

export default router