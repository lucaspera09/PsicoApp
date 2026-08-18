const errorMiddleware = (err, req, res, next) => {
  console.error(err)

  let statusCode = err.statusCode || 500
  let message = err.message || 'Error interno del servidor'

  // ID de MongoDB inválido
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'El ID proporcionado no es válido'
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400

    const errors = Object.values(err.errors).map(
      (error) => ({
        campo: error.path,
        mensaje: error.message
      })
    )

    return res.status(statusCode).json({
      message: 'Error de validación',
      errors
    })
  }

  // Campo unique duplicado en MongoDB
  if (err.code === 11000) {
    statusCode = 409

    const campo = Object.keys(
      err.keyValue || {}
    )[0]

    message = campo
      ? `Ya existe un registro con ese ${campo}`
      : 'Ya existe un registro con esos datos'
  }

  const response = {
    message
  }

  // Solamente mostramos detalles técnicos
  // mientras desarrollamos.
  if (
    process.env.NODE_ENV === 'development' &&
    err.stack
  ) {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}

export default errorMiddleware