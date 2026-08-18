import { useState } from 'react'

import api from '../../api/api.js'

export default function CrearPacienteForm({
  onCreated,
  onCancel
}) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    documento: ''
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
        '/pacientes',
        {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          fechaNacimiento: form.fechaNacimiento,
          documento: form.documento.trim()
        }
      )

      const nuevoPaciente =
        response.data?.data || response.data

      if (onCreated) {
        onCreated(nuevoPaciente)
      }

      setForm({
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        documento: ''
      })
    } catch (error) {
      console.error(
        'Error al crear paciente:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo crear el paciente'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Nuevo paciente</h2>

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
          <label htmlFor="fechaNacimiento">
            Fecha de nacimiento
          </label>

          <input
            id="fechaNacimiento"
            name="fechaNacimiento"
            type="date"
            value={form.fechaNacimiento}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="documento">
            Documento
          </label>

          <input
            id="documento"
            name="documento"
            type="text"
            value={form.documento}
            onChange={handleChange}
            placeholder="Ej: 5.123.456-7"
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
              : 'Crear paciente'}
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