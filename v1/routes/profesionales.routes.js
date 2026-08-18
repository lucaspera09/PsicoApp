import express from 'express'

import {
  getAll,
  getById,
  create,
  update,
  changeStatus
} from '../controllers/profesionales.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'
import authorize from '../middlewares/authorize.middleware.js'
import validateBody from '../middlewares/validateBody.middleware.js'

import {
  createProfesionalSchema,
  updateProfesionalSchema,
  changeProfesionalStatusSchema
} from '../validators/profesionales.validators.js'

const router = express.Router()

router.use(authenticate)
router.use(authorize('admin'))

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
  validateBody(createProfesionalSchema),
  create
)

router.put(
  '/:id',
  validateBody(updateProfesionalSchema),
  update
)

router.patch(
  '/:id/status',
  validateBody(changeProfesionalStatusSchema),
  changeStatus
)

export default router