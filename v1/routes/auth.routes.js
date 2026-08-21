import express from 'express'

import {
  registroProfesional,
  login,
  me
} from '../controllers/auth.controller.js'

import authenticate from '../middlewares/authenticate.middleware.js'

import validateBody from '../middlewares/validateBody.middleware.js'

import {
  loginSchema,
  registroProfesionalSchema
} from '../validators/auth.validators.js'

const router =
  express.Router()

/*
  REGISTRO PÚBLICO

  No lleva authenticate porque
  justamente todavía no existe
  una cuenta aprobada.
*/

router.post(
  '/register',

  validateBody(
    registroProfesionalSchema
  ),

  registroProfesional
)

/*
  LOGIN
*/

router.post(
  '/login',

  validateBody(
    loginSchema
  ),

  login
)

/*
  USUARIO ACTUAL
*/

router.get(
  '/me',
  authenticate,
  me
)

export default router