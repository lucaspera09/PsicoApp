import mongoose from 'mongoose'

const archivoSchema = new mongoose.Schema(
  {
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: true
    },

    profesional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profesional',
      required: true
    },

    nombre: {
      type: String,
      required: true,
      trim: true
    },

    nombreOriginal: {
      type: String,
      trim: true,
      default: ''
    },

    tipo: {
      type: String,
      default: ''
    },

    tamaño: {
      type: Number,
      default: 0
    },

    url: {
      type: String,
      required: true
    },

    storageId: {
      type: String,
      default: ''
    },

    descripcion: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

archivoSchema.index({
  paciente: 1,
  createdAt: -1
})

const Archivo = mongoose.model(
  'Archivo',
  archivoSchema
)

export default Archivo