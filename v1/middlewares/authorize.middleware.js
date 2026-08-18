const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuario no autenticado'
      })
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        message: 'No tenés permisos para realizar esta acción'
      })
    }

    next()
  }
}

export default authorize