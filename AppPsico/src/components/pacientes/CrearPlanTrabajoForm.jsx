import { useState } from 'react'

import api from '../../api/api.js'

export default function CrearPlanTrabajoForm({
  pacienteId,
  onCreated,
  onCancel
}) {
  const hoy = new Date()
    .toISOString()
    .split('T')[0]

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
    const {
      name,
      value
    } = event.target

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

    if (error) {
      setError(null)
    }
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
      prev.filter(
        (_, i) =>
          i !== index
      )
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const objetivosValidos =
      objetivos.filter(
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

        titulo:
          form.titulo.trim(),

        fechaInicio:
          form.fechaInicio,

        objetivos:
          objetivosValidos.map(
            (objetivo) => ({
              descripcion:
                objetivo.descripcion.trim(),

              estado:
                objetivo.estado,

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
        datos.fechaFin =
          form.fechaFin
      }

      const response =
        await api.post(
          '/planes-trabajo',
          datos
        )

      const nuevoPlan =
        response.data?.data ||
        response.data

      if (onCreated) {
        onCreated(
          nuevoPlan
        )
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
    <section className="plan-form-section">

      <div className="plan-form-header">

        <div>
          <p className="plan-form-eyebrow">
            Planificación terapéutica
          </p>

          <h3>
            Nuevo plan de trabajo
          </h3>

          <p>
            Definí el período del plan
            y los objetivos a trabajar.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="plan-form"
      >

        {/* DATOS GENERALES */}

        <div className="plan-form-block">

          <div className="plan-form-block-title">
            <span className="plan-form-step">
              1
            </span>

            <div>
              <h4>
                Información general
              </h4>

              <p>
                Datos principales del plan.
              </p>
            </div>
          </div>

          <div className="plan-form-grid">

            <div className="form-group plan-form-full">

              <label htmlFor="plan-titulo">
                Título
              </label>

              <input
                id="plan-titulo"
                name="titulo"
                type="text"
                value={form.titulo}
                onChange={handleChange}
                className="form-control"
                placeholder="Ej: Plan de trabajo 2026"
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="plan-fecha-inicio">
                Fecha de inicio
              </label>

              <input
                id="plan-fecha-inicio"
                name="fechaInicio"
                type="date"
                value={form.fechaInicio}
                onChange={handleChange}
                className="form-control"
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="plan-fecha-fin">
                Fecha de finalización
              </label>

              <input
                id="plan-fecha-fin"
                name="fechaFin"
                type="date"
                value={form.fechaFin}
                onChange={handleChange}
                className="form-control"
              />

            </div>

            <div className="form-group plan-form-full">

              <label htmlFor="plan-descripcion">
                Descripción general
              </label>

              <textarea
                id="plan-descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                className="form-control plan-form-textarea"
                rows="4"
                placeholder="Descripción general del plan..."
              />

            </div>

          </div>

        </div>

        {/* OBJETIVOS */}

        <div className="plan-form-block">

          <div className="plan-form-block-title plan-form-objectives-header">

            <div className="plan-form-title-left">

              <span className="plan-form-step">
                2
              </span>

              <div>
                <h4>
                  Objetivos
                </h4>

                <p>
                  Agregá uno o varios objetivos.
                </p>
              </div>

            </div>

            <span className="plan-objective-count">
              {objetivos.length}{' '}
              {objetivos.length === 1
                ? 'objetivo'
                : 'objetivos'}
            </span>

          </div>

          <div className="plan-objectives-list">

            {objetivos.map(
              (objetivo, index) => (
                <div
                  key={index}
                  className="plan-objective-card"
                >

                  <div className="plan-objective-card-header">

                    <div className="plan-objective-number">
                      {index + 1}
                    </div>

                    <div className="plan-objective-card-title">
                      <strong>
                        Objetivo {index + 1}
                      </strong>

                      <span>
                        Definí qué se busca trabajar.
                      </span>
                    </div>

                    {objetivos.length > 1 && (
                      <button
                        type="button"
                        className="plan-objective-delete"
                        onClick={() =>
                          eliminarObjetivo(
                            index
                          )
                        }
                        aria-label={`Eliminar objetivo ${index + 1}`}
                      >
                        ×
                      </button>
                    )}

                  </div>

                  <div className="plan-objective-grid">

                    <div className="form-group plan-objective-description">

                      <label>
                        Descripción
                      </label>

                      <input
                        type="text"
                        value={
                          objetivo.descripcion
                        }
                        onChange={(event) =>
                          handleObjetivoChange(
                            index,
                            'descripcion',
                            event.target.value
                          )
                        }
                        className="form-control"
                        placeholder="Ej: Mejorar coordinación motriz"
                        required
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        Estado
                      </label>

                      <select
                        value={
                          objetivo.estado
                        }
                        onChange={(event) =>
                          handleObjetivoChange(
                            index,
                            'estado',
                            event.target.value
                          )
                        }
                        className="form-control"
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

                    <div className="form-group plan-objective-observation">

                      <label>
                        Observación
                      </label>

                      <textarea
                        value={
                          objetivo.observacion
                        }
                        onChange={(event) =>
                          handleObjetivoChange(
                            index,
                            'observacion',
                            event.target.value
                          )
                        }
                        className="form-control"
                        rows="3"
                        placeholder="Observaciones sobre este objetivo..."
                      />

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

          <button
            type="button"
            className="plan-add-objective"
            onClick={agregarObjetivo}
          >
            <span>
              +
            </span>

            Agregar otro objetivo
          </button>

        </div>

        {error && (
          <div className="plan-form-error">
            {error}
          </div>
        )}

        <div className="plan-form-actions">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : 'Crear plan de trabajo'}
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