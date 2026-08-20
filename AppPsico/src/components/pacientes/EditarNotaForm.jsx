import { useState } from 'react'

import api from '../../api/api.js'

export default function EditarNotaForm({
  nota,
  onUpdated,
  onCancel
}) {
  const [form, setForm] = useState({
    titulo: nota.titulo || '',
    tipo: nota.tipo || 'entrevista',
    fecha: nota.fecha
      ? nota.fecha.substring(0, 10)
      : '',
    contenido: nota.contenido || ''
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

      const response = await api.put(
        `/notas/${nota._id}`,
        {
          titulo: form.titulo.trim(),
          tipo: form.tipo,
          fecha: form.fecha,
          contenido: form.contenido.trim()
        }
      )

      const notaActualizada =
        response.data?.data ||
        response.data

      if (onUpdated) {
        onUpdated(
          notaActualizada
        )
      }
    } catch (error) {
      console.error(
        'Error al editar nota:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo editar la nota'
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
            Editar nota
          </h3>

          <p>
            Modificá la información
            registrada en esta nota.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="note-form"
      >

        <div className="note-form-grid">

          <div className="form-group note-form-title">

            <label htmlFor="editar-nota-titulo">
              Título
            </label>

            <input
              id="editar-nota-titulo"
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

            <label htmlFor="editar-nota-tipo">
              Tipo
            </label>

            <select
              id="editar-nota-tipo"
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

            <label htmlFor="editar-nota-fecha">
              Fecha
            </label>

            <input
              id="editar-nota-fecha"
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

          <label htmlFor="editar-nota-contenido">
            Contenido
          </label>

          <textarea
            id="editar-nota-contenido"
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