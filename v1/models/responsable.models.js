import mongoose from 'mongoose'

const responsableSchema = new mongoose.Schema(
  {
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: true
    },

    nombre: {
      type: String,
      required: true,
      trim: true
    },

    apellido: {
      type: String,
      trim: true,
      default: ''
    },

    relacion: {
      type: String,
      required: true,
      trim: true
    },

    telefono: {
      type: String,
      trim: true,
      default: ''
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },

    principal: {
      type: Boolean,
      default: false
    },

    contactoEmergencia: {
      type: Boolean,
      default: false
    },

    observaciones: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

responsableSchema.index({
  paciente: 1
})

const Responsable = mongoose.model(
  'Responsable',
  responsableSchema
)

export default Responsable