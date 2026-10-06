import {
  useEffect,
  useMemo,
  useState
} from 'react'

import { Link } from 'react-router'
import { useSelector } from 'react-redux'


import api from '../../api/api.js'
import PacienteQuickPanel from './PacienteQuickPanel.jsx'

/*
  ========================================
  CONTADOR ANIMADO
  ========================================
*/

function CountUpNumber({
  value = 0,
  duration = 700,
  suffix = ''
}) {
  const [
    displayedValue,
    setDisplayedValue
  ] = useState(0)

  useEffect(() => {
    const finalValue =
      Number(value) || 0

    if (finalValue === 0) {
      setDisplayedValue(0)

      return
    }

    let animationFrame

    const startTime =
      performance.now()

    const animate = (
      currentTime
    ) => {
      const elapsed =
        currentTime -
        startTime

      const progress =
        Math.min(
          elapsed /
            duration,
          1
        )

      /*
        Easing suave:
        arranca rápido
        y termina despacio.
      */
      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        )

      setDisplayedValue(
        Math.round(
          finalValue *
            eased
        )
      )

      if (
        progress < 1
      ) {
        animationFrame =
          requestAnimationFrame(
            animate
          )
      }
    }

    animationFrame =
      requestAnimationFrame(
        animate
      )

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(
          animationFrame
        )
      }
    }
  }, [
    value,
    duration
  ])

  return (
    <>
      {displayedValue}
      {suffix}
    </>
  )
}

export default function DashboardProfesional() {
  const { user } = useSelector(
    (state) => state.auth
  )

  const nombre =
    user?.profesional?.nombre ||
    user?.email ||
    'Profesional'

  const [
    turnos,
    setTurnos
  ] = useState([])

  const [
    horariosSemanales,
    setHorariosSemanales
  ] = useState([])

  const [
    pacientes,
    setPacientes
  ] = useState([])

  const [
    loadingAgenda,
    setLoadingAgenda
  ] = useState(true)

  const [
  pacientePanel,
  setPacientePanel
] = useState(null)

  /*
    ========================================
    CARGAR DATOS DEL DASHBOARD
    ========================================
  */

  useEffect(() => {
    const cargarDashboard =
      async () => {
        try {
          setLoadingAgenda(true)

          const [
            responseTurnos,
            responseHorarios,
            responsePacientes
          ] = await Promise.all([
            api.get('/turnos'),

            api.get(
              '/horarios-semanales'
            ),

            api.get('/pacientes')
          ])

          const turnosRecibidos =
            responseTurnos.data?.data ||
            responseTurnos.data

          const horariosRecibidos =
            responseHorarios.data?.data ||
            responseHorarios.data

          const pacientesRecibidos =
            responsePacientes.data?.data ||
            responsePacientes.data

          setTurnos(
            Array.isArray(
              turnosRecibidos
            )
              ? turnosRecibidos
              : []
          )

          setHorariosSemanales(
            Array.isArray(
              horariosRecibidos
            )
              ? horariosRecibidos
              : []
          )

          setPacientes(
            Array.isArray(
              pacientesRecibidos
            )
              ? pacientesRecibidos
              : []
          )

        } catch (error) {
          console.error(
            'Error al cargar dashboard:',
            error
          )

        } finally {
          setLoadingAgenda(false)
        }
      }

    cargarDashboard()
  }, [])

  /*
    ========================================
    HELPERS
    ========================================
  */

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
    const [
      horas,
      minutos
    ] =
      hora
        .split(':')
        .map(Number)

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
    ========================================
    TURNOS DE HOY
    ========================================
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

              const pacientesHorario =
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
                  pacientesHorario.map(
                    (
                      paciente
                    ) => ({
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
              turno
                .participantes
                .length > 0
          )

      /*
        Evitamos mostrar dos veces
        un horario que ya se convirtió
        en turno real.
      */

      const horariosSinDuplicar =
        horariosVirtuales.filter(
          (
            horarioVirtual
          ) => {
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
                      (
                        participante
                      ) =>
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
                      (
                        participante
                      ) =>
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
                  (
                    id,
                    index
                  ) =>
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

  /*
    ========================================
    FORMATO DE HORA
    ========================================
  */

  const mostrarHora = (
    fecha
  ) => {
    return new Date(
      fecha
    ).toLocaleTimeString(
      'es-UY',
      {
        hour:
          '2-digit',

        minute:
          '2-digit'
      }
    )
  }

  /*
    ========================================
    NOMBRES DE PACIENTES
    ========================================
  */

  const obtenerNombres = (
    participantes = []
  ) => {
    return participantes
      .map(
        (
          participante
        ) => {
          const paciente =
            participante.paciente

          return `${paciente?.nombre || ''} ${
            paciente?.apellido || ''
          }`.trim()
        }
      )
      .filter(Boolean)
  }

  /*
    ========================================
    SESIÓN PENDIENTE
    ========================================
  */

  const haySesionPendiente = (
    turno
  ) => {
    if (
      turno.esHorarioFijo
    ) {
      return true
    }

    return (
      turno.participantes ||
      []
    ).some(
      (
        participante
      ) =>
        participante.estado ===
        'programado'
    )
  }

  /*
    ========================================
    ESTADÍSTICAS
    ========================================
  */

  const pacientesActivos =
    useMemo(
      () =>
        pacientes.filter(
          (
            paciente
          ) =>
            paciente.activo !==
            false
        ).length,
      [pacientes]
    )

  const totalAtencionesHoy =
    useMemo(
      () =>
        turnosHoy.reduce(
          (
            total,
            turno
          ) =>
            total +
            (
              turno.participantes ||
              []
            ).length,
          0
        ),
      [turnosHoy]
    )

  const sesionesRealizadasHoy =
    useMemo(
      () =>
        turnosHoy.reduce(
          (
            total,
            turno
          ) =>
            total +
            (
              turno.participantes ||
              []
            ).filter(
              (
                participante
              ) =>
                participante.estado ===
                'realizado'
            ).length,
          0
        ),
      [turnosHoy]
    )

  const sesionesPendientesHoy =
    Math.max(
      0,
      totalAtencionesHoy -
        sesionesRealizadasHoy
    )

  const porcentajeCompletado =
    totalAtencionesHoy > 0
      ? Math.round(
          (
            sesionesRealizadasHoy /
            totalAtencionesHoy
          ) * 100
        )
      : 0

  /*
    ========================================
    PRÓXIMO TURNO
    ========================================
  */

  const proximoTurno =
    useMemo(() => {
      const ahora =
        new Date()

      const futuro =
        turnosHoy.find(
          (turno) =>
            new Date(
              turno.fechaFin
            ) >= ahora
        )

      return (
        futuro ||
        turnosHoy[
          turnosHoy.length - 1
        ] ||
        null
      )
    }, [turnosHoy])

  /*
    ========================================
    FECHA ACTUAL
    ========================================
  */

  const fechaHoy =
    new Date()
      .toLocaleDateString(
        'es-UY',
        {
          weekday:
            'long',

          day:
            'numeric',

          month:
            'long'
        }
      )

  const fechaTitulo =
    fechaHoy
      .charAt(0)
      .toUpperCase() +
    fechaHoy.slice(1)

  return (
    <main className="dashboard-page dashboard-bento">

      {/* =====================
          HEADER
      ====================== */}

      <section className="dashboard-bento-header">

        <div>

          <p className="dashboard-eyebrow">
            Inicio
          </p>

          <h1>
            Hola, {nombre}
          </h1>

          <p>
            Tenés todo lo importante
            de hoy en un solo lugar.
          </p>

        </div>

        <div className="dashboard-date-chip">

          <span>
            Hoy
          </span>

          <strong>
            {fechaTitulo}
          </strong>

        </div>

      </section>

      {/* =====================
          MÉTRICAS
      ====================== */}

      <section className="dashboard-stats">

        {/* PACIENTES */}

        <article className="dashboard-stat-card dashboard-animate dashboard-delay-1">

          <div className="dashboard-stat-top">

            <span>
              Pacientes
            </span>

            <div className="dashboard-stat-icon">
              ♡
            </div>

          </div>

          <strong className="dashboard-stat-number">

            <CountUpNumber
              value={
                pacientesActivos
              }
            />

          </strong>

          <small>
            pacientes activos
          </small>

        </article>

        {/* HOY */}

        <article className="dashboard-stat-card dashboard-stat-primary dashboard-animate dashboard-delay-2">

          <div className="dashboard-stat-top">

            <span>
              Hoy
            </span>

            <div className="dashboard-stat-icon">
              ◷
            </div>

          </div>

          <strong className="dashboard-stat-number">

            <CountUpNumber
              value={
                totalAtencionesHoy
              }
              duration={750}
            />

          </strong>

          <small>
            atenciones programadas
          </small>

        </article>

        {/* PENDIENTES */}

        <article className="dashboard-stat-card dashboard-animate dashboard-delay-3">

          <div className="dashboard-stat-top">

            <span>
              Pendientes
            </span>

            <div className="dashboard-stat-icon">
              ↗
            </div>

          </div>

          <strong className="dashboard-stat-number">

            <CountUpNumber
              value={
                sesionesPendientesHoy
              }
              duration={800}
            />

          </strong>

          <small>
            por registrar
          </small>

        </article>

        {/* REALIZADAS */}

        <article className="dashboard-stat-card dashboard-animate dashboard-delay-4">

          <div className="dashboard-stat-top">

            <span>
              Realizadas
            </span>

            <div className="dashboard-stat-icon dashboard-stat-success">
              ✓
            </div>

          </div>

          <strong className="dashboard-stat-number">

            <CountUpNumber
              value={
                sesionesRealizadasHoy
              }
              duration={850}
            />

          </strong>

          <small>
            sesiones de hoy
          </small>

        </article>

      </section>

      {/* =====================
          BENTO PRINCIPAL
      ====================== */}

      <section className="dashboard-bento-grid">

        {/* =====================
            AGENDA DE HOY
        ====================== */}

        <article className="dashboard-bento-card dashboard-agenda-card dashboard-animate dashboard-delay-2">

          <div className="dashboard-card-header">

            <div>

              <span className="dashboard-card-eyebrow">
                Organización
              </span>

              <h2>
                Agenda de hoy
              </h2>

            </div>

            <Link
              to="/agenda"
              className="dashboard-card-link"
            >
              Ver agenda

              <span>
                →
              </span>

            </Link>

          </div>

          {loadingAgenda ? (

            <div className="dashboard-agenda-empty">
              Cargando agenda...
            </div>

          ) : turnosHoy.length ===
          0 ? (

            <div className="dashboard-agenda-empty">

              <div className="dashboard-empty-icon">
                ◷
              </div>

              <strong>
                Día libre
              </strong>

              <span>
                No tenés pacientes
                programados para hoy.
              </span>

            </div>

          ) : (

            <div className="dashboard-agenda-list">

              {turnosHoy
                .slice(
                  0,
                  6
                )
                .map(
                  (
                    turno
                  ) => {
                    const nombres =
                      obtenerNombres(
                        turno.participantes
                      )

                    const pendiente =
                      haySesionPendiente(
                        turno
                      )

                    return (
                      <div
                        key={
                          turno._id
                        }
                        className="dashboard-agenda-row"
                      >

                        {/* HORA */}

                        <div className="dashboard-agenda-time">

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

                        {/* PACIENTES */}

                        <div className="dashboard-agenda-patients">

                          <div className="dashboard-patient-links">

  {(
    turno.participantes ||
    []
  ).map(
    (
      participante,
      index
    ) => {
      const paciente =
        participante.paciente

      const nombrePaciente =
        `${paciente?.nombre || ''} ${
          paciente?.apellido || ''
        }`.trim()

      return (
        <button
          key={
            paciente?._id ||
            index
          }
          type="button"
          className="dashboard-patient-link"
          onClick={() =>
            setPacientePanel(
              paciente
            )
          }
        >
          {nombrePaciente}
        </button>
      )
    }
  )}

</div>

                          <span>
                            {nombres.length ===
                            1
                              ? 'Sesión individual'
                              : `${nombres.length} pacientes`}
                          </span>

                        </div>

                        {/* ACCIÓN */}

                        {pendiente ? (

                          <Link
                            to="/agenda"
                            state={{
                              registrarSesion:
                                turno
                            }}
                            className="dashboard-row-action"
                          >
                            Registrar
                          </Link>

                        ) : (

                          <span className="dashboard-row-done">
                            ✓
                          </span>

                        )}

                      </div>
                    )
                  }
                )}

              {turnosHoy.length >
                6 && (

                <Link
                  to="/agenda"
                  className="dashboard-more-turns"
                >
                  Ver{' '}
                  {
                    turnosHoy.length -
                    6
                  }{' '}
                  más
                </Link>

              )}

            </div>

          )}

        </article>

        {/* =====================
            PRÓXIMO TURNO
        ====================== */}

        <article className="dashboard-bento-card dashboard-next-card dashboard-animate dashboard-delay-3">

          <div className="dashboard-card-header">

            <div>

              <span className="dashboard-card-eyebrow">
                Ahora
              </span>

              <h2>
                Próximo turno
              </h2>

            </div>

            <div className="dashboard-live-dot">

              <span />

              Hoy

            </div>

          </div>

          {proximoTurno ? (

            <>

              <div className="dashboard-next-time">

                <strong>
                  {mostrarHora(
                    proximoTurno.fechaInicio
                  )}
                </strong>

                <span>
                  hasta las{' '}
                  {mostrarHora(
                    proximoTurno.fechaFin
                  )}
                </span>

              </div>

              <div className="dashboard-next-patients">

  {(
    proximoTurno.participantes ||
    []
  ).map(
    (
      participante,
      index
    ) => {
      const paciente =
        participante.paciente

      const nombrePaciente =
        `${paciente?.nombre || ''} ${
          paciente?.apellido || ''
        }`.trim()

      return (
        <button
          key={
            paciente?._id ||
            index
          }
          type="button"
          className="dashboard-next-person"
          onClick={() =>
            setPacientePanel(
              paciente
            )
          }
        >

          <div className="dashboard-next-avatar">

            {paciente?.nombre
              ?.charAt(0)
              ?.toUpperCase()}

          </div>

          <span>
            {nombrePaciente}
          </span>

          <small>
            →
          </small>

        </button>
      )
    }
  )}

</div>
              {haySesionPendiente(
                proximoTurno
              ) && (

                <Link
                  to="/agenda"
                  state={{
                    registrarSesion:
                      proximoTurno
                  }}
                  className="dashboard-next-button"
                >
                  📝 Registrar sesión
                </Link>

              )}

            </>

          ) : (

            <div className="dashboard-next-empty">

              <div>
                ✓
              </div>

              <strong>
                Sin turnos pendientes
              </strong>

              <span>
                No hay más pacientes
                programados para hoy.
              </span>

            </div>

          )}

        </article>

        {/* =====================
            ACCIONES RÁPIDAS
        ====================== */}

        <article className="dashboard-bento-card dashboard-quick-card dashboard-animate dashboard-delay-3">

          <div className="dashboard-card-header">

            <div>

              <span className="dashboard-card-eyebrow">
                Accesos
              </span>

              <h2>
                Acciones rápidas
              </h2>

            </div>

          </div>

          <div className="dashboard-quick-grid">

            {/* REGISTRAR SESIÓN */}

            <Link
              to="/agenda"
              className="dashboard-quick-action primary"
            >

              <span>
                📝
              </span>

              <div>

                <strong>
                  Registrar sesión
                </strong>

                <small>
                  Después de una atención
                </small>

              </div>

            </Link>

            {/* NOTA */}

            <Link
              to="/nota-rapida"
              className="dashboard-quick-action"
            >

              <span>
                ✍️
              </span>

              <div>

                <strong>
                  Nueva nota
                </strong>

                <small>
                  Conversación u observación
                </small>

              </div>

            </Link>

            {/* PACIENTES */}

            <Link
              to="/pacientes"
              className="dashboard-quick-action"
            >

              <span>
                ♡
              </span>

              <div>

                <strong>
                  Pacientes
                </strong>

                <small>
                  Ver fichas clínicas
                </small>

              </div>

            </Link>

            {/* HORARIOS */}

            <Link
              to="/horarios"
              className="dashboard-quick-action"
            >

              <span>
                ◷
              </span>

              <div>

                <strong>
                  Horarios
                </strong>

                <small>
                  Organizar semana
                </small>

              </div>

            </Link>

          </div>

        </article>

        {/* =====================
            PROGRESO DE HOY
        ====================== */}

        <article className="dashboard-bento-card dashboard-progress-card dashboard-animate dashboard-delay-4">

          <div className="dashboard-card-header">

            <div>

              <span className="dashboard-card-eyebrow">
                Jornada
              </span>

              <h2>
                Progreso de hoy
              </h2>

            </div>

          </div>

          <div className="dashboard-progress-main">

            {/* CÍRCULO */}

            <div
              className="dashboard-progress-ring"
              style={{
                '--dashboard-progress':
                  `${porcentajeCompletado}%`
              }}
            >

              <div>

                <strong>

                  <CountUpNumber
                    value={
                      porcentajeCompletado
                    }
                    suffix="%"
                    duration={900}
                  />

                </strong>

                <span>
                  completado
                </span>

              </div>

            </div>

            {/* DETALLES */}

            <div className="dashboard-progress-details">

              <div>

                <span className="dashboard-progress-dot done" />

                <p>
                  Realizadas
                </p>

                <strong>

                  <CountUpNumber
                    value={
                      sesionesRealizadasHoy
                    }
                  />

                </strong>

              </div>

              <div>

                <span className="dashboard-progress-dot pending" />

                <p>
                  Pendientes
                </p>

                <strong>

                  <CountUpNumber
                    value={
                      sesionesPendientesHoy
                    }
                  />

                </strong>

              </div>

            </div>

          </div>

        </article>

      </section>
      {pacientePanel && (
  <PacienteQuickPanel
    pacienteInicial={
      pacientePanel
    }
    horariosSemanales={
      horariosSemanales
    }
    onClose={() =>
      setPacientePanel(
        null
      )
    }
  />
)}

    </main>
  )
}