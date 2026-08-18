import { useState } from 'react'

import api from '../../api/api.js'

export default function CrearPlanTrabajoForm({
  pacienteId,
  onCreated,
  onCancel
}) {
  const hoy = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fechaInicio: hoy,
    fechaFin: ''
  })

  const [objetivos, setObjetivos] = useState([
    {
      descripcion: '',
      estado: 'pendiente',
      observacion: ''
    }
  ])

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

  const handleObjetivoChange = (
    index,
    campo,
    valor
  ) => {
    setObjetivos((prev) =>
      prev.map((objetivo, i) =>
        i === index
          ? {
              ...objetivo,
              [campo]: valor
            }
          : objetivo
      )
    )
  }

  const agregarObjetivo = () => {
    setObjetivos((prev) => [
      ...prev,
      {
        descripcion: '',
        estado: 'pendiente',
        observacion: ''
      }
    ])
  }

  const eliminarObjetivo = (index) => {
    setObjetivos((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const objetivosValidos = objetivos.filter(
      (objetivo) =>
        objetivo.descripcion.trim() !== ''
    )

    if (objetivosValidos.length === 0) {
      setError(
        'El plan debe tener al menos un objetivo'
      )
      return
    }

    try {
      setLoading(true)
      setError(null)

      const datos = {
        paciente: pacienteId,
        titulo: form.titulo.trim(),
        fechaInicio: form.fechaInicio,
        objetivos: objetivosValidos.map(
          (objetivo) => ({
            descripcion:
              objetivo.descripcion.trim(),
            estado: objetivo.estado,
            observacion:
              objetivo.observacion.trim()
          })
        )
      }

      if (form.descripcion.trim()) {
        datos.descripcion =
          form.descripcion.trim()
      }

      if (form.fechaFin) {
        datos.fechaFin = form.fechaFin
      }

      const response = await api.post(
        '/planes-trabajo',
        datos
      )

      const nuevoPlan =
        response.data?.data || response.data

      if (onCreated) {
        onCreated(nuevoPlan)
      }
    } catch (error) {
      console.error(
        'Error al crear plan de trabajo:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo crear el plan de trabajo'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h3>Nuevo plan de trabajo</h3>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="plan-titulo">
            Título
          </label>

          <input
            id="plan-titulo"
            name="titulo"
            type="text"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Ej: Plan de trabajo 2026"
            required
          />
        </div>

        <div>
          <label htmlFor="plan-descripcion">
            Descripción
          </label>

          <textarea
            id="plan-descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows="4"
            placeholder="Descripción general del plan..."
          />
        </div>

        <div>
          <label htmlFor="plan-fecha-inicio">
            Fecha de inicio
          </label>

          <input
            id="plan-fecha-inicio"
            name="fechaInicio"
            type="date"
            value={form.fechaInicio}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="plan-fecha-fin">
            Fecha de finalización
          </label>

          <input
            id="plan-fecha-fin"
            name="fechaFin"
            type="date"
            value={form.fechaFin}
            onChange={handleChange}
          />
        </div>

        <hr />

        <h4>Objetivos</h4>

        {objetivos.map((objetivo, index) => (
          <div key={index}>

            <h5>
              Objetivo {index + 1}
            </h5>

            <div>
              <label>
                Descripción
              </label>

              <input
                type="text"
                value={objetivo.descripcion}
                onChange={(event) =>
                  handleObjetivoChange(
                    index,
                    'descripcion',
                    event.target.value
                  )
                }
                placeholder="Ej: Mejorar coordinación motriz"
                required
              />
            </div>

            <div>
              <label>
                Estado
              </label>

              <select
                value={objetivo.estado}
                onChange={(event) =>
                  handleObjetivoChange(
                    index,
                    'estado',
                    event.target.value
                  )
                }
              >
                <option value="pendiente">
                  Pendiente
                </option>

                <option value="en_progreso">
                  En progreso
                </option>

                <option value="logrado">
                  Logrado
                </option>
              </select>
            </div>

            <div>
              <label>
                Observación
              </label>

              <textarea
                value={objetivo.observacion}
                onChange={(event) =>
                  handleObjetivoChange(
                    index,
                    'observacion',
                    event.target.value
                  )
                }
                rows="3"
              />
            </div>

            {objetivos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  eliminarObjetivo(index)
                }
              >
                Eliminar objetivo
              </button>
            )}

            <hr />

          </div>
        ))}

        <button
          type="button"
          onClick={agregarObjetivo}
        >
          + Agregar objetivo
        </button>

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
              : 'Crear plan de trabajo'}
          </button>

          {' '}

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