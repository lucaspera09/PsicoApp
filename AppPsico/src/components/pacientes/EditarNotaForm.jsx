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
        `/notas/${nota._id}`,
        {
          titulo: form.titulo.trim(),
          tipo: form.tipo,
          fecha: form.fecha,
          contenido: form.contenido.trim()
        }
      )

      const notaActualizada =
        response.data?.data || response.data

      if (onUpdated) {
        onUpdated(notaActualizada)
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
    <section>
      <h3>Editar nota</h3>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="editar-nota-titulo">
            Título
          </label>

          <input
            id="editar-nota-titulo"
            name="titulo"
            type="text"
            value={form.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-nota-tipo">
            Tipo
          </label>

          <select
            id="editar-nota-tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
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

        <div>
          <label htmlFor="editar-nota-fecha">
            Fecha
          </label>

          <input
            id="editar-nota-fecha"
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-nota-contenido">
            Contenido
          </label>

          <textarea
            id="editar-nota-contenido"
            name="contenido"
            value={form.contenido}
            onChange={handleChange}
            rows="6"
            required
          />
        </div>

        {error && (
          <p>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Guardando...'
            : 'Guardar cambios'}
        </button>

        {' '}

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>

      </form>
    </section>
  )
}