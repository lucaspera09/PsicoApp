import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dns from 'node:dns'

import connectDB from './v1/config/db.config.js'
import User from './v1/models/user.models.js'

dns.setServers([
  '8.8.8.8',
  '1.1.1.1'
])

const seedAdmin = async () => {
  try {
    await connectDB()

    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
      throw new Error(
        'Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el archivo .env'
      )
    }

    const emailNormalizado = email
      .toLowerCase()
      .trim()

    const adminExistente = await User.findOne({
      email: emailNormalizado
    })

    if (adminExistente) {
      console.log('Ya existe un usuario con ese email')
      return
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    )

    await User.create({
      email: emailNormalizado,
      password: passwordHash,
      role: 'admin',
      activo: true
    })

    console.log('Administrador creado correctamente')
    console.log(`Email: ${emailNormalizado}`)
  } catch (error) {
    console.error(
      'Error al crear administrador:',
      error.message
    )
  } finally {
    await mongoose.connection.close()
  }
}

seedAdmin()