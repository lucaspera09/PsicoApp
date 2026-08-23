import {
  useEffect,
  useMemo,
  useState
} from 'react'

import api from '../../api/api.js'

const diasSemana = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
]

export default function HorariosPaciente({
  paciente
}) {
  const [
    horarios,
    setHorarios
  ] = useState([])

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState(null)

  const [
    horarioEditando,
    setHorarioEditando
  ] = useState(null)

  const [
    creando,
    setCreando
  ] = useState(false)

  const [
    guardando,
    setGuardando
  ] = useState(false)

  const [
    form,
    setForm
  ] = useState({
    diaSemana: 1,
    horaInicio: '',
    horaFin: '',
    fechaDesde: '',
    fechaHasta: ''
  })

  useEffect(() => {
    cargarHorarios()
  }, [paciente._id])

  const obtenerIdPaciente = (
    pacienteHorario
  ) => {
    if (!pacienteHorario) {
      return null
    }

    return (
      pacienteHorario._id ||
      pacienteHorario
    ).toString()
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

  const cargarHorarios = async () => {
    try {
      setLoading(true)
      setError(null)

      const response =
        await api.get(
          '/horarios-semanales'
        )

      const recibidos =
        response.data?.data ||
        response.data

      setHorarios(
        Array.isArray(recibidos)
          ? recibidos
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

  const horariosPaciente =
    useMemo(() => {
      return horarios
        .filter((horario) => {
          const pacientes =
            obtenerPacientesHorario(
              horario
            )

          return pacientes.some(
            (pacienteHorario) =>
              obtenerIdPaciente(
                pacienteHorario
              ) ===
              paciente._id.toString()
          )
        })
        .sort((a, b) => {
          const orden = [
            1,
            2,
            3,
            4,
            5,
            6,
            0
          ]

          if (
            a.diaSemana !==
            b.diaSemana
          ) {
            return (
              orden.indexOf(
                a.diaSemana
              ) -
              orden.indexOf(
                b.diaSemana
              )
            )
          }

          return (
            a.horaInicio || ''
          ).localeCompare(
            b.horaInicio || ''
          )
        })
    }, [
      horarios,
      paciente._id
    ])

  const formatearFechaInput = (
    fecha
  ) => {
    if (!fecha) {
      return ''
    }

    /*
      Evitamos new Date()
      para no correr un día
      por zona horaria.
    */

    return fecha
      .toString()
      .split('T')[0]
  }

  const formatearFecha = (
    fecha
  ) => {
    if (!fecha) {
      return null
    }

    const fechaSolo =
      fecha
        .toString()
        .split('T')[0]

    const [
      anio,
      mes,
      dia
    ] = fechaSolo.split('-')

    if (
      !anio ||
      !mes ||
      !dia
    ) {
      return null
    }

    return `${dia}/${mes}/${anio}`
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

  const limpiarFormulario = () => {
    setHorarioEditando(null)
    setCreando(false)
    setError(null)

    setForm({
      diaSemana: 1,
      horaInicio: '',
      horaFin: '',
      fechaDesde: '',
      fechaHasta: ''
    })
  }

  const handleChange = (
    event
  ) => {
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

  const empezarCrear = () => {
    setHorarioEditando(null)
    setCreando(true)

    setForm({
      diaSemana: 1,
      horaInicio: '',
      horaFin: '',
      fechaDesde: '',
      fechaHasta: ''
    })

    setError(null)
  }

  const editarHorario = (
    horario
  ) => {
    setCreando(false)

    setHorarioEditando(
      horario
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

    setError(null)
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (
      !form.horaInicio ||
      !form.horaFin
    ) {
      setError(
        'Completá la hora de inicio y fin'
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

      let pacientesIds = [
        paciente._id
      ]

      /*
        Si estamos editando un
        horario compartido,
        preservamos TODOS
        los pacientes del bloque.
      */

      if (horarioEditando) {
        pacientesIds =
          obtenerPacientesHorario(
            horarioEditando
          )
            .map(
              obtenerIdPaciente
            )
            .filter(Boolean)
      }

      const datos = {
        pacientes:
          pacientesIds,

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
          `${form.fechaDesde}T00:00:00.000Z`
      }

      if (form.fechaHasta) {
        datos.fechaHasta =
          `${form.fechaHasta}T23:59:59.999Z`
      } else if (
        horarioEditando
      ) {
        datos.fechaHasta =
          null
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

    const compartido =
      pacientesHorario.length > 1

    const mensaje =
      compartido
        ? `Este horario está compartido con ${pacientesHorario.length} pacientes. Si lo desactivás, desaparecerá de la agenda para todos ellos. ¿Querés continuar?`
        : `¿Querés desactivar el horario de ${paciente.nombre}?`

    if (
      !window.confirm(mensaje)
    ) {
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

  if (loading) {
    return (
      <div className="patient-schedule-loading">
        Cargando horarios...
      </div>
    )
  }

  return (
    <div className="patient-schedules">

      {/* HEADER */}

      <div className="patient-schedules-header">

        <div>
          <span>
            Organización semanal
          </span>

          <h3>
            Horarios de {paciente.nombre}
          </h3>

          <p>
            Los cambios realizados acá
            también se reflejan
            automáticamente en la agenda.
          </p>
        </div>

        {!creando &&
          !horarioEditando && (

          <button
            type="button"
            className="patient-schedule-new"
            onClick={
              empezarCrear
            }
          >
            + Agregar horario
          </button>

        )}

      </div>

      {/* FORMULARIO */}

      {(creando ||
        horarioEditando) && (

        <form
          className="patient-schedule-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="patient-schedule-form-heading">

            <div>

              <span>
                {horarioEditando
                  ? 'Editar horario'
                  : 'Nuevo horario'}
              </span>

              <strong>
                {horarioEditando
                  ? 'Modificar horario semanal'
                  : `Agregar horario para ${paciente.nombre}`}
              </strong>

            </div>

          </div>

          {horarioEditando &&
            obtenerPacientesHorario(
              horarioEditando
            ).length > 1 && (

            <div className="patient-schedule-shared-warning">

              <strong>
                Horario compartido
              </strong>

              <p>
                Este bloque tiene{' '}
                {
                  obtenerPacientesHorario(
                    horarioEditando
                  ).length
                } pacientes.
                Al cambiar el día o la hora,
                el horario se moverá para
                todo el grupo.
              </p>

            </div>

          )}

          <div className="patient-schedule-form-grid">

            <div className="form-group">

              <label>
                Día
              </label>

              <select
                name="diaSemana"
                value={
                  form.diaSemana
                }
                onChange={
                  handleChange
                }
                className="form-control"
              >
                {diasSemana.map(
                  (dia) => (
                    <option
                      key={
                        dia.value
                      }
                      value={
                        dia.value
                      }
                    >
                      {dia.label}
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="form-group">

              <label>
                Hora inicio
              </label>

              <input
                type="time"
                name="horaInicio"
                value={
                  form.horaInicio
                }
                onChange={
                  handleChange
                }
                className="form-control"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Hora fin
              </label>

              <input
                type="time"
                name="horaFin"
                value={
                  form.horaFin
                }
                onChange={
                  handleChange
                }
                className="form-control"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Desde
              </label>

              <input
                type="date"
                name="fechaDesde"
                value={
                  form.fechaDesde
                }
                onChange={
                  handleChange
                }
                className="form-control"
              />

            </div>

            <div className="form-group">

              <label>
                Hasta
              </label>

              <input
                type="date"
                name="fechaHasta"
                value={
                  form.fechaHasta
                }
                onChange={
                  handleChange
                }
                className="form-control"
              />

            </div>

          </div>

          {error && (
            <div className="patient-schedule-error">
              {error}
            </div>
          )}

          <div className="patient-schedule-form-actions">

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                guardando
              }
            >
              {guardando
                ? 'Guardando...'
                : horarioEditando
                ? 'Guardar cambios'
                : 'Crear horario'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={
                limpiarFormulario
              }
              disabled={
                guardando
              }
            >
              Cancelar
            </button>

          </div>

        </form>

      )}

      {/* HORARIOS */}

      {horariosPaciente.length ===
      0 ? (

        <div className="patient-schedules-empty">

          <div>
            ◷
          </div>

          <h3>
            Sin horario fijo
          </h3>

          <p>
            {paciente.nombre} todavía
            no tiene un horario semanal
            configurado.
          </p>

          {!creando && (
            <button
              type="button"
              onClick={
                empezarCrear
              }
            >
              + Agregar horario
            </button>
          )}

        </div>

      ) : (

        <div className="patient-schedules-list">

          {horariosPaciente.map(
            (horario) => {
              const pacientesHorario =
                obtenerPacientesHorario(
                  horario
                )

              const otrosPacientes =
                pacientesHorario.filter(
                  (pacienteHorario) =>
                    obtenerIdPaciente(
                      pacienteHorario
                    ) !==
                    paciente._id.toString()
                )

              return (
                <article
                  key={
                    horario._id
                  }
                  className="patient-schedule-card"
                >

                  <div className="patient-schedule-day">

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

                  <div className="patient-schedule-details">

                    <div>

                      <span>
                        Frecuencia
                      </span>

                      <strong>
                        Semanal
                      </strong>

                    </div>

                    <div>

                      <span>
                        Desde
                      </span>

                      <strong>
                        {formatearFecha(
                          horario.fechaDesde
                        ) ||
                          'Desde hoy'}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Hasta
                      </span>

                      <strong>
                        {formatearFecha(
                          horario.fechaHasta
                        ) ||
                          'Sin finalización'}
                      </strong>

                    </div>

                  </div>

                  {otrosPacientes.length >
                    0 && (

                    <div className="patient-schedule-shared">

                      <span>
                        Horario compartido con
                      </span>

                      <div>

                        {otrosPacientes.map(
                          (
                            otroPaciente,
                            index
                          ) => (

                          <span
                            key={
                              otroPaciente?._id ||
                              index
                            }
                          >
                            {otroPaciente?.nombre}{' '}
                            {otroPaciente?.apellido}
                          </span>

                        ))}

                      </div>

                    </div>

                  )}

                  <div className="patient-schedule-card-actions">

                    <button
                      type="button"
                      className="patient-schedule-edit"
                      onClick={() =>
                        editarHorario(
                          horario
                        )
                      }
                    >
                      Editar horario
                    </button>

                    <button
                      type="button"
                      className="patient-schedule-disable"
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

    </div>
  )
}