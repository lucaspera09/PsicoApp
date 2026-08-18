import express from 'express'

import {
  getByPaciente,
  getById,
  create,
  update,
  remove
} from '../controllers/notas.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'
import authorize from '../middlewares/authorize.middleware.js'
import validateBody from '../middlewares/validateBody.middleware.js'

import {
  createNotaSchema,
  updateNotaSchema
} from '../validators/notas.validators.js'

const router = express.Router()

router.use(authenticate)
router.use(authorize('profesional'))

router.get(
  '/paciente/:pacienteId',
  getByPaciente
)

router.get(
  '/:id',
  getById
)

router.post(
  '/',
  validateBody(createNotaSchema),
  create
)

router.put(
  '/:id',
  validateBody(updateNotaSchema),
  update
)

router.delete(
  '/:id',
  remove
)

export default router