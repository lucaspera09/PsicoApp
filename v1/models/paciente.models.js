import mongoose from 'mongoose'

const pacienteSchema = new mongoose.Schema(
  {
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

    fechaNacimiento: {
      type: Date,
      required: true
    },

    documento: {
      type: String,
      trim: true,
      default: ''
    },

    foto: {
      type: String,
      default: ''
    },

    fechaIngreso: {
      type: Date,
      default: Date.now
    },

    // INFORMACIÓN DE SALUD

    enfermedades: {
      type: [String],
      default: []
    },

    alergias: {
      type: [String],
      default: []
    },

    medicamentos: {
      type: [String],
      default: []
    },

    antecedentes: {
      type: String,
      trim: true,
      default: ''
    },

    informacionImportante: {
      type: String,
      trim: true,
      default: ''
    },

    observacionesGenerales: {
      type: String,
      trim: true,
      default: ''
    },

    // PROFESIONALES QUE ATIENDEN AL PACIENTE

    profesionales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profesional'
      }
    ],

    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

pacienteSchema.index({
  apellido: 1,
  nombre: 1
})

pacienteSchema.index({
  profesionales: 1
})

const Paciente = mongoose.model(
  'Paciente',
  pacienteSchema
)

export default Paciente