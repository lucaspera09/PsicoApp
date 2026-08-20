import { useState } from 'react'

import api from '../../api/api.js'

export default function CrearResponsableForm({
  pacienteId,
  onCreated,
  onCancel
}) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    relacion: '',
    telefono: '',
    email: '',
    principal: false,
    contactoEmergencia: false,
    observaciones: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked
    } = event.target

    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : value
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
        '/responsables',
        {
          paciente: pacienteId,
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          relacion: form.relacion.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim(),
          principal: form.principal,
          contactoEmergencia:
            form.contactoEmergencia,
          observaciones:
            form.observaciones.trim()
        }
      )

      const nuevoResponsable =
        response.data?.data ||
        response.data

      if (onCreated) {
        onCreated(
          nuevoResponsable
        )
      }
    } catch (error) {
      console.error(
        'Error al crear responsable:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo crear el responsable'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="responsible-form-section">

      <div className="responsible-form-header">

        <div>
          <p className="responsible-form-eyebrow">
            Contactos del paciente
          </p>

          <h3>
            Nuevo responsable
          </h3>

          <p>
            Agregá los datos de contacto
            y el vínculo con el paciente.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="responsible-form"
      >

        <div className="responsible-form-grid">

          <div className="form-group">
            <label htmlFor="responsable-nombre">
              Nombre
            </label>

            <input
              id="responsable-nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: María"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="responsable-apellido">
              Apellido
            </label>

            <input
              id="responsable-apellido"
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
            <label htmlFor="responsable-relacion">
              Relación con el paciente
            </label>

            <select
              id="responsable-relacion"
              name="relacion"
              value={form.relacion}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">
                Seleccionar
              </option>

              <option value="Madre">
                Madre
              </option>

              <option value="Padre">
                Padre
              </option>

              <option value="Tutor">
                Tutor
              </option>

              <option value="Abuela">
                Abuela
              </option>

              <option value="Abuelo">
                Abuelo
              </option>

              <option value="Otro">
                Otro
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="responsable-telefono">
              Teléfono
            </label>

            <input
              id="responsable-telefono"
              name="telefono"
              type="text"
              value={form.telefono}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: 099 123 456"
            />
          </div>

          <div className="form-group responsible-form-email">
            <label htmlFor="responsable-email">
              Email
            </label>

            <input
              id="responsable-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: maria@email.com"
            />
          </div>

        </div>

        <div className="responsible-options">

          <label
            className={
              form.principal
                ? 'responsible-option selected'
                : 'responsible-option'
            }
          >
            <input
              name="principal"
              type="checkbox"
              checked={form.principal}
              onChange={handleChange}
            />

            <span className="responsible-option-check">
              {form.principal ? '✓' : ''}
            </span>

            <span>
              <strong>
                Responsable principal
              </strong>

              <small>
                Contacto principal del paciente.
              </small>
            </span>
          </label>

          <label
            className={
              form.contactoEmergencia
                ? 'responsible-option selected'
                : 'responsible-option'
            }
          >
            <input
              name="contactoEmergencia"
              type="checkbox"
              checked={
                form.contactoEmergencia
              }
              onChange={handleChange}
            />

            <span className="responsible-option-check">
              {form.contactoEmergencia
                ? '✓'
                : ''}
            </span>

            <span>
              <strong>
                Contacto de emergencia
              </strong>

              <small>
                Persona a contactar ante una urgencia.
              </small>
            </span>
          </label>

        </div>

        <div className="form-group">

          <label htmlFor="responsable-observaciones">
            Observaciones
          </label>

          <textarea
            id="responsable-observaciones"
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            className="form-control responsible-form-textarea"
            rows="4"
            placeholder="Información adicional sobre el responsable..."
          />

        </div>

        {error && (
          <div className="responsible-form-error">
            {error}
          </div>
        )}

        <div className="responsible-form-actions">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : 'Guardar responsable'}
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