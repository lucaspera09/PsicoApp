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

      if (onUpdated) {
        onUpdated(response.data)
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
    <section>
      <h2>Editar profesional</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="editar-nombre">
            Nombre
          </label>

          <input
            id="editar-nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-apellido">
            Apellido
          </label>

          <input
            id="editar-apellido"
            name="apellido"
            type="text"
            value={form.apellido}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-profesion">
            Profesión
          </label>

          <input
            id="editar-profesion"
            name="profesion"
            type="text"
            value={form.profesion}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-telefono">
            Teléfono
          </label>

          <input
            id="editar-telefono"
            name="telefono"
            type="text"
            value={form.telefono}
            onChange={handleChange}
          />
        </div>

        {error && (
          <p>{error}</p>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>

          <button
            type="button"
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