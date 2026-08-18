import mongoose from 'mongoose'

const notaSchema = new mongoose.Schema(
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
      trim: true,
      default: ''
    },

    tipo: {
      type: String,
      enum: [
        'entrevista',
        'llamada',
        'comentario_padres',
        'reunion',
        'observacion',
        'otro'
      ],
      default: 'otro'
    },

    contenido: {
      type: String,
      required: true,
      trim: true
    },

    fecha: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

notaSchema.index({
  paciente: 1,
  fecha: -1
})

const Nota = mongoose.model(
  'Nota',
  notaSchema
)

export default Nota