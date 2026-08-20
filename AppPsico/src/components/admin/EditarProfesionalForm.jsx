import { useState } from 'react'

import api from '../../api/api.js'

export default function EditarProfesionalForm({
  profesional,
  onUpdated,
  onCancel
}) {
  const [form, setForm] = useState({
    nombre: profesional.nombre || '',
    apellido: profesional.apellido || '',
    profesion: profesional.profesion || '',
    telefono: profesional.telefono || ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target

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
        `/profesionales/${profesional._id}`,
        form
      )

      const profesionalActualizado =
        response.data?.data ||
        response.data

      if (onUpdated) {
        onUpdated(
          profesionalActualizado
        )
      }
    } catch (error) {
      console.error(
        'Error al editar profesional:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo editar el profesional'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="professional-form-section">

      <div className="professional-form-header">

        <div>
          <p className="professional-form-eyebrow">
            Editando cuenta
          </p>

          <h2>
            Editar profesional
          </h2>

          <p>
            Actualizá los datos del profesional.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="professional-form"
      >

        <div className="professional-form-grid">

          <div className="form-group">
            <label htmlFor="editar-nombre">
              Nombre
            </label>

            <input
              id="editar-nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: Paula"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="editar-apellido">
              Apellido
            </label>

            <input
              id="editar-apellido"
              name="apellido"
              type="text"
              value={form.apellido}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="editar-profesion">
              Profesión
            </label>

            <input
              id="editar-profesion"
              name="profesion"
              type="text"
              value={form.profesion}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: Psicomotricista"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="editar-telefono">
              Teléfono
            </label>

            <input
              id="editar-telefono"
              name="telefono"
              type="text"
              value={form.telefono}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: 099 123 456"
            />
          </div>

        </div>

        {error && (
          <div className="professional-form-error">
            {error}
          </div>
        )}

        <div className="professional-form-actions">

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