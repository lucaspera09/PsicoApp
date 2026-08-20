import { useState } from 'react'

import api from '../../api/api.js'

export default function CrearNotaForm({
  pacienteId,
  onCreated,
  onCancel
}) {
  const hoy = new Date()
    .toISOString()
    .split('T')[0]

  const [form, setForm] = useState({
    titulo: '',
    tipo: 'entrevista',
    fecha: hoy,
    contenido: ''
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
        '/notas',
        {
          paciente: pacienteId,
          titulo: form.titulo.trim(),
          tipo: form.tipo,
          fecha: form.fecha,
          contenido: form.contenido.trim()
        }
      )

      const nuevaNota =
        response.data?.data ||
        response.data

      if (onCreated) {
        onCreated(nuevaNota)
      }
    } catch (error) {
      console.error(
        'Error al crear nota:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo crear la nota'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="note-form-section">

      <div className="note-form-header">

        <div>
          <p className="note-form-eyebrow">
            Seguimiento
          </p>

          <h3>
            Nueva nota
          </h3>

          <p>
            Registrá entrevistas, llamadas,
            reuniones u observaciones relevantes.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="note-form"
      >

        <div className="note-form-grid">

          <div className="form-group note-form-title">

            <label htmlFor="nota-titulo">
              Título
            </label>

            <input
              id="nota-titulo"
              name="titulo"
              type="text"
              value={form.titulo}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: Entrevista con la madre"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="nota-tipo">
              Tipo
            </label>

            <select
              id="nota-tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="entrevista">
                Entrevista
              </option>

              <option value="llamada">
                Llamada
              </option>

              <option value="comentario_padres">
                Comentario de padres
              </option>

              <option value="reunion">
                Reunión
              </option>

              <option value="observacion">
                Observación
              </option>

              <option value="otro">
                Otro
              </option>
            </select>

          </div>

          <div className="form-group">

            <label htmlFor="nota-fecha">
              Fecha
            </label>

            <input
              id="nota-fecha"
              name="fecha"
              type="date"
              value={form.fecha}
              onChange={handleChange}
              className="form-control"
              required
            />

          </div>

        </div>

        <div className="form-group">

          <label htmlFor="nota-contenido">
            Contenido
          </label>

          <textarea
            id="nota-contenido"
            name="contenido"
            value={form.contenido}
            onChange={handleChange}
            className="form-control note-form-textarea"
            rows="6"
            placeholder="Escribí acá la información relevante..."
            required
          />

        </div>

        {error && (
          <div className="note-form-error">
            {error}
          </div>
        )}

        <div className="note-form-actions">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : 'Guardar nota'}
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