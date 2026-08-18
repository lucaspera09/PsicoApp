import { useState } from 'react'

import api from '../../api/api.js'

export default function CrearSesionForm({
  pacienteId,
  onCreated,
  onCancel
}) {
  const hoy = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    fecha: hoy,
    areas: '',
    actividades: '',
    observacion: '',
    proximaSesion: ''
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

      const response = await api.post(
        '/sesiones',
        {
          paciente: pacienteId,
          fecha: form.fecha,
          areas: convertirALista(form.areas),
          actividades: convertirALista(form.actividades),
          observacion: form.observacion.trim(),
          proximaSesion: form.proximaSesion.trim()
        }
      )

      const nuevaSesion =
        response.data?.data || response.data

      if (onCreated) {
        onCreated(nuevaSesion)
      }

    } catch (error) {
      console.error(
        'Error al crear sesión:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo registrar la sesión'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h3>Nueva sesión</h3>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="sesion-fecha">
            Fecha
          </label>

          <input
            id="sesion-fecha"
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="sesion-areas">
            Áreas trabajadas
          </label>

          <input
            id="sesion-areas"
            name="areas"
            type="text"
            value={form.areas}
            onChange={handleChange}
            placeholder="Ej: coordinación, motricidad fina, equilibrio"
          />

          <small>
            Separalas con comas.
          </small>
        </div>

        <div>
          <label htmlFor="sesion-actividades">
            Actividades
          </label>

          <input
            id="sesion-actividades"
            name="actividades"
            type="text"
            value={form.actividades}
            onChange={handleChange}
            placeholder="Ej: circuito motor, dibujo, juego con pelota"
          />

          <small>
            Separalas con comas.
          </small>
        </div>

        <div>
          <label htmlFor="sesion-observacion">
            Observación
          </label>

          <textarea
            id="sesion-observacion"
            name="observacion"
            value={form.observacion}
            onChange={handleChange}
            rows="5"
            placeholder="¿Cómo fue la sesión?"
          />
        </div>

        <div>
          <label htmlFor="sesion-proxima">
            Para la próxima sesión
          </label>

          <textarea
            id="sesion-proxima"
            name="proximaSesion"
            value={form.proximaSesion}
            onChange={handleChange}
            rows="3"
            placeholder="Ej: continuar trabajando equilibrio"
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
            : 'Guardar sesión'}
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