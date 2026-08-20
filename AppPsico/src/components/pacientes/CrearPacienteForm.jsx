import { useState } from 'react'

import api from '../../api/api.js'

export default function CrearPacienteForm({
  onCreated,
  onCancel
}) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    documento: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))

    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const response = await api.post(
        '/pacientes',
        {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          fechaNacimiento:
            form.fechaNacimiento,
          documento:
            form.documento.trim()
        }
      )

      const nuevoPaciente =
        response.data?.data ||
        response.data

      if (onCreated) {
        onCreated(nuevoPaciente)
      }

      setForm({
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        documento: ''
      })
    } catch (error) {
      console.error(
        'Error al crear paciente:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo crear el paciente'
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
            Nueva ficha
          </p>

          <h2>
            Nuevo paciente
          </h2>

          <p>
            Completá los datos básicos
            para crear la ficha del paciente.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="patient-form"
      >

        <div className="patient-form-grid">

          <div className="form-group">
            <label htmlFor="nombre">
              Nombre
            </label>

            <input
              id="nombre"
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
            <label htmlFor="apellido">
              Apellido
            </label>

            <input
              id="apellido"
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
            <label htmlFor="fechaNacimiento">
              Fecha de nacimiento
            </label>

            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="documento">
              Documento
            </label>

            <input
              id="documento"
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
              ? 'Creando...'
              : 'Crear paciente'}
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