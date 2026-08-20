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

  const [
    mostrarPassword,
    setMostrarPassword
  ] = useState(false)

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

      const nuevoProfesional =
        response.data?.data ||
        response.data

      if (onCreated) {
        onCreated(nuevoProfesional)
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
    <section className="professional-form-section">

      <div className="professional-form-header">

        <div>
          <p className="professional-form-eyebrow">
            Nueva cuenta
          </p>

          <h2>
            Nuevo profesional
          </h2>

          <p>
            Completá los datos para crear
            el acceso del profesional.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="professional-form"
      >

        <div className="professional-form-grid">

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
              placeholder="Ej: Paula"
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
              placeholder="Ej: Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profesion">
              Profesión
            </label>

            <input
              id="profesion"
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
            <label htmlFor="telefono">
              Teléfono
            </label>

            <input
              id="telefono"
              name="telefono"
              type="text"
              value={form.telefono}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: 099 123 456"
            />
          </div>

          <div className="form-group professional-form-full">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              placeholder="profesional@email.com"
              required
            />
          </div>

          <div className="form-group professional-form-full">
            <label htmlFor="password">
              Contraseña inicial
            </label>

            <div className="professional-password-wrapper">

              <input
                id="password"
                name="password"
                type={
                  mostrarPassword
                    ? 'text'
                    : 'password'
                }
                value={form.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />

              <button
                type="button"
                className="professional-password-toggle"
                onClick={() =>
                  setMostrarPassword(
                    (prev) => !prev
                  )
                }
              >
                {mostrarPassword
                  ? 'Ocultar'
                  : 'Ver'}
              </button>

            </div>

            <small>
              El profesional podrá iniciar sesión
              con este email y contraseña.
            </small>
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
              ? 'Creando...'
              : 'Crear profesional'}
          </button>

          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
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