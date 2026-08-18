import jwt from 'jsonwebtoken'
import User from '../models/user.models.js'

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Token de autenticación requerido'
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        message: 'Token de autenticación requerido'
      })
    }

    let decoded

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      )
    } catch (error) {
      return res.status(401).json({
        message: 'Token inválido o expirado'
      })
    }

    const user = await User.findById(decoded.id)
      .select('_id email role activo')
      .lean()

    if (!user) {
      return res.status(401).json({
        message: 'Usuario no encontrado'
      })
    }

    if (!user.activo) {
      return res.status(403).json({
        message: 'El usuario se encuentra inactivo'
      })
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    }

    next()
  } catch (error) {
    next(error)
  }
}

export default authenticate