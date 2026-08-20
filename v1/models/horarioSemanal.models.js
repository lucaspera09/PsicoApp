import mongoose from 'mongoose'

const horarioSemanalSchema = new mongoose.Schema(
  {
    pacientes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: true
      }
    ],

    profesional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profesional',
      required: true
    },

    diaSemana: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },

    horaInicio: {
      type: String,
      required: true,
      trim: true
    },

    horaFin: {
      type: String,
      required: true,
      trim: true
    },

    fechaDesde: {
      type: Date,
      default: Date.now
    },

    fechaHasta: {
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

horarioSemanalSchema.index({
  profesional: 1,
  diaSemana: 1,
  horaInicio: 1
})

const HorarioSemanal =
  mongoose.model(
    'HorarioSemanal',
    horarioSemanalSchema
  )

export default HorarioSemanal