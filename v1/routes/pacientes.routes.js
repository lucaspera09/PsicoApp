import express from 'express'

import {
  getAll,
  getById,
  create,
  update,
  changeStatus
} from '../controllers/pacientes.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'
import authorize from '../middlewares/authorize.middleware.js'
import validateBody from '../middlewares/validateBody.middleware.js'

import {
  createPacienteSchema,
  updatePacienteSchema,
  changePacienteStatusSchema
} from '../validators/pacientes.validators.js'

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
  validateBody(createPacienteSchema),
  create
)

router.put(
  '/:id',
  validateBody(updatePacienteSchema),
  update
)

router.patch(
  '/:id/status',
  validateBody(changePacienteStatusSchema),
  changeStatus
)

export default router