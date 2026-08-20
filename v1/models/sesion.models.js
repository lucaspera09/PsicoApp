import mongoose from 'mongoose'

const sesionSchema = new mongoose.Schema(
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

    turno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turno',
      default: null
    },

    fecha: {
      type: Date,
      default: Date.now
    },

    areas: {
      type: [String],
      default: []
    },

    actividades: {
      type: [String],
      default: []
    },

    observacion: {
      type: String,
      trim: true,
      default: ''
    },

    proximaSesion: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

sesionSchema.index({
  paciente: 1,
  fecha: -1
})

sesionSchema.index({
  profesional: 1,
  fecha: -1
})

sesionSchema.index(
  {
    paciente: 1,
    turno: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      turno: {
        $type: 'objectId'
      }
    }
  }
)

const Sesion = mongoose.model(
  'Sesion',
  sesionSchema
)

export default Sesion