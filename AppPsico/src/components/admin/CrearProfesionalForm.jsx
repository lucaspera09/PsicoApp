import { useState } from 'react'

import api from '../../api/api.js'

export default function CrearProfesionalForm({
  onCreated,
  onCancel
}) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    profesion: '',
    telefono: ''
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

      const response = await api.post(
        '/profesionales',
        form
      )

      if (onCreated) {
        onCreated(response.data)
      }

      setForm({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        profesion: '',
        telefono: ''
      })
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'No se pudo crear el profesional'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Nuevo profesional</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="nombre">
            Nombre
          </label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="apellido">
            Apellido
          </label>

          <input
            id="apellido"
            name="apellido"
            type="text"
            value={form.apellido}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="password">
            Contraseña inicial
          </label>

          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </div>

        <div>
          <label htmlFor="profesion">
            Profesión
          </label>

          <input
            id="profesion"
            name="profesion"
            type="text"
            value={form.profesion}
            onChange={handleChange}
            placeholder="Ej: Psicomotricista"
            required
          />
        </div>

        <div>
          <label htmlFor="telefono">
            Teléfono
          </label>

          <input
            id="telefono"
            name="telefono"
            type="text"
            value={form.telefono}
            onChange={handleChange}
            placeholder="099123456"
          />
        </div>

        {error && (
          <p>
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creando...'
              : 'Crear profesional'
            }
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>

      </form>
    </section>
  )
}