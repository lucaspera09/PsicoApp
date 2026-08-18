import express from 'express'

import {
  getAll,
  getById,
  create,
  update,
  changeStatus,
  remove
} from '../controllers/turnos.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'
import authorize from '../middlewares/authorize.middleware.js'
import validateBody from '../middlewares/validateBody.middleware.js'

import {
  createTurnoSchema,
  updateTurnoSchema,
  changeTurnoStatusSchema
} from '../validators/turnos.validators.js'

const router = express.Router()

router.use(authenticate)
router.use(authorize('profesional'))

router.get(
  '/',
  getAll
)

router.get(
  '/:id',
  getById
)

router.post(
  '/',
  validateBody(createTurnoSchema),
  create
)

router.put(
  '/:id',
  validateBody(updateTurnoSchema),
  update
)

router.patch(
  '/:id/status',
  validateBody(changeTurnoStatusSchema),
  changeStatus
)

router.delete(
  '/:id',
  remove
)

export default router