import express from 'express'
import cors from 'cors'

import v1Routes from './v1/v1.routes.js'

import notFoundMiddleware from './v1/middlewares/notFoundMiddleware.middleware.js'
import errorMiddleware from './v1/middlewares/error.middleware.js'

const app = express()

// Permite recibir JSON en el body
app.use(express.json())

// Permite recibir formularios simples
app.use(
  express.urlencoded({
    extended: true
  })
)

// Habilita CORS
app.use(cors())

// Ruta simple para comprobar que la API funciona
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API PsicoApp funcionando'
  })
})

// API versionada
app.use('/v1', v1Routes)

// Rutas inexistentes
app.use(notFoundMiddleware)

// Manejo centralizado de errores
app.use(errorMiddleware)

export default app