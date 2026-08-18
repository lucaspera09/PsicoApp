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
      [name]: type === 'checkbox'
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
    contactoEmergencia: form.contactoEmergencia,
    observaciones: form.observaciones.trim()
        }
      )

      const nuevoResponsable =
        response.data?.data || response.data

      if (onCreated) {
        onCreated(nuevoResponsable)
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
    <section>
      <h3>Nuevo responsable</h3>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="responsable-nombre">
            Nombre
          </label>

          <input
            id="responsable-nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="responsable-apellido">
            Apellido
          </label>

          <input
            id="responsable-apellido"
            name="apellido"
            type="text"
            value={form.apellido}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="responsable-relacion">
            Relación con el paciente
          </label>

          <select
            id="responsable-relacion"
            name="relacion"
            value={form.relacion}
            onChange={handleChange}
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

        <div>
          <label htmlFor="responsable-telefono">
            Teléfono
          </label>

          <input
            id="responsable-telefono"
            name="telefono"
            type="text"
            value={form.telefono}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="responsable-email">
            Email
          </label>

          <input
            id="responsable-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>
            <input
              name="principal"
              type="checkbox"
              checked={form.principal}
              onChange={handleChange}
            />

            Responsable principal
          </label>
        </div>

        <div>
          <label>
            <input
              name="contactoEmergencia"
              type="checkbox"
              checked={form.contactoEmergencia}
              onChange={handleChange}
            />

            Contacto de emergencia
          </label>
        </div>

        <div>
          <label htmlFor="responsable-observaciones">
            Observaciones
          </label>

          <textarea
            id="responsable-observaciones"
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows="4"
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
              ? 'Creando...'
              : 'Guardar responsable'}
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