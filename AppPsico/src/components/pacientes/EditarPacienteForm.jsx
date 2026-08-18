import { useState } from 'react'

import api from '../../api/api.js'

export default function EditarPacienteForm({
  paciente,
  onUpdated,
  onCancel
}) {
  const [form, setForm] = useState({
    nombre: paciente.nombre || '',
    apellido: paciente.apellido || '',
    fechaNacimiento: paciente.fechaNacimiento
      ? paciente.fechaNacimiento.substring(0, 10)
      : '',
    documento: paciente.documento || ''
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
        `/pacientes/${paciente._id}`,
        {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          fechaNacimiento: form.fechaNacimiento,
          documento: form.documento.trim()
        }
      )

      const pacienteActualizado =
        response.data?.data || response.data

      if (onUpdated) {
        onUpdated(pacienteActualizado)
      }
    } catch (error) {
      console.error(
        'Error al editar paciente:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo editar el paciente'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Editar paciente</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="editar-paciente-nombre">
            Nombre
          </label>

          <input
            id="editar-paciente-nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-paciente-apellido">
            Apellido
          </label>

          <input
            id="editar-paciente-apellido"
            name="apellido"
            type="text"
            value={form.apellido}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-paciente-fecha">
            Fecha de nacimiento
          </label>

          <input
            id="editar-paciente-fecha"
            name="fechaNacimiento"
            type="date"
            value={form.fechaNacimiento}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-paciente-documento">
            Documento
          </label>

          <input
            id="editar-paciente-documento"
            name="documento"
            type="text"
            value={form.documento}
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