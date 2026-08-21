import * as authService from '../services/auth.services.js'

export const registroProfesional =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await authService
          .registrarProfesional(
            req.body
          )

      res
        .status(201)
        .json(result)
    } catch (error) {
      next(error)
    }
  }

export const login =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        email,
        password
      } = req.body

      const result =
        await authService.login(
          email,
          password
        )

      res
        .status(200)
        .json(result)
    } catch (error) {
      next(error)
    }
  }

export const me =
  async (
    req,
    res,
    next
  ) => {
    try {
      const user =
        await authService
          .getCurrentUser(
            req.user.id
          )

      res
        .status(200)
        .json(user)
    } catch (error) {
      next(error)
    }
  }