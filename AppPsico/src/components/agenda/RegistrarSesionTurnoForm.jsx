import { useState } from 'react'

import api from '../../api/api.js'

const areasDisponibles = [
  'Coordinación',
  'Equilibrio',
  'Motricidad fina',
  'Motricidad gruesa',
  'Atención',
  'Juego',
  'Lenguaje',
  'Esquema corporal',
  'Organización espacial',
  'Organización temporal'
]

export default function RegistrarSesionTurnoForm({
  turno,
  onCreated,
  onCancel
}) {
  const [
    areasSeleccionadas,
    setAreasSeleccionadas
  ] = useState([])

  const [form, setForm] = useState({
    actividad: '',
    observacion: '',
    proximaSesion: ''
  })

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

  const toggleArea = (area) => {
    setAreasSeleccionadas(
      (prev) => {
        if (
          prev.includes(area)
        ) {
          return prev.filter(
            (item) =>
              item !== area
          )
        }

        return [
          ...prev,
          area
        ]
      }
    )

    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const datos = {
        paciente:
          turno.paciente._id,

        turno:
          turno._id,

        fecha:
          turno.fechaInicio,

        areas:
          areasSeleccionadas,

        actividades:
          form.actividad.trim()
            ? [
                form.actividad.trim()
              ]
            : [],

        observacion:
          form.observacion.trim(),

        proximaSesion:
          form.proximaSesion.trim()
      }

      const response =
        await api.post(
          '/sesiones',
          datos
        )

      const nuevaSesion =
        response.data?.data ||
        response.data

      if (onCreated) {
        onCreated(
          nuevaSesion
        )
      }
    } catch (error) {
      console.error(
        'Error al registrar sesión:',
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

  const mostrarHora = (
    fecha
  ) => {
    return new Date(
      fecha
    ).toLocaleTimeString(
      'es-UY',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  }

  const paciente =
    turno.paciente

  return (
    <section className="turn-session-form">

      {/* RESUMEN DEL TURNO */}

      <div className="turn-session-patient-card">

        <div className="turn-session-avatar">
          {paciente?.nombre
            ?.charAt(0)
            ?.toUpperCase()}

          {paciente?.apellido
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div className="turn-session-patient-info">

          <span>
            Registrando sesión
          </span>

          <h3>
            {paciente?.nombre}{' '}
            {paciente?.apellido}
          </h3>

          <p>
            {mostrarHora(
              turno.fechaInicio
            )}

            {' – '}

            {mostrarHora(
              turno.fechaFin
            )}
          </p>

        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="turn-session-form-body"
      >

        {/* ÁREAS */}

        <div className="turn-session-block">

          <div className="turn-session-block-header">

            <div>
              <label>
                Áreas trabajadas
              </label>

              <p>
                Seleccioná una o varias
                áreas de la sesión.
              </p>
            </div>

            <span className="turn-session-count">
              {areasSeleccionadas.length}{' '}
              seleccionadas
            </span>

          </div>

          <div className="turn-session-area-grid">

            {areasDisponibles.map(
              (area) => {
                const seleccionada =
                  areasSeleccionadas.includes(
                    area
                  )

                return (
                  <button
                    key={area}
                    type="button"
                    className={
                      seleccionada
                        ? 'turn-session-area selected'
                        : 'turn-session-area'
                    }
                    onClick={() =>
                      toggleArea(area)
                    }
                  >
                    {seleccionada && (
                      <span>
                        ✓
                      </span>
                    )}

                    {area}
                  </button>
                )
              }
            )}

          </div>

        </div>

        {/* ACTIVIDAD */}

        <div className="form-group">

          <label htmlFor="sesion-actividad">
            Actividad principal
          </label>

          <input
            id="sesion-actividad"
            name="actividad"
            type="text"
            value={form.actividad}
            onChange={handleChange}
            className="form-control"
            placeholder="Ej: circuito motor con obstáculos"
          />

        </div>

        {/* OBSERVACIÓN */}

        <div className="form-group">

          <label htmlFor="sesion-observacion">
            Observación rápida
          </label>

          <textarea
            id="sesion-observacion"
            name="observacion"
            value={form.observacion}
            onChange={handleChange}
            className="form-control turn-session-textarea"
            rows="4"
            placeholder="Ej: buena participación, presentó dificultad en equilibrio..."
          />

        </div>

        {/* PRÓXIMA */}

        <div className="form-group turn-session-next">

          <label htmlFor="sesion-proxima">
            Para la próxima sesión
          </label>

          <textarea
            id="sesion-proxima"
            name="proximaSesion"
            value={form.proximaSesion}
            onChange={handleChange}
            className="form-control turn-session-textarea small"
            rows="3"
            placeholder="Opcional"
          />

        </div>

        {error && (
          <div className="turn-session-error">
            {error}
          </div>
        )}

        {/* BOTONES */}

        <div className="turn-session-actions">

          <button
            type="submit"
            className="btn btn-primary turn-session-save"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : '✓ Guardar sesión'}
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