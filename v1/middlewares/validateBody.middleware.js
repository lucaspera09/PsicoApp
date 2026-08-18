const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync(req.body)

      if (!result.success) {
        const errores = result.error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensaje: issue.message
        }))

        return res.status(400).json({
          message: 'Los datos enviados no son válidos',
          errors: errores
        })
      }

      // Reemplazamos req.body por los datos ya validados
      // y procesados por Zod.
      req.body = result.data

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default validateBody