import express from 'express'

import {
  getByPaciente,
  getById,
  create,
  update,
  remove
} from '../controllers/responsables.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'
import authorize from '../middlewares/authorize.middleware.js'
import validateBody from '../middlewares/validateBody.middleware.js'

import {
  createResponsableSchema,
  updateResponsableSchema
} from '../validators/responsables.validators.js'

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
  validateBody(createResponsableSchema),
  create
)

router.put(
  '/:id',
  validateBody(updateResponsableSchema),
  update
)

router.delete(
  '/:id',
  remove
)

export default router