import {
  useEffect,
  useMemo,
  useState
} from 'react'

import { Link } from 'react-router'
import { useSelector } from 'react-redux'

import api from '../../api/api.js'

export default function DashboardProfesional() {
  const { user } = useSelector(
    (state) => state.auth
  )

  const nombre =
    user?.profesional?.nombre ||
    user?.email ||
    'Profesional'

  const [turnos, setTurnos] =
    useState([])

  const [
    horariosSemanales,
    setHorariosSemanales
  ] = useState([])

  const [loadingAgenda, setLoadingAgenda] =
    useState(true)

  /*
    CARGAR TURNOS + HORARIOS FIJOS
  */

  useEffect(() => {
    const cargarHoy = async () => {
      try {
        setLoadingAgenda(true)

        const [
          responseTurnos,
          responseHorarios
        ] = await Promise.all([
          api.get('/turnos'),
          api.get('/horarios-semanales')
        ])

        const turnosRecibidos =
          responseTurnos.data?.data ||
          responseTurnos.data

        const horariosRecibidos =
          responseHorarios.data?.data ||
          responseHorarios.data

        setTurnos(
          Array.isArray(turnosRecibidos)
            ? turnosRecibidos
            : []
        )

        setHorariosSemanales(
          Array.isArray(horariosRecibidos)
            ? horariosRecibidos
            : []
        )
      } catch (error) {
        console.error(
          'Error al cargar turnos de hoy:',
          error
        )
      } finally {
        setLoadingAgenda(false)
      }
    }

    cargarHoy()
  }, [])

  const esMismoDia = (
    fecha1,
    fecha2
  ) => {
    return (
      fecha1.getFullYear() ===
        fecha2.getFullYear() &&
      fecha1.getMonth() ===
        fecha2.getMonth() &&
      fecha1.getDate() ===
        fecha2.getDate()
    )
  }

  const construirFechaHora = (
    fechaBase,
    hora
  ) => {
    const [horas, minutos] =
      hora.split(':').map(Number)

    const fecha =
      new Date(fechaBase)

    fecha.setHours(
      horas,
      minutos,
      0,
      0
    )

    return fecha
  }

  const obtenerIdPaciente = (
    paciente
  ) => {
    if (!paciente) {
      return null
    }

    return (
      paciente._id ||
      paciente
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

  const horarioAplicaHoy = (
    horario,
    hoy
  ) => {
    if (!horario.activo) {
      return false
    }

    if (
      horario.diaSemana !==
      hoy.getDay()
    ) {
      return false
    }

    const fechaHoy =
      new Date(hoy)

    fechaHoy.setHours(
      0,
      0,
      0,
      0
    )

    if (horario.fechaDesde) {
      const desde =
        new Date(
          horario.fechaDesde
        )

      desde.setHours(
        0,
        0,
        0,
        0
      )

      if (
        fechaHoy <
        desde
      ) {
        return false
      }
    }

    if (horario.fechaHasta) {
      const hasta =
        new Date(
          horario.fechaHasta
        )

      hasta.setHours(
        23,
        59,
        59,
        999
      )

      if (
        fechaHoy >
        hasta
      ) {
        return false
      }
    }

    return true
  }

  /*
    ARMAR LOS TURNOS DE HOY
  */

  const turnosHoy =
    useMemo(() => {
      const hoy =
        new Date()

      const turnosReales =
        turnos.filter(
          (turno) => {
            if (
              !turno.fechaInicio
            ) {
              return false
            }

            return esMismoDia(
              new Date(
                turno.fechaInicio
              ),
              hoy
            )
          }
        )

      const horariosVirtuales =
        horariosSemanales
          .filter(
            (horario) =>
              horarioAplicaHoy(
                horario,
                hoy
              )
          )
          .map(
            (horario) => {
              const inicio =
                construirFechaHora(
                  hoy,
                  horario.horaInicio
                )

              const fin =
                construirFechaHora(
                  hoy,
                  horario.horaFin
                )

              const pacientes =
                obtenerPacientesHorario(
                  horario
                )

              return {
                _id:
                  `horario-${horario._id}-${hoy
                    .toISOString()
                    .slice(0, 10)}`,

                horarioSemanalId:
                  horario._id,

                esHorarioFijo:
                  true,

                fechaInicio:
                  inicio.toISOString(),

                fechaFin:
                  fin.toISOString(),

                participantes:
                  pacientes.map(
                    (paciente) => ({
                      paciente,
                      estado:
                        'programado'
                    })
                  )
              }
            }
          )
          .filter(
            (turno) =>
              turno.participantes.length >
              0
          )

      /*
        Evitamos mostrar el horario fijo
        si ya existe el turno real.
      */

      const horariosSinDuplicar =
        horariosVirtuales.filter(
          (horarioVirtual) => {
            return !turnosReales.some(
              (turnoReal) => {
                const fechaReal =
                  new Date(
                    turnoReal.fechaInicio
                  )

                const fechaVirtual =
                  new Date(
                    horarioVirtual.fechaInicio
                  )

                const mismaHora =
                  fechaReal.getHours() ===
                    fechaVirtual.getHours() &&
                  fechaReal.getMinutes() ===
                    fechaVirtual.getMinutes()

                if (!mismaHora) {
                  return false
                }

                const idsReal =
                  (
                    turnoReal.participantes ||
                    []
                  )
                    .map(
                      (participante) =>
                        obtenerIdPaciente(
                          participante.paciente
                        )
                    )
                    .filter(Boolean)
                    .sort()

                const idsVirtual =
                  (
                    horarioVirtual.participantes ||
                    []
                  )
                    .map(
                      (participante) =>
                        obtenerIdPaciente(
                          participante.paciente
                        )
                    )
                    .filter(Boolean)
                    .sort()

                if (
                  idsReal.length !==
                  idsVirtual.length
                ) {
                  return false
                }

                return idsReal.every(
                  (id, index) =>
                    id ===
                    idsVirtual[index]
                )
              }
            )
          }
        )

      return [
        ...turnosReales,
        ...horariosSinDuplicar
      ].sort(
        (a, b) =>
          new Date(
            a.fechaInicio
          ) -
          new Date(
            b.fechaInicio
          )
      )
    }, [
      turnos,
      horariosSemanales
    ])

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

  const obtenerNombres = (
    participantes = []
  ) => {
    return participantes
      .map(
        (participante) => {
          const paciente =
            participante.paciente

          return `${paciente?.nombre || ''} ${
            paciente?.apellido || ''
          }`.trim()
        }
      )
      .filter(Boolean)
  }

  const haySesionPendiente = (
    turno
  ) => {
    if (turno.esHorarioFijo) {
      return true
    }

    return (
      turno.participantes ||
      []
    ).some(
      (participante) =>
        participante.estado ===
        'programado'
    )
  }

  return (
    <main className="dashboard-page">

      {/* ENCABEZADO */}

      <section className="dashboard-hero">

        <div>

          <p className="dashboard-eyebrow">
            Inicio
          </p>

          <h1>
            Hola, {nombre}
          </h1>

          <p>
            Registrá rápido lo importante
            y seguí con tu día.
          </p>

        </div>

      </section>

      {/* ACCIONES PRINCIPALES */}

      <section className="dashboard-main-actions">

        <Link
          to="/agenda"
          className="dashboard-main-action dashboard-main-session"
        >

          <div className="dashboard-main-icon">
            📝
          </div>

          <div className="dashboard-main-content">

            <span className="dashboard-main-label">
              Al terminar una atención
            </span>

            <h2>
              Registrar sesión
            </h2>

            <p>
              Elegí el turno y anotá
              rápidamente lo trabajado.
            </p>

          </div>

          <span className="dashboard-main-arrow">
            →
          </span>

        </Link>

        <Link
          to="/nota-rapida"
          className="dashboard-main-action dashboard-main-note"
        >

          <div className="dashboard-main-icon">
            ✍️
          </div>

          <div className="dashboard-main-content">

            <span className="dashboard-main-label">
              Mientras hablás con alguien
            </span>

            <h2>
              Nueva nota rápida
            </h2>

            <p>
              Elegí un paciente y registrá
              una conversación u observación.
            </p>

          </div>

          <span className="dashboard-main-arrow">
            →
          </span>

        </Link>

      </section>

      {/* TURNOS DE HOY */}

      <section className="dashboard-today-section">

        <div className="dashboard-section-heading">

          <div>

            <h2>
              Turnos de hoy
            </h2>

            <p>
              Registrá una sesión apenas
              termina la atención.
            </p>

          </div>

          <Link
            to="/agenda"
            className="dashboard-see-agenda"
          >
            Ver agenda →
          </Link>

        </div>

        {loadingAgenda ? (

          <div className="dashboard-today-empty">
            Cargando turnos...
          </div>

        ) : turnosHoy.length === 0 ? (

          <div className="dashboard-today-empty">

            <strong>
              No hay turnos para hoy
            </strong>

            <span>
              Podés consultar otros días
              desde la Agenda.
            </span>

          </div>

        ) : (

          <div className="dashboard-today-list">

            {turnosHoy.map(
              (turno) => {
                const nombres =
                  obtenerNombres(
                    turno.participantes
                  )

                const pendiente =
                  haySesionPendiente(
                    turno
                  )

                return (
                  <article
                    key={
                      turno._id
                    }
                    className="dashboard-today-turn"
                  >

                    <div className="dashboard-today-time">

                      <strong>
                        {mostrarHora(
                          turno.fechaInicio
                        )}
                      </strong>

                      <span>
                        {mostrarHora(
                          turno.fechaFin
                        )}
                      </span>

                    </div>

                    <div className="dashboard-today-info">

                      <strong>
                        {nombres.length > 0
                          ? nombres.join(', ')
                          : 'Sin paciente'}
                      </strong>

                      <span>
                        {turno.esHorarioFijo
                          ? 'Horario fijo'
                          : nombres.length === 1
                          ? 'Sesión individual'
                          : `${nombres.length} pacientes`}
                      </span>

                    </div>

                    {pendiente ? (

                      <Link
                        to="/agenda"
                        state={{
                          registrarSesion:
                            turno
                        }}
                        className="dashboard-today-register"
                      >
                        📝 Registrar sesión
                      </Link>

                    ) : (

                      <span className="dashboard-today-done">
                        ✓ Realizado
                      </span>

                    )}

                  </article>
                )
              }
            )}

          </div>

        )}

      </section>

      {/* ACCESOS SECUNDARIOS */}

      <section className="dashboard-secondary-section">

        <div className="dashboard-section-heading">

          <div>

            <h2>
              Otras herramientas
            </h2>

            <p>
              Accesos para organizar
              y consultar información.
            </p>

          </div>

        </div>

        <div className="dashboard-actions-grid">

          <Link
            to="/agenda"
            className="dashboard-action-card"
          >

            <div className="dashboard-action-icon">
              ◫
            </div>

            <div>

              <strong>
                Agenda
              </strong>

              <span>
                Ver los turnos del día,
                semana o mes
              </span>

            </div>

          </Link>

          <Link
            to="/pacientes"
            className="dashboard-action-card"
          >

            <div className="dashboard-action-icon">
              ♡
            </div>

            <div>

              <strong>
                Pacientes
              </strong>

              <span>
                Fichas, historial
                e información clínica
              </span>

            </div>

          </Link>

          <Link
            to="/horarios"
            className="dashboard-action-card"
          >

            <div className="dashboard-action-icon">
              ◷
            </div>

            <div>

              <strong>
                Horarios fijos
              </strong>

              <span>
                Organizar la agenda semanal
              </span>

            </div>

          </Link>

        </div>

      </section>

    </main>
  )
}