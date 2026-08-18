import { useState } from 'react'

import api from '../../api/api.js'

export default function EditarSesionForm({
  sesion,
  onUpdated,
  onCancel
}) {
  const [form, setForm] = useState({
    fecha: sesion.fecha
      ? sesion.fecha.substring(0, 10)
      : '',
    areas: sesion.areas?.join(', ') || '',
    actividades: sesion.actividades?.join(', ') || '',
    observacion: sesion.observacion || '',
    proximaSesion: sesion.proximaSesion || ''
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

  const convertirALista = (texto) => {
    return texto
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const response = await api.put(
        `/sesiones/${sesion._id}`,
        {
          fecha: form.fecha,
          areas: convertirALista(form.areas),
          actividades: convertirALista(
            form.actividades
          ),
          observacion: form.observacion.trim(),
          proximaSesion:
            form.proximaSesion.trim()
        }
      )

      const sesionActualizada =
        response.data?.data || response.data

      if (onUpdated) {
        onUpdated(sesionActualizada)
      }
    } catch (error) {
      console.error(
        'Error al editar sesión:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo editar la sesión'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h3>Editar sesión</h3>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="editar-sesion-fecha">
            Fecha
          </label>

          <input
            id="editar-sesion-fecha"
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-sesion-areas">
            Áreas trabajadas
          </label>

          <input
            id="editar-sesion-areas"
            name="areas"
            type="text"
            value={form.areas}
            onChange={handleChange}
            placeholder="coordinación, equilibrio, motricidad fina"
          />

          <small>
            Separalas con comas.
          </small>
        </div>

        <div>
          <label htmlFor="editar-sesion-actividades">
            Actividades
          </label>

          <input
            id="editar-sesion-actividades"
            name="actividades"
            type="text"
            value={form.actividades}
            onChange={handleChange}
            placeholder="circuito motor, juego con pelota"
          />

          <small>
            Separalas con comas.
          </small>
        </div>

        <div>
          <label htmlFor="editar-sesion-observacion">
            Observación
          </label>

          <textarea
            id="editar-sesion-observacion"
            name="observacion"
            value={form.observacion}
            onChange={handleChange}
            rows="5"
          />
        </div>

        <div>
          <label htmlFor="editar-sesion-proxima">
            Para la próxima sesión
          </label>

          <textarea
            id="editar-sesion-proxima"
            name="proximaSesion"
            value={form.proximaSesion}
            onChange={handleChange}
            rows="3"
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