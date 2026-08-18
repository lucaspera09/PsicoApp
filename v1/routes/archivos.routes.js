import express from 'express'

import {
  getByPaciente,
  getById,
  remove
} from '../controllers/archivos.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'
import authorize from '../middlewares/authorize.middleware.js'

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

router.delete(
  '/:id',
  remove
)

export default router