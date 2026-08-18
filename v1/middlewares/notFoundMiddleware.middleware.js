const notFoundMiddleware = (req, res, next) => {
  const error = new Error(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  )

  error.statusCode = 404

  next(error)
}

export default notFoundMiddleware