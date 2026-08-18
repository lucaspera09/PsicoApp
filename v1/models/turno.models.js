import mongoose from 'mongoose'

const recurrenciaSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ['semanal'],
      default: 'semanal'
    },

    diasSemana: {
      type: [Number],
      default: []
    },

    fechaHasta: {
      type: Date,
      default: null
    }
  },
  {
    _id: false
  }
)

const turnoSchema = new mongoose.Schema(
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

    fechaInicio: {
      type: Date,
      required: true
    },

    fechaFin: {
      type: Date,
      required: true
    },

    estado: {
      type: String,
      enum: [
        'programado',
        'realizado',
        'cancelado',
        'no_asistio'
      ],
      default: 'programado'
    },

    recurrente: {
      type: Boolean,
      default: false
    },

    recurrencia: {
      type: recurrenciaSchema,
      default: null
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

turnoSchema.index({
  profesional: 1,
  fechaInicio: 1
})

turnoSchema.index({
  paciente: 1,
  fechaInicio: 1
})

const Turno = mongoose.model(
  'Turno',
  turnoSchema
)

export default Turno