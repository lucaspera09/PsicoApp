import mongoose from 'mongoose'

const profesionalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    nombre: {
      type: String,
      required: true,
      trim: true
    },

    apellido: {
      type: String,
      required: true,
      trim: true
    },

    profesion: {
      type: String,
      required: true,
      trim: true
    },

    telefono: {
      type: String,
      trim: true,
      default: ''
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

profesionalSchema.index({
  apellido: 1,
  nombre: 1
})

const Profesional = mongoose.model(
  'Profesional',
  profesionalSchema
)

export default Profesional