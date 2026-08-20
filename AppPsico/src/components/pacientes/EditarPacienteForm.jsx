import { useState } from 'react'

import api from '../../api/api.js'

export default function EditarPacienteForm({
  paciente,
  onUpdated,
  onCancel
}) {
  const [form, setForm] = useState({
    nombre:
      paciente.nombre || '',

    apellido:
      paciente.apellido || '',

    fechaNacimiento:
      paciente.fechaNacimiento
        ? paciente.fechaNacimiento.substring(
            0,
            10
          )
        : '',

    documento:
      paciente.documento || ''
  })

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

  const handleChange = (
    event
  ) => {
    const {
      name,
      value
    } = event.target

    setForm(
      (prev) => ({
        ...prev,
        [name]: value
      })
    )

    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const response =
        await api.put(
          `/pacientes/${paciente._id}`,
          {
            nombre:
              form.nombre.trim(),

            apellido:
              form.apellido.trim(),

            fechaNacimiento:
              form.fechaNacimiento,

            documento:
              form.documento.trim()
          }
        )

      const pacienteActualizado =
        response.data?.data ||
        response.data

      if (onUpdated) {
        onUpdated(
          pacienteActualizado
        )
      }
    } catch (error) {
      console.error(
        'Error al editar paciente:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo editar el paciente'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="patient-form-section">

      <div className="patient-form-header">

        <div>
          <p className="patient-form-eyebrow">
            Ficha del paciente
          </p>

          <h2>
            Editar paciente
          </h2>

          <p>
            Modificá los datos personales
            del paciente.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="patient-form"
      >

        <div className="patient-form-grid">

          <div className="form-group">

            <label htmlFor="editar-paciente-nombre">
              Nombre
            </label>

            <input
              id="editar-paciente-nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: Mateo"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="editar-paciente-apellido">
              Apellido
            </label>

            <input
              id="editar-paciente-apellido"
              name="apellido"
              type="text"
              value={form.apellido}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: Rodríguez"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="editar-paciente-fecha">
              Fecha de nacimiento
            </label>

            <input
              id="editar-paciente-fecha"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="form-control"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="editar-paciente-documento">
              Documento
            </label>

            <input
              id="editar-paciente-documento"
              name="documento"
              type="text"
              value={form.documento}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: 5.123.456-7"
            />

          </div>

        </div>

        {error && (
          <div className="patient-form-error">
            {error}
          </div>
        )}

        <div className="patient-form-actions">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>

        </div>

      </form>

    </section>
  )
}