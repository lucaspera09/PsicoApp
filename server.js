import 'dotenv/config'
import dns from 'node:dns'

import app from './app.js'
import connectDB from './v1/config/db.config.js'

dns.setServers([
  '8.8.8.8',
  '1.1.1.1'
])

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(
        `Servidor funcionando en http://localhost:${PORT}`
      )
    })
  } catch (error) {
    console.error(
      'Error al iniciar el servidor:',
      error.message
    )

    process.exit(1)
  }
}

startServer()