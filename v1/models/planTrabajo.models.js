import mongoose from 'mongoose'

const objetivoSchema = new mongoose.Schema(
  {
    descripcion: {
      type: String,
      required: true,
      trim: true
    },

    estado: {
      type: String,
      enum: [
        'pendiente',
        'en_progreso',
        'logrado'
      ],
      default: 'pendiente'
    },

    observacion: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

const planTrabajoSchema = new mongoose.Schema(
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

    titulo: {
      type: String,
      required: true,
      trim: true
    },

    descripcion: {
      type: String,
      trim: true,
      default: ''
    },

    objetivos: {
      type: [objetivoSchema],
      default: []
    },

    fechaInicio: {
      type: Date,
      default: Date.now
    },

    fechaFin: {
      type: Date,
      default: null
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

planTrabajoSchema.index({
  paciente: 1,
  profesional: 1
})

const PlanTrabajo = mongoose.model(
  'PlanTrabajo',
  planTrabajoSchema
)

export default PlanTrabajo