import express from 'express'

import {
  login,
  me
} from '../controllers/auth.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'
import validateBody from '../middlewares/validateBody.middleware.js'

import {
  loginSchema
} from '../validators/auth.validators.js'

const router = express.Router()

router.post(
  '/login',
  validateBody(loginSchema),
  login
)

router.get(
  '/me',
  authenticate,
  me
)

export default router