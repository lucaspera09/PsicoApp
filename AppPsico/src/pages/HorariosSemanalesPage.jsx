import { useEffect, useMemo, useState } from 'react'

import api from '../api/api.js'

const diasSemana = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
]

export default function HorariosSemanalesPage() {
  const [horarios, setHorarios] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [
    pacientesSeleccionados,
    setPacientesSeleccionados
  ] = useState([])

  const [form, setForm] = useState({
    diaSemana: 1,
    horaInicio: '',
    horaFin: '',
    fechaDesde: '',
    fechaHasta: ''
  })

  const [
    horarioEditando,
    setHorarioEditando
  ] = useState(null)

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        responseHorarios,
        responsePacientes
      ] = await Promise.all([
        api.get('/horarios-semanales'),
        api.get('/pacientes')
      ])

      const horariosRecibidos =
        responseHorarios.data?.data ||
        responseHorarios.data

      const pacientesRecibidos =
        responsePacientes.data?.data ||
        responsePacientes.data

      setHorarios(
        Array.isArray(horariosRecibidos)
          ? horariosRecibidos
          : []
      )

      setPacientes(
        Array.isArray(pacientesRecibidos)
          ? pacientesRecibidos
          : []
      )
    } catch (error) {
      console.error(
        'Error al cargar horarios:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudieron cargar los horarios'
      )
    } finally {
      setLoading(false)
    }
  }

  const horariosOrdenados =
    useMemo(() => {
      const orden = [
        1,
        2,
        3,
        4,
        5,
        6,
        0
      ]

      return [...horarios].sort(
        (a, b) => {
          if (
            a.diaSemana !==
            b.diaSemana
          ) {
            return (
              orden.indexOf(a.diaSemana) -
              orden.indexOf(b.diaSemana)
            )
          }

          return (
            a.horaInicio || ''
          ).localeCompare(
            b.horaInicio || ''
          )
        }
      )
    }, [horarios])

  const pacientesActivos =
    useMemo(
      () =>
        pacientes.filter(
          (paciente) =>
            paciente.activo
        ),
      [pacientes]
    )

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target

    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'diaSemana'
          ? Number(value)
          : value
    }))

    if (error) {
      setError(null)
    }
  }

  const handlePacienteChange = (
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
              id !==
              pacienteId
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

  const limpiarFormulario = () => {
    setForm({
      diaSemana: 1,
      horaInicio: '',
      horaFin: '',
      fechaDesde: '',
      fechaHasta: ''
    })

    setPacientesSeleccionados([])
    setHorarioEditando(null)
    setError(null)
  }

  const formatearFechaInput = (
    fecha
  ) => {
    if (!fecha) {
      return ''
    }

    const date =
      new Date(fecha)

    const year =
      date.getFullYear()

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      )

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      )

    return `${year}-${month}-${day}`
  }

  const editarHorario = (
    horario
  ) => {
    const idsPacientes =
      Array.isArray(
        horario.pacientes
      )
        ? horario.pacientes
            .map(
              (paciente) =>
                paciente?._id ||
                paciente
            )
            .filter(Boolean)
            .map(
              (id) =>
                id.toString()
            )
        : horario.paciente
        ? [
            (
              horario.paciente?._id ||
              horario.paciente
            ).toString()
          ]
        : []

    setPacientesSeleccionados(
      idsPacientes
    )

    setForm({
      diaSemana:
        horario.diaSemana,

      horaInicio:
        horario.horaInicio ||
        '',

      horaFin:
        horario.horaFin ||
        '',

      fechaDesde:
        formatearFechaInput(
          horario.fechaDesde
        ),

      fechaHasta:
        formatearFechaInput(
          horario.fechaHasta
        )
    })

    setHorarioEditando(
      horario
    )

    setError(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
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

    if (
      !form.horaInicio ||
      !form.horaFin
    ) {
      setError(
        'Completá la hora de inicio y de fin'
      )

      return
    }

    if (
      form.horaFin <=
      form.horaInicio
    ) {
      setError(
        'La hora de fin debe ser posterior a la hora de inicio'
      )

      return
    }

    try {
      setGuardando(true)
      setError(null)

      const datos = {
        pacientes:
          pacientesSeleccionados,

        diaSemana:
          Number(
            form.diaSemana
          ),

        horaInicio:
          form.horaInicio,

        horaFin:
          form.horaFin
      }

      if (form.fechaDesde) {
        datos.fechaDesde =
          new Date(
            `${form.fechaDesde}T00:00:00`
          ).toISOString()
      }

      if (form.fechaHasta) {
        datos.fechaHasta =
          new Date(
            `${form.fechaHasta}T23:59:59`
          ).toISOString()
      } else if (
        horarioEditando
      ) {
        datos.fechaHasta = null
      }

      if (horarioEditando) {
        const response =
          await api.put(
            `/horarios-semanales/${horarioEditando._id}`,
            datos
          )

        const actualizado =
          response.data?.data ||
          response.data

        setHorarios(
          (prev) =>
            prev.map(
              (horario) =>
                horario._id ===
                actualizado._id
                  ? actualizado
                  : horario
            )
        )
      } else {
        const response =
          await api.post(
            '/horarios-semanales',
            datos
          )

        const nuevo =
          response.data?.data ||
          response.data

        setHorarios(
          (prev) => [
            ...prev,
            nuevo
          ]
        )
      }

      limpiarFormulario()
    } catch (error) {
      console.error(
        'Error al guardar horario:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo guardar el horario'
      )
    } finally {
      setGuardando(false)
    }
  }

  const desactivarHorario = async (
    horario
  ) => {
    const pacientesHorario =
      obtenerPacientesHorario(
        horario
      )

    const nombres =
      pacientesHorario
        .map(
          (paciente) =>
            `${paciente?.nombre || ''} ${
              paciente?.apellido || ''
            }`.trim()
        )
        .filter(Boolean)
        .join(', ')

    const confirmado =
      window.confirm(
        `¿Querés desactivar este horario${
          nombres
            ? ` de ${nombres}`
            : ''
        }?`
      )

    if (!confirmado) {
      return
    }

    try {
      await api.delete(
        `/horarios-semanales/${horario._id}`
      )

      setHorarios(
        (prev) =>
          prev.filter(
            (item) =>
              item._id !==
              horario._id
          )
      )

      if (
        horarioEditando?._id ===
        horario._id
      ) {
        limpiarFormulario()
      }
    } catch (error) {
      console.error(
        'Error al desactivar horario:',
        error
      )

      alert(
        error.response?.data?.message ||
        'No se pudo desactivar el horario'
      )
    }
  }

  const mostrarDia = (
    diaSemana
  ) => {
    return (
      diasSemana.find(
        (dia) =>
          dia.value ===
          diaSemana
      )?.label ||
      'Día'
    )
  }

  const mostrarFecha = (
    fecha
  ) => {
    if (!fecha) {
      return null
    }

    return new Date(
      fecha
    ).toLocaleDateString(
      'es-UY'
    )
  }

  const obtenerPacientesHorario = (
    horario
  ) => {
    if (
      Array.isArray(
        horario.pacientes
      )
    ) {
      return horario.pacientes
    }

    if (horario.paciente) {
      return [
        horario.paciente
      ]
    }

    return []
  }

  if (loading) {
    return (
      <main className="weekly-schedules-page">
        <p>
          Cargando horarios...
        </p>
      </main>
    )
  }

  return (
    <main className="weekly-schedules-page">

      <section className="weekly-schedules-header">

        <div>
          <p className="weekly-schedules-eyebrow">
            Organización semanal
          </p>

          <h1>
            Horarios fijos
          </h1>

          <p>
            Configurá los turnos
            que se repiten todas las semanas.
          </p>
        </div>

      </section>

      <section className="weekly-schedule-form-card">

        <div className="weekly-schedule-form-header">
          <div>
            <p className="weekly-schedule-form-eyebrow">
              {horarioEditando
                ? 'Modificando'
                : 'Nuevo'}
            </p>

            <h2>
              {horarioEditando
                ? 'Editar horario fijo'
                : 'Crear horario fijo'}
            </h2>

            <p>
              Podés asignar uno o varios
              pacientes al mismo bloque.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="weekly-schedule-form"
        >

          <div className="weekly-schedule-patients">

            <div className="weekly-schedule-field-heading">
              <div>
                <label>
                  Pacientes
                </label>

                <p>
                  Seleccioná quiénes
                  participan de este horario.
                </p>
              </div>

              <span className="weekly-schedule-selected-count">
                {
                  pacientesSeleccionados.length
                }{' '}
                seleccionados
              </span>
            </div>

            <div className="weekly-schedule-patient-grid">

              {pacientesActivos.map(
                (paciente) => {
                  const seleccionado =
                    pacientesSeleccionados.includes(
                      paciente._id
                    )

                  return (
                    <label
                      key={paciente._id}
                      className={
                        seleccionado
                          ? 'weekly-schedule-patient selected'
                          : 'weekly-schedule-patient'
                      }
                    >
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() =>
                          handlePacienteChange(
                            paciente._id
                          )
                        }
                      />

                      <div className="weekly-schedule-patient-avatar">
                        {paciente.nombre
                          ?.charAt(0)
                          ?.toUpperCase()}

                        {paciente.apellido
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {paciente.nombre}{' '}
                          {paciente.apellido}
                        </strong>

                        <span>
                          {seleccionado
                            ? 'Seleccionado'
                            : 'Seleccionar'}
                        </span>
                      </div>
                    </label>
                  )
                }
              )}

            </div>

          </div>

          <div className="weekly-schedule-form-grid">

            <div className="form-group">
              <label htmlFor="horario-dia">
                Día de la semana
              </label>

              <select
                id="horario-dia"
                name="diaSemana"
                value={form.diaSemana}
                onChange={handleChange}
                className="form-control"
                required
              >
                {diasSemana.map(
                  (dia) => (
                    <option
                      key={dia.value}
                      value={dia.value}
                    >
                      {dia.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="horario-inicio">
                Hora de inicio
              </label>

              <input
                id="horario-inicio"
                name="horaInicio"
                type="time"
                value={form.horaInicio}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="horario-fin">
                Hora de fin
              </label>

              <input
                id="horario-fin"
                name="horaFin"
                type="time"
                value={form.horaFin}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="horario-desde">
                Desde
              </label>

              <input
                id="horario-desde"
                name="fechaDesde"
                type="date"
                value={form.fechaDesde}
                onChange={handleChange}
                className="form-control"
              />

              <small>
                Si queda vacío,
                comienza desde hoy.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="horario-hasta">
                Hasta
              </label>

              <input
                id="horario-hasta"
                name="fechaHasta"
                type="date"
                value={form.fechaHasta}
                onChange={handleChange}
                className="form-control"
              />

              <small>
                Opcional.
              </small>
            </div>

          </div>

          {error && (
            <div className="weekly-schedule-error">
              {error}
            </div>
          )}

          <div className="weekly-schedule-form-actions">

            <button
              type="submit"
              className="btn btn-primary"
              disabled={guardando}
            >
              {guardando
                ? 'Guardando...'
                : horarioEditando
                ? 'Guardar cambios'
                : 'Crear horario fijo'}
            </button>

            {horarioEditando && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={limpiarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>
            )}

          </div>

        </form>

      </section>

      <section className="weekly-schedules-list-section">

        <div className="weekly-schedules-list-header">

          <div>
            <p className="weekly-schedules-eyebrow">
              Configuración actual
            </p>

            <h2>
              Horarios configurados
            </h2>
          </div>

          <span className="weekly-schedules-count">
            {horariosOrdenados.length}{' '}
            {horariosOrdenados.length === 1
              ? 'horario'
              : 'horarios'}
          </span>

        </div>

        {horariosOrdenados.length === 0 ? (
          <div className="weekly-schedules-empty">

            <div className="weekly-schedules-empty-icon">
              ◷
            </div>

            <h3>
              No hay horarios fijos
            </h3>

            <p>
              Creá el primero para que
              aparezca automáticamente
              en la agenda semanal.
            </p>

          </div>
        ) : (
          <div className="weekly-schedules-list">

            {horariosOrdenados.map(
              (horario) => {
                const pacientesHorario =
                  obtenerPacientesHorario(
                    horario
                  )

                return (
                  <article
                    key={horario._id}
                    className="weekly-schedule-card"
                  >

                    <div className="weekly-schedule-card-main">

                      <div className="weekly-schedule-day">
                        <span>
                          {mostrarDia(
                            horario.diaSemana
                          )}
                        </span>

                        <strong>
                          {horario.horaInicio}
                          {' – '}
                          {horario.horaFin}
                        </strong>
                      </div>

                      <div className="weekly-schedule-card-patients">

                        <span className="weekly-schedule-card-label">
                          Pacientes
                        </span>

                        <div className="weekly-schedule-tags">

                          {pacientesHorario.length > 0
                            ? pacientesHorario.map(
                                (
                                  paciente,
                                  index
                                ) => (
                                  <span
                                    key={
                                      paciente?._id ||
                                      index
                                    }
                                    className="weekly-schedule-tag"
                                  >
                                    {paciente?.nombre}{' '}
                                    {paciente?.apellido}
                                  </span>
                                )
                              )
                            : (
                              <span className="weekly-schedule-empty-text">
                                Sin pacientes
                              </span>
                            )}

                        </div>

                      </div>

                      <div className="weekly-schedule-dates">

                        <div>
                          <span>
                            Desde
                          </span>

                          <strong>
                            {mostrarFecha(
                              horario.fechaDesde
                            ) ||
                              'Sin fecha'}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Hasta
                          </span>

                          <strong>
                            {mostrarFecha(
                              horario.fechaHasta
                            ) ||
                              'Sin finalización'}
                          </strong>
                        </div>

                      </div>

                    </div>

                    <div className="weekly-schedule-card-actions">

                      <button
                        type="button"
                        className="weekly-schedule-edit"
                        onClick={() =>
                          editarHorario(
                            horario
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="weekly-schedule-delete"
                        onClick={() =>
                          desactivarHorario(
                            horario
                          )
                        }
                      >
                        Desactivar
                      </button>

                    </div>

                  </article>
                )
              }
            )}

          </div>
        )}

      </section>

    </main>
  )
}