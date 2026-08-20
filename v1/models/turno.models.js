import mongoose from 'mongoose'

const participanteSchema =
  new mongoose.Schema(
    {
      paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
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
      }
    },
    {
      _id: false
    }
  )

const turnoSchema =
  new mongoose.Schema(
    {
      profesional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profesional',
        required: true
      },

      participantes: {
        type: [participanteSchema],
        required: true,
        validate: {
          validator: (
            participantes
          ) =>
            participantes.length >
            0,

          message:
            'El turno debe tener al menos un paciente'
        }
      },

      fechaInicio: {
        type: Date,
        required: true
      },

      fechaFin: {
        type: Date,
        required: true
      },

      observacion: {
        type: String,
        trim: true,
        default: ''
      },

      recurrente: {
        type: Boolean,
        default: false
      },

      recurrencia: {
        tipo: {
          type: String,
          enum: ['semanal']
        },

        diasSemana: [
          {
            type: Number,
            min: 0,
            max: 6
          }
        ],

        fechaHasta: {
          type: Date
        }
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

const Turno =
  mongoose.model(
    'Turno',
    turnoSchema
  )

export default Turno