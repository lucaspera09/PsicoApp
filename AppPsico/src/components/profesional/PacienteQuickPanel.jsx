import {
  useEffect,
  useMemo,
  useState
} from 'react'

import { Link } from 'react-router'

import api from '../../api/api.js'

export default function PacienteQuickPanel({
  pacienteInicial,
  horariosSemanales = [],
  onClose
}) {
  /*
    ========================================
    ESTADOS
    ========================================
  */

  const [
    paciente,
    setPaciente
  ] = useState(
    pacienteInicial || null
  )

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    ultimaSesion,
    setUltimaSesion
  ] = useState(null)

  const [
    ultimaNota,
    setUltimaNota
  ] = useState(null)

  /*
    ========================================
    CARGAR PACIENTE + SESIONES + NOTAS
    ========================================
  */

  useEffect(() => {
    const cargarDatosPaciente =
      async () => {
        const pacienteId =
          pacienteInicial?._id ||
          pacienteInicial

        if (!pacienteId) {
          setLoading(false)
          return
        }

        try {
          setLoading(true)

          const [
            responsePaciente,
            responseSesiones,
            responseNotas
          ] = await Promise.all([
            api.get(
              `/pacientes/${pacienteId}`
            ),

            api.get(
              `/sesiones/paciente/${pacienteId}`
            ),

            api.get(
              `/notas/paciente/${pacienteId}`
            )
          ])

          const pacienteRecibido =
            responsePaciente.data?.data ||
            responsePaciente.data

          const sesionesRecibidas =
            responseSesiones.data?.data ||
            responseSesiones.data

          const notasRecibidas =
            responseNotas.data?.data ||
            responseNotas.data

          setPaciente(
            pacienteRecibido
          )

          /*
            ========================================
            ÚLTIMA SESIÓN
            ========================================
          */

          if (
            Array.isArray(
              sesionesRecibidas
            ) &&
            sesionesRecibidas.length > 0
          ) {
            const sesionesOrdenadas =
              [...sesionesRecibidas].sort(
                (a, b) =>
                  new Date(
                    b.fecha ||
                    b.createdAt
                  ) -
                  new Date(
                    a.fecha ||
                    a.createdAt
                  )
              )

            setUltimaSesion(
              sesionesOrdenadas[0]
            )
          } else {
            setUltimaSesion(null)
          }

          /*
            ========================================
            ÚLTIMA NOTA
            ========================================
          */

          if (
            Array.isArray(
              notasRecibidas
            ) &&
            notasRecibidas.length > 0
          ) {
            const notasOrdenadas =
              [...notasRecibidas].sort(
                (a, b) =>
                  new Date(
                    b.fecha ||
                    b.createdAt
                  ) -
                  new Date(
                    a.fecha ||
                    a.createdAt
                  )
              )

            setUltimaNota(
              notasOrdenadas[0]
            )
          } else {
            setUltimaNota(null)
          }

        } catch (error) {
          console.error(
            'Error al cargar datos del paciente:',
            error
          )

          /*
            Si falla alguna consulta,
            mantenemos al menos
            los datos del dashboard.
          */

          setPaciente(
            pacienteInicial
          )

          setUltimaSesion(null)
          setUltimaNota(null)

        } finally {
          setLoading(false)
        }
      }

    cargarDatosPaciente()

  }, [
    pacienteInicial
  ])

  /*
    ========================================
    CERRAR CON ESCAPE
    ========================================
  */

  useEffect(() => {
    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        onClose?.()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )

  }, [
    onClose
  ])

  /*
    ========================================
    OBTENER ID
    ========================================
  */

  const obtenerId = (
    item
  ) => {
    return (
      item?._id ||
      item
    )?.toString()
  }

  /*
    ========================================
    HORARIO DEL PACIENTE
    ========================================
  */

  const horarioPaciente =
    useMemo(() => {
      const pacienteId =
        obtenerId(
          pacienteInicial
        )

      if (!pacienteId) {
        return null
      }

      const horarios =
        horariosSemanales
          .filter(
            (horario) => {
              if (
                horario.activo ===
                false
              ) {
                return false
              }

              const pacientes =
                Array.isArray(
                  horario.pacientes
                )
                  ? horario.pacientes
                  : horario.paciente
                  ? [
                      horario.paciente
                    ]
                  : []

              return pacientes.some(
                (
                  item
                ) =>
                  obtenerId(
                    item
                  ) ===
                  pacienteId
              )
            }
          )
          .sort(
            (a, b) => {
              const orden = [
                1,
                2,
                3,
                4,
                5,
                6,
                0
              ]

              const diferenciaDia =
                orden.indexOf(
                  a.diaSemana
                ) -
                orden.indexOf(
                  b.diaSemana
                )

              if (
                diferenciaDia !==
                0
              ) {
                return diferenciaDia
              }

              return (
                a.horaInicio ||
                ''
              ).localeCompare(
                b.horaInicio ||
                ''
              )
            }
          )

      return (
        horarios[0] ||
        null
      )

    }, [
      horariosSemanales,
      pacienteInicial
    ])

  /*
    ========================================
    DÍAS
    ========================================
  */

  const dias = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  }

  /*
    ========================================
    PRÓXIMA ATENCIÓN
    ========================================
  */

  const obtenerProximaAtencion = (
    horario
  ) => {
    if (!horario) {
      return null
    }

    const ahora =
      new Date()

    const diaActual =
      ahora.getDay()

    let diasHasta =
      horario.diaSemana -
      diaActual

    if (diasHasta < 0) {
      diasHasta += 7
    }

    if (diasHasta === 0) {
      const [
        hora,
        minutos
      ] =
        horario.horaInicio
          .split(':')
          .map(Number)

      const fechaHorario =
        new Date()

      fechaHorario.setHours(
        hora,
        minutos,
        0,
        0
      )

      if (
        fechaHorario <
        ahora
      ) {
        diasHasta = 7
      }
    }

    const proximaFecha =
      new Date()

    proximaFecha.setDate(
      ahora.getDate() +
      diasHasta
    )

    return {
      fecha:
        proximaFecha,

      dia:
        dias[
          horario.diaSemana
        ],

      horaInicio:
        horario.horaInicio,

      horaFin:
        horario.horaFin
    }
  }

  /*
    ========================================
    EDAD
    ========================================
  */

  const calcularEdad = (
    fechaNacimiento
  ) => {
    if (!fechaNacimiento) {
      return null
    }

    const fechaString =
      fechaNacimiento
        .toString()
        .slice(
          0,
          10
        )

    const [
      year,
      month,
      day
    ] =
      fechaString
        .split('-')
        .map(Number)

    const hoy =
      new Date()

    let edad =
      hoy.getFullYear() -
      year

    const mesActual =
      hoy.getMonth() + 1

    if (
      mesActual < month ||
      (
        mesActual ===
          month &&
        hoy.getDate() <
          day
      )
    ) {
      edad--
    }

    return edad
  }

  /*
    ========================================
    TIPO DE NOTA
    ========================================
  */

  const mostrarTipoNota = (
    tipo
  ) => {
    const tipos = {
      entrevista: 'Entrevista',
      llamada: 'Llamada',
      comentario_padres:
        'Comentario de padres',
      reunion: 'Reunión',
      observacion: 'Observación',
      otro: 'Otro'
    }

    return (
      tipos[tipo] ||
      tipo ||
      'Nota'
    )
  }

  /*
    ========================================
    SI NO HAY PACIENTE
    ========================================
  */

  if (!pacienteInicial) {
    return null
  }

  /*
    ========================================
    DATOS DERIVADOS
    ========================================
  */

  const nombreCompleto =
    `${paciente?.nombre || ''} ${
      paciente?.apellido || ''
    }`.trim()

  const iniciales =
    `${paciente?.nombre
      ?.charAt(0) || ''}${
      paciente?.apellido
        ?.charAt(0) || ''
    }`
      .toUpperCase()

  const edad =
    calcularEdad(
      paciente?.fechaNacimiento
    )

  const proximaAtencion =
    obtenerProximaAtencion(
      horarioPaciente
    )

  const pacienteId =
    paciente?._id ||
    pacienteInicial?._id ||
    pacienteInicial

  /*
    ========================================
    RENDER
    ========================================
  */

  return (
    <div
      className="patient-quick-backdrop"
      onClick={onClose}
    >

      <aside
        className="patient-quick-panel"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* =====================
            TOP
        ====================== */}

        <div className="patient-quick-top">

          <span className="patient-quick-label">
            Paciente
          </span>

          <button
            type="button"
            className="patient-quick-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>

        {loading ? (

          <div className="patient-quick-loading">
            Cargando paciente...
          </div>

        ) : (

          <>

            {/* =====================
                PERFIL
            ====================== */}

            <div className="patient-quick-profile">

              <div className="patient-quick-avatar">
                {iniciales}
              </div>

              <h2>
                {nombreCompleto}
              </h2>

              <span
                className={
                  paciente?.activo ===
                  false
                    ? 'patient-quick-status inactive'
                    : 'patient-quick-status active'
                }
              >
                {paciente?.activo ===
                false
                  ? 'Inactivo'
                  : 'Activo'}
              </span>
{horarioPaciente && (
  <p className="patient-quick-profile-schedule">
    {
      dias[
        horarioPaciente.diaSemana
      ]
    }
    {' · '}
    {
      horarioPaciente.horaInicio
    }
  </p>
)}
            </div>

            {/* =====================
                DATOS RÁPIDOS
            ====================== */}

            <div className="patient-quick-stats">

              <div>

                <span>
                  Edad
                </span>

                <strong>
                  {edad !== null
                    ? `${edad} años`
                    : '—'}
                </strong>

              </div>

              <div>

                <span>
                  Documento
                </span>

                <strong>
                  {paciente?.documento ||
                    '—'}
                </strong>

              </div>

            </div>

            {/* =====================
                HORARIO
            ====================== */}

            <section className="patient-quick-section">

              <div className="patient-quick-section-title">

                <span>
                  ◷
                </span>

                <div>

                  <small>
                    Organización
                  </small>

                  <strong>
                    Horario semanal
                  </strong>

                </div>

              </div>

              {horarioPaciente ? (

                <>

                  <div className="patient-quick-schedule">

                    <strong>
                      {
                        dias[
                          horarioPaciente
                            .diaSemana
                        ]
                      }
                    </strong>

                    <span>
                      {
                        horarioPaciente
                          .horaInicio
                      }

                      {' – '}

                      {
                        horarioPaciente
                          .horaFin
                      }
                    </span>

                  </div>

                  {proximaAtencion && (

                    <div className="patient-quick-next">

                      <small>
                        Próxima atención
                      </small>

                      <strong>
                        {
                          proximaAtencion
                            .dia
                        }

                        {' · '}

                        {
                          proximaAtencion
                            .horaInicio
                        }
                      </strong>

                    </div>

                  )}

                </>

              ) : (

                <div className="patient-quick-empty">
                  Sin horario configurado
                </div>

              )}

            </section>

            {/* =====================
                INFORMACIÓN IMPORTANTE
            ====================== */}

            <section className="patient-quick-section">

              <div className="patient-quick-section-title">

                <span>
                  !
                </span>

                <div>

                  <small>
                    Clínica
                  </small>

                  <strong>
                    Información importante
                  </strong>

                </div>

              </div>

              <div className="patient-quick-important">

                <div>

                  <span>
                    Alergias
                  </span>

                  <strong>
                    {Array.isArray(
                      paciente?.alergias
                    ) &&
                    paciente
                      .alergias
                      .length > 0
                      ? paciente
                          .alergias
                          .join(', ')
                      : 'Ninguna registrada'}
                  </strong>

                </div>

                <div>

                  <span>
                    Medicamentos
                  </span>

                  <strong>
                    {Array.isArray(
                      paciente?.medicamentos
                    ) &&
                    paciente
                      .medicamentos
                      .length > 0
                      ? paciente
                          .medicamentos
                          .join(', ')
                      : 'Ninguno registrado'}
                  </strong>

                </div>

              </div>

            </section>

            {/* =====================
                ÚLTIMA SESIÓN
            ====================== */}

            <section className="patient-quick-section">

              <div className="patient-quick-section-title">

                <span>
                  📝
                </span>

                <div>

                  <small>
                    Seguimiento
                  </small>

                  <strong>
                    Última sesión
                  </strong>

                </div>

              </div>

              {ultimaSesion ? (

                <Link
  to={`/pacientes/${pacienteId}`}
  state={{
    tab: 'sesiones'
  }}
  className="patient-quick-last-session patient-quick-clickable"
>

                  <div className="patient-quick-last-session-top">

                    <strong>
                      {new Date(
                        ultimaSesion.fecha ||
                        ultimaSesion.createdAt
                      ).toLocaleDateString(
                        'es-UY',
                        {
                          day:
                            '2-digit',

                          month:
                            '2-digit',

                          year:
                            'numeric'
                        }
                      )}
                    </strong>

                    <span>
                      Sesión registrada
                    </span>

                  </div>

                  <p>
                    {ultimaSesion.resumen ||
                      ultimaSesion.observaciones ||
                      ultimaSesion.descripcion ||
                      'Sin resumen disponible.'}
                  </p>

                </Link>

              ) : (

                <div className="patient-quick-empty">
                  Todavía no hay sesiones registradas
                </div>

              )}

            </section>

            {/* =====================
                ÚLTIMA NOTA
            ====================== */}

            <section className="patient-quick-section">

              <div className="patient-quick-section-title">

                <span>
                  ✎
                </span>

                <div>

                  <small>
                    Seguimiento
                  </small>

                  <strong>
                    Última nota
                  </strong>

                </div>

              </div>

              {ultimaNota ? (

                <Link
  to={`/pacientes/${pacienteId}`}
  state={{
    tab: 'notas'
  }}
  className="patient-quick-last-note patient-quick-clickable"
>

                  <div className="patient-quick-last-note-top">

                    <div>

                      <span className="patient-quick-note-type">
                        {mostrarTipoNota(
                          ultimaNota.tipo
                        )}
                      </span>

                      <strong>
                        {ultimaNota.titulo ||
                          'Sin título'}
                      </strong>

                    </div>

                    <small>
                      {new Date(
                        ultimaNota.fecha ||
                        ultimaNota.createdAt
                      ).toLocaleDateString(
                        'es-UY',
                        {
                          day:
                            '2-digit',

                          month:
                            '2-digit',

                          year:
                            'numeric'
                        }
                      )}
                    </small>

                  </div>

                  <p>
                    {ultimaNota.contenido ||
                      'Sin contenido'}
                  </p>

                </Link>

              ) : (

                <div className="patient-quick-empty">
                  Todavía no hay notas registradas
                </div>

              )}

            </section>

            {/* =====================
                ACCIONES
            ====================== */}

            <div className="patient-quick-actions">

              <Link
                to={`/pacientes/${pacienteId}`}
                className="patient-quick-main-button"
              >
                Ver ficha completa
              </Link>

              <div className="patient-quick-action-grid">

                <Link
                  to="/agenda"
                  state={{
                    pacienteSesionId:
                      pacienteId
                  }}
                  className="patient-quick-action"
                >
                  <span>
                    📝
                  </span>

                  Registrar sesión
                </Link>

                <Link
                  to="/nota-rapida"
                  state={{
                    pacienteInicial:
                      paciente
                  }}
                  className="patient-quick-action"
                >
                  <span>
                    ✍️
                  </span>

                  Nueva nota
                </Link>

              </div>

            </div>

          </>

        )}

      </aside>

    </div>
  )
}