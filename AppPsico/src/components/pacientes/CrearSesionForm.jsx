import { useState } from 'react'

import api from '../../api/api.js'

const AREAS_FRECUENTES = [
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

export default function CrearSesionForm({
  pacienteId,
  onCreated,
  onCancel
}) {
  const hoy = new Date()
    .toISOString()
    .split('T')[0]

  const [form, setForm] = useState({
    fecha: hoy,
    areas: [],
    actividades: '',
    observacion: '',
    proximaSesion: ''
  })

  const [
    areaPersonalizada,
    setAreaPersonalizada
  ] = useState('')

  const [
    loading,
    setLoading
  ] = useState(false)

  const [
    error,
    setError
  ] = useState(null)

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
    setForm((prev) => {
      const seleccionada =
        prev.areas.includes(area)

      return {
        ...prev,
        areas: seleccionada
          ? prev.areas.filter(
              (item) =>
                item !== area
            )
          : [
              ...prev.areas,
              area
            ]
      }
    })

    if (error) {
      setError(null)
    }
  }

  const agregarAreaPersonalizada = () => {
    const area =
      areaPersonalizada.trim()

    if (!area) {
      return
    }

    setForm((prev) => {
      if (
        prev.areas.some(
          (item) =>
            item.toLowerCase() ===
            area.toLowerCase()
        )
      ) {
        return prev
      }

      return {
        ...prev,
        areas: [
          ...prev.areas,
          area
        ]
      }
    })

    setAreaPersonalizada('')
  }

  const convertirALista = (texto) => {
    return texto
      .split(',')
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean)
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const response =
        await api.post(
          '/sesiones',
          {
            paciente:
              pacienteId,

            fecha:
              form.fecha,

            areas:
              form.areas,

            actividades:
              convertirALista(
                form.actividades
              ),

            observacion:
              form.observacion.trim(),

            proximaSesion:
              form.proximaSesion.trim()
          }
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
        'Error al crear sesión:',
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

  return (
    <section className="session-form-section">

      <div className="session-form-header">

        <div>
          <p className="session-form-eyebrow">
            Registro clínico
          </p>

          <h3>
            Registrar sesión
          </h3>

          <p>
            Cargá rápidamente lo trabajado
            y las observaciones de la sesión.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="session-form"
      >

        {/* FECHA */}

        <div className="form-group">
          <label htmlFor="sesion-fecha">
            Fecha
          </label>

          <input
            id="sesion-fecha"
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* AREAS */}

        <div className="session-form-block">

          <div className="session-form-block-header">

            <div>
              <label>
                Áreas trabajadas
              </label>

              <p>
                Tocá las áreas que se
                trabajaron en la sesión.
              </p>
            </div>

            <span className="session-form-count">
              {form.areas.length}{' '}
              seleccionadas
            </span>

          </div>

          <div className="session-area-grid">

            {AREAS_FRECUENTES.map(
              (area) => {
                const seleccionada =
                  form.areas.includes(
                    area
                  )

                return (
                  <button
                    key={area}
                    type="button"
                    className={
                      seleccionada
                        ? 'session-area-chip selected'
                        : 'session-area-chip'
                    }
                    onClick={() =>
                      toggleArea(
                        area
                      )
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

          <div className="session-custom-area">

            <input
              type="text"
              value={
                areaPersonalizada
              }
              onChange={(event) =>
                setAreaPersonalizada(
                  event.target.value
                )
              }
              className="form-control"
              placeholder="Otra área..."
              onKeyDown={(event) => {
                if (
                  event.key ===
                  'Enter'
                ) {
                  event.preventDefault()

                  agregarAreaPersonalizada()
                }
              }}
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={
                agregarAreaPersonalizada
              }
            >
              Agregar
            </button>

          </div>

          {form.areas.length > 0 && (
            <div className="session-selected-areas">

              {form.areas.map(
                (area) => (
                  <span
                    key={area}
                  >
                    {area}

                    <button
                      type="button"
                      onClick={() =>
                        toggleArea(
                          area
                        )
                      }
                      aria-label={`Quitar ${area}`}
                    >
                      ×
                    </button>
                  </span>
                )
              )}

            </div>
          )}

        </div>

        {/* ACTIVIDADES */}

        <div className="form-group">
          <label htmlFor="sesion-actividades">
            Actividades realizadas
          </label>

          <input
            id="sesion-actividades"
            name="actividades"
            type="text"
            value={
              form.actividades
            }
            onChange={handleChange}
            className="form-control"
            placeholder="Ej: circuito motor, juego con pelota"
          />

          <small>
            Si cargás varias, separalas
            con comas.
          </small>
        </div>

        {/* OBSERVACION */}

        <div className="form-group">
          <label htmlFor="sesion-observacion">
            Observación de la sesión
          </label>

          <textarea
            id="sesion-observacion"
            name="observacion"
            value={
              form.observacion
            }
            onChange={handleChange}
            className="form-control session-form-textarea"
            rows="5"
            placeholder="¿Cómo fue la sesión? Participación, dificultades, avances..."
          />
        </div>

        {/* PROXIMA */}

        <div className="form-group session-next-field">
          <label htmlFor="sesion-proxima">
            Para la próxima sesión
          </label>

          <textarea
            id="sesion-proxima"
            name="proximaSesion"
            value={
              form.proximaSesion
            }
            onChange={handleChange}
            className="form-control session-form-textarea small"
            rows="3"
            placeholder="Ej: continuar trabajando equilibrio"
          />
        </div>

        {error && (
          <div className="session-form-error">
            {error}
          </div>
        )}

        <div className="session-form-actions">

          <button
            type="submit"
            className="btn btn-primary session-save-button"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : 'Guardar sesión'}
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