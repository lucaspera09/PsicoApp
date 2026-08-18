import { useState } from 'react'

import api from '../../api/api.js'

export default function EditarPlanTrabajoForm({
  plan,
  onUpdated,
  onCancel
}) {
  const [form, setForm] = useState({
    titulo: plan.titulo || '',
    descripcion: plan.descripcion || '',
    fechaInicio: plan.fechaInicio
      ? plan.fechaInicio.substring(0, 10)
      : '',
    fechaFin: plan.fechaFin
      ? plan.fechaFin.substring(0, 10)
      : ''
  })

  const [objetivos, setObjetivos] = useState(
    plan.objetivos?.length > 0
      ? plan.objetivos.map((objetivo) => ({
          _id: objetivo._id,
          descripcion: objetivo.descripcion || '',
          estado: objetivo.estado || 'pendiente',
          observacion: objetivo.observacion || ''
        }))
      : [
          {
            descripcion: '',
            estado: 'pendiente',
            observacion: ''
          }
        ]
  )

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
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
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

      if (form.fechaFin) {
        datos.fechaFin = form.fechaFin
      }

      const response = await api.put(
        `/planes-trabajo/${plan._id}`,
        datos
      )

      const planActualizado =
        response.data?.data || response.data

      if (onUpdated) {
        onUpdated(planActualizado)
      }
    } catch (error) {
      console.error(
        'Error al editar plan de trabajo:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo editar el plan de trabajo'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h3>Editar plan de trabajo</h3>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="editar-plan-titulo">
            Título
          </label>

          <input
            id="editar-plan-titulo"
            name="titulo"
            type="text"
            value={form.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-plan-descripcion">
            Descripción
          </label>

          <textarea
            id="editar-plan-descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div>
          <label htmlFor="editar-plan-inicio">
            Fecha de inicio
          </label>

          <input
            id="editar-plan-inicio"
            name="fechaInicio"
            type="date"
            value={form.fechaInicio}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="editar-plan-fin">
            Fecha de finalización
          </label>

          <input
            id="editar-plan-fin"
            name="fechaFin"
            type="date"
            value={form.fechaFin}
            onChange={handleChange}
          />
        </div>

        <hr />

        <h4>Objetivos</h4>

        {objetivos.map((objetivo, index) => (
          <div key={objetivo._id || index}>

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
        </div>

      </form>
    </section>
  )
}