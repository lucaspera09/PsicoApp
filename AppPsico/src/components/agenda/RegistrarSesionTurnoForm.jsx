import { useMemo, useState } from 'react'

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
  const pacientesTurno = useMemo(() => {
    const participantes =
      Array.isArray(turno?.participantes)
        ? turno.participantes
        : []

    const pacientes =
      participantes
        .map((participante) => {
          const paciente =
            participante?.paciente

          if (
            paciente &&
            typeof paciente === 'object'
          ) {
            return {
              ...paciente,
              estado:
                participante.estado ||
                'programado'
            }
          }

          return null
        })
        .filter(Boolean)

    if (
      pacientes.length === 0 &&
      turno?.paciente
    ) {
      return [
        {
          ...turno.paciente,
          estado: 'programado'
        }
      ]
    }

    return pacientes
  }, [turno])

  const pacienteInicialId =
    turno?.paciente?._id ||
    pacientesTurno[0]?._id ||
    ''

  const [
    pacientesSeleccionados,
    setPacientesSeleccionados
  ] = useState(
    pacienteInicialId
      ? [pacienteInicialId]
      : []
  )

  const [
    areasSeleccionadas,
    setAreasSeleccionadas
  ] = useState([])

  const [form, setForm] = useState({
    actividad: '',
    observacion: '',
    proximaSesion: ''
  })

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

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

  const togglePaciente = (
    pacienteId
  ) => {
    setPacientesSeleccionados(
      (prev) => {
        if (
          prev.includes(
            pacienteId
          )
        ) {
          return prev.filter(
            (id) =>
              id !== pacienteId
          )
        }

        return [
          ...prev,
          pacienteId
        ]
      }
    )

    if (error) {
      setError(null)
    }
  }

  const seleccionarTodos = () => {
    const ids =
      pacientesTurno.map(
        (paciente) =>
          paciente._id
      )

    setPacientesSeleccionados(
      ids
    )
  }

  const limpiarSeleccion = () => {
    setPacientesSeleccionados(
      []
    )
  }

  const obtenerPacientePorId = (
    pacienteId
  ) => {
    return pacientesTurno.find(
      (paciente) =>
        paciente._id?.toString() ===
        pacienteId?.toString()
    )
  }

  const obtenerNombrePaciente = (
    pacienteId
  ) => {
    const paciente =
      obtenerPacientePorId(
        pacienteId
      )

    if (!paciente) {
      return 'Paciente'
    }

    return `${paciente.nombre || ''} ${
      paciente.apellido || ''
    }`.trim()
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (
      pacientesSeleccionados.length ===
      0
    ) {
      setError(
        'Seleccioná al menos un paciente'
      )

      return
    }

    try {
      setLoading(true)
      setError(null)

      /*
        Intentamos crear cada sesión
        de forma independiente.

        Si una ya existe, no hacemos
        fallar las demás.
      */
      const resultados =
        await Promise.allSettled(
          pacientesSeleccionados.map(
            (pacienteId) => {
              const datos = {
                paciente:
                  pacienteId,

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

              return api.post(
                '/sesiones',
                datos
              )
            }
          )
        )

      const sesionesCreadas = []
      const pacientesCreados = []
      const pacientesDuplicados = []
      const pacientesConError = []

      resultados.forEach(
        (
          resultado,
          index
        ) => {
          const pacienteId =
            pacientesSeleccionados[
              index
            ]

          if (
            resultado.status ===
            'fulfilled'
          ) {
            const nuevaSesion =
              resultado.value.data?.data ||
              resultado.value.data

            sesionesCreadas.push(
              nuevaSesion
            )

            pacientesCreados.push(
              pacienteId
            )

            return
          }

          const status =
            resultado.reason
              ?.response
              ?.status

          const mensaje =
            resultado.reason
              ?.response
              ?.data
              ?.message

          if (status === 409) {
            pacientesDuplicados.push(
              pacienteId
            )

            return
          }

          pacientesConError.push({
            pacienteId,
            mensaje:
              mensaje ||
              'No se pudo registrar la sesión'
          })
        }
      )

      /*
        Marcamos como realizados
        solamente los pacientes cuyas
        sesiones realmente se crearon.
      */
      if (
        sesionesCreadas.length > 0 &&
        onCreated
      ) {
        await onCreated(
          sesionesCreadas,
          pacientesCreados
        )
      }

      /*
        Si hubo algún problema parcial,
        mostramos el detalle.
      */
      if (
        pacientesDuplicados.length > 0 ||
        pacientesConError.length > 0
      ) {
        const mensajes = []

        if (
          sesionesCreadas.length > 0
        ) {
          mensajes.push(
            `Se ${
              sesionesCreadas.length === 1
                ? 'guardó'
                : 'guardaron'
            } ${sesionesCreadas.length} ${
              sesionesCreadas.length === 1
                ? 'sesión'
                : 'sesiones'
            }.`
          )
        }

        if (
          pacientesDuplicados.length > 0
        ) {
          const nombres =
            pacientesDuplicados.map(
              (pacienteId) =>
                obtenerNombrePaciente(
                  pacienteId
                )
            )

          mensajes.push(
            `Ya ${
              pacientesDuplicados.length === 1
                ? 'existía una sesión para'
                : 'existían sesiones para'
            }: ${nombres.join(', ')}.`
          )
        }

        if (
          pacientesConError.length > 0
        ) {
          const nombres =
            pacientesConError.map(
              ({
                pacienteId
              }) =>
                obtenerNombrePaciente(
                  pacienteId
                )
            )

          mensajes.push(
            `No se ${
              pacientesConError.length === 1
                ? 'pudo guardar la sesión de'
                : 'pudieron guardar las sesiones de'
            }: ${nombres.join(', ')}.`
          )
        }

        setError(
          mensajes.join(' ')
        )

        /*
          Dejamos seleccionados solo
          los pacientes que no se pudieron
          guardar para que el usuario pueda
          revisar o reintentar.
        */
        setPacientesSeleccionados([
          ...pacientesDuplicados,
          ...pacientesConError.map(
            (item) =>
              item.pacienteId
          )
        ])

        return
      }

      /*
        Si todo salió bien,
        cerramos el formulario.
      */
      if (
        sesionesCreadas.length > 0 &&
        onCancel
      ) {
        onCancel()
      }
    } catch (error) {
      console.error(
        'Error al registrar sesiones:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudieron registrar las sesiones'
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

  const todosSeleccionados =
    pacientesTurno.length > 0 &&
    pacientesTurno.every(
      (paciente) =>
        pacientesSeleccionados.includes(
          paciente._id
        )
    )

  return (
    <section className="turn-session-form">

      {/* RESUMEN DEL TURNO */}

      <div className="turn-session-group-header">

        <div>

          <span className="turn-session-group-eyebrow">
            Registrar sesión
          </span>

          <h3>
            {pacientesTurno.length === 1
              ? 'Sesión individual'
              : 'Sesión grupal'}
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

        {pacientesTurno.length > 1 && (
          <span className="turn-session-group-count">
            {pacientesTurno.length}{' '}
            pacientes
          </span>
        )}

      </div>

      <form
        onSubmit={handleSubmit}
        className="turn-session-form-body"
      >

        {/* PACIENTES */}

        <div className="turn-session-block">

          <div className="turn-session-block-header">

            <div>

              <label>
                ¿A quiénes registrar la sesión?
              </label>

              <p>
                Se creará una sesión individual
                para cada paciente seleccionado.
              </p>

            </div>

            <span className="turn-session-count">
              {pacientesSeleccionados.length}{' '}
              seleccionados
            </span>

          </div>

          {pacientesTurno.length > 1 && (

            <div className="turn-session-patient-tools">

              <button
                type="button"
                className="turn-session-small-action"
                onClick={
                  todosSeleccionados
                    ? limpiarSeleccion
                    : seleccionarTodos
                }
              >
                {todosSeleccionados
                  ? 'Quitar todos'
                  : 'Seleccionar todos'}
              </button>

            </div>

          )}

          <div className="turn-session-patient-grid">

            {pacientesTurno.map(
              (paciente) => {
                const seleccionado =
                  pacientesSeleccionados.includes(
                    paciente._id
                  )

                return (
                  <button
                    key={paciente._id}
                    type="button"
                    className={
                      seleccionado
                        ? 'turn-session-patient-option selected'
                        : 'turn-session-patient-option'
                    }
                    onClick={() =>
                      togglePaciente(
                        paciente._id
                      )
                    }
                  >

                    <span className="turn-session-patient-option-avatar">

                      {paciente.nombre
                        ?.charAt(0)
                        ?.toUpperCase()}

                      {paciente.apellido
                        ?.charAt(0)
                        ?.toUpperCase()}

                    </span>

                    <span className="turn-session-patient-option-info">

                      <strong>
                        {paciente.nombre}{' '}
                        {paciente.apellido}
                      </strong>

                      <small>
                        {paciente.estado ===
                        'realizado'
                          ? 'Realizado'
                          : paciente.estado ===
                            'cancelado'
                          ? 'Cancelado'
                          : paciente.estado ===
                            'no_asistio'
                          ? 'No asistió'
                          : 'Programado'}
                      </small>

                    </span>

                    <span className="turn-session-patient-option-check">
                      {seleccionado
                        ? '✓'
                        : ''}
                    </span>

                  </button>
                )
              }
            )}

          </div>

        </div>

        {/* ÁREAS */}

        <div className="turn-session-block">

          <div className="turn-session-block-header">

            <div>

              <label>
                Áreas trabajadas
              </label>

              <p>
                Esta información se aplicará
                a todos los seleccionados.
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
  <span className="turn-session-area-check">
    {seleccionada ? '✓' : ''}
  </span>

  <span className="turn-session-area-name">
    {area}
  </span>
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
            Observación
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

          {pacientesSeleccionados.length > 1 && (
            <small className="turn-session-shared-note">
              Esta observación se guardará
              individualmente en la sesión
              de cada paciente seleccionado.
            </small>
          )}

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
            disabled={
              loading ||
              pacientesSeleccionados.length ===
                0
            }
          >
            {loading
              ? 'Guardando...'
              : pacientesSeleccionados.length > 1
              ? `✓ Guardar ${pacientesSeleccionados.length} sesiones`
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