import { useEffect, useMemo, useState } from 'react'

import api from '../api/api.js'

import CrearTurnoForm from '../components/agenda/CrearTurnoForm.jsx'
import EditarTurnoForm from '../components/agenda/EditarTurnoForm.jsx'
import RegistrarSesionTurnoForm from '../components/agenda/RegistrarSesionTurnoForm.jsx'

import AgendaHoyGrid from '../components/agenda/AgendaHoyGrid.jsx'
import AgendaSemanalGrid from '../components/agenda/AgendaSemanalGrid.jsx'
import AgendaMensualGrid from '../components/agenda/AgendaMensualGrid.jsx'

export default function AgendaPage() {
  const [turnos, setTurnos] = useState([])

  const [
    horariosSemanales,
    setHorariosSemanales
  ] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [vista, setVista] = useState('hoy')

  const [
    mostrarFormulario,
    setMostrarFormulario
  ] = useState(false)

  const [
    turnoEditando,
    setTurnoEditando
  ] = useState(null)

  const [
    turnoRegistrandoSesion,
    setTurnoRegistrandoSesion
  ] = useState(null)

  const [
    turnoSeleccionado,
    setTurnoSeleccionado
  ] = useState(null)

  const [
    cambiandoEstadoId,
    setCambiandoEstadoId
  ] = useState(null)

  useEffect(() => {
    const cargarAgenda = async () => {
      try {
        setLoading(true)
        setError(null)

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
          'Error al cargar agenda:',
          error
        )

        setError(
          error.response?.data?.message ||
          'No se pudo cargar la agenda'
        )
      } finally {
        setLoading(false)
      }
    }

    cargarAgenda()
  }, [])

  const turnosOrdenados = useMemo(() => {
    return [...turnos].sort(
      (a, b) =>
        new Date(a.fechaInicio) -
        new Date(b.fechaInicio)
    )
  }, [turnos])

  const handleTurnoCreado = (
    nuevoTurno
  ) => {
    setTurnos((prev) => [
      ...prev,
      nuevoTurno
    ])

    setMostrarFormulario(false)
  }

  const handleCancelarCreacion = () => {
    setMostrarFormulario(false)
  }

  const asegurarTurnoReal = async (
    turno
  ) => {
    if (!turno.esHorarioFijo) {
      return turno
    }

    const participantes =
      Array.isArray(
        turno.participantes
      )
        ? turno.participantes
            .map(
              (participante) => ({
                paciente:
                  participante
                    .paciente?._id ||
                  participante.paciente,

                estado:
                  participante.estado ||
                  'programado'
              })
            )
            .filter(
              (participante) =>
                participante.paciente
            )
        : []

    if (
      participantes.length === 0
    ) {
      throw new Error(
        'No se pudieron identificar los pacientes del horario'
      )
    }

    const datos = {
      participantes,
      fechaInicio:
        turno.fechaInicio,
      fechaFin:
        turno.fechaFin
    }

    const response =
      await api.post(
        '/turnos',
        datos
      )

    const turnoReal =
      response.data?.data ||
      response.data

    setTurnos((prev) => [
      ...prev,
      turnoReal
    ])

    setTurnoSeleccionado(
      turnoReal
    )

    return turnoReal
  }

  const handleSeleccionarTurno = (
    turno
  ) => {
    setTurnoSeleccionado(
      turno
    )

    setMostrarFormulario(false)
    setTurnoEditando(null)
    setTurnoRegistrandoSesion(null)
  }

  const handleEditarTurno = async (
    turno
  ) => {
    try {
      const turnoReal =
        await asegurarTurnoReal(
          turno
        )

      setTurnoSeleccionado(null)
      setMostrarFormulario(false)
      setTurnoRegistrandoSesion(null)

      setTurnoEditando(
        turnoReal
      )
    } catch (error) {
      console.error(
        'Error al preparar el turno:',
        error
      )

      alert(
        error.response?.data?.message ||
        error.message ||
        'No se pudo preparar el turno para editarlo'
      )
    }
  }

  const handleTurnoActualizado = (
    turnoActualizado
  ) => {
    setTurnos((prev) =>
      prev.map((turno) =>
        turno._id ===
        turnoActualizado._id
          ? {
              ...turno,
              ...turnoActualizado
            }
          : turno
      )
    )

    setTurnoEditando(null)
  }

  const handleCancelarEdicion = () => {
    setTurnoEditando(null)
  }

  const handleRegistrarSesion = async (
    turno,
    participante
  ) => {
    try {
      const turnoReal =
        await asegurarTurnoReal(
          turno
        )

      const pacienteId =
        participante.paciente?._id ||
        participante.paciente

      const participanteReal =
        turnoReal.participantes?.find(
          (item) =>
            (
              item.paciente?._id ||
              item.paciente
            )?.toString() ===
            pacienteId?.toString()
        )

      if (!participanteReal) {
        throw new Error(
          'No se encontró al paciente dentro del turno'
        )
      }

      const turnoParaSesion = {
        ...turnoReal,

        paciente:
          participanteReal.paciente
      }

      setTurnoSeleccionado(null)
      setMostrarFormulario(false)
      setTurnoEditando(null)

      setTurnoRegistrandoSesion(
        turnoParaSesion
      )
    } catch (error) {
      console.error(
        'Error al preparar el turno:',
        error
      )

      alert(
        error.response?.data?.message ||
        error.message ||
        'No se pudo preparar el turno para registrar la sesión'
      )
    }
  }

  const handleSesionCreada = async () => {
    const turno =
      turnoRegistrandoSesion

    if (!turno) {
      setTurnoRegistrandoSesion(
        null
      )

      return
    }

    try {
      const pacienteId =
        turno.paciente?._id ||
        turno.paciente

      const participante =
        turno.participantes?.find(
          (item) =>
            (
              item.paciente?._id ||
              item.paciente
            )?.toString() ===
            pacienteId?.toString()
        )

      if (
        participante &&
        participante.estado !==
          'realizado'
      ) {
        const response =
          await api.patch(
            `/turnos/${turno._id}/status`,
            {
              pacienteId,
              estado: 'realizado'
            }
          )

        const turnoActualizado =
          response.data?.data ||
          response.data

        setTurnos((prev) =>
          prev.map((item) =>
            item._id ===
            turno._id
              ? turnoActualizado
              : item
          )
        )
      }
    } catch (error) {
      console.error(
        'La sesión se guardó, pero no se pudo marcar al paciente como realizado:',
        error
      )

      alert(
        'La sesión se guardó, pero no se pudo actualizar el estado del paciente.'
      )
    } finally {
      setTurnoRegistrandoSesion(
        null
      )
    }
  }

  const handleCancelarSesion = () => {
    setTurnoRegistrandoSesion(
      null
    )
  }

  const handleCambiarEstado = async (
    turno,
    participante,
    nuevoEstado
  ) => {
    const nombresEstados = {
      programado: 'Programado',
      realizado: 'Realizado',
      cancelado: 'Cancelado',
      no_asistio: 'No asistió'
    }

    const paciente =
      participante.paciente

    const nombrePaciente =
      `${paciente?.nombre || ''} ${
        paciente?.apellido || ''
      }`.trim() ||
      'este paciente'

    const confirmado =
      window.confirm(
        `¿Querés cambiar a ${nombrePaciente} a "${nombresEstados[nuevoEstado]}"?`
      )

    if (!confirmado) {
      return
    }

    try {
      const turnoReal =
        await asegurarTurnoReal(
          turno
        )

      const pacienteId =
        paciente?._id ||
        paciente

      setCambiandoEstadoId(
        `${turnoReal._id}-${pacienteId}`
      )

      const response =
        await api.patch(
          `/turnos/${turnoReal._id}/status`,
          {
            pacienteId,
            estado:
              nuevoEstado
          }
        )

      const turnoActualizado =
        response.data?.data ||
        response.data

      setTurnos((prev) =>
        prev.map((item) =>
          item._id ===
          turnoReal._id
            ? turnoActualizado
            : item
        )
      )

      setTurnoSeleccionado(
        turnoActualizado
      )
    } catch (error) {
      console.error(
        'Error al cambiar estado:',
        error
      )

      alert(
        error.response?.data?.message ||
        error.message ||
        'No se pudo cambiar el estado'
      )
    } finally {
      setCambiandoEstadoId(
        null
      )
    }
  }

  const mostrarEstado = (
    estado
  ) => {
    const estados = {
      programado:
        'Programado',

      realizado:
        'Realizado',

      cancelado:
        'Cancelado',

      no_asistio:
        'No asistió'
    }

    return (
      estados[estado] ||
      estado
    )
  }

  const mostrarHora = (
    fecha
  ) => {
    if (!fecha) {
      return 'Sin hora'
    }

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

  const mostrarFecha = (
    fecha
  ) => {
    if (!fecha) {
      return 'Sin fecha'
    }

    const texto =
      new Date(
        fecha
      ).toLocaleDateString(
        'es-UY',
        {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }
      )

    return (
      texto.charAt(0).toUpperCase() +
      texto.slice(1)
    )
  }

  const cambiarVista = (
    nuevaVista
  ) => {
    setVista(nuevaVista)

    setTurnoSeleccionado(null)
    setMostrarFormulario(false)
    setTurnoEditando(null)
    setTurnoRegistrandoSesion(null)
  }

  if (loading) {
    return (
      <main className="agenda-page">
        <h1>
          Agenda
        </h1>

        <p>
          Cargando agenda...
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="agenda-page">
        <h1>
          Agenda
        </h1>

        <p>
          {error}
        </p>
      </main>
    )
  }

  return (
    <main className="agenda-page">

      {/* HEADER */}

      <div className="agenda-header">
        <div>
          <h1>
            Agenda
          </h1>

          <p>
            Gestioná tus turnos,
            pacientes y sesiones.
          </p>
        </div>

        {!mostrarFormulario &&
          !turnoEditando &&
          !turnoRegistrandoSesion && (
            <button
              type="button"
              className="agenda-new-button"
              onClick={() => {
                setTurnoSeleccionado(
                  null
                )

                setMostrarFormulario(
                  true
                )
              }}
            >
              + Nuevo turno
            </button>
          )}
      </div>

      {/* VISTAS */}

      <div className="agenda-view-tabs">

        <button
          type="button"
          className={
            vista === 'hoy'
              ? 'agenda-view-tab active'
              : 'agenda-view-tab'
          }
          onClick={() =>
            cambiarVista(
              'hoy'
            )
          }
        >
          Hoy
        </button>

        <button
          type="button"
          className={
            vista === 'semana'
              ? 'agenda-view-tab active'
              : 'agenda-view-tab'
          }
          onClick={() =>
            cambiarVista(
              'semana'
            )
          }
        >
          Semana
        </button>

        <button
          type="button"
          className={
            vista === 'mes'
              ? 'agenda-view-tab active'
              : 'agenda-view-tab'
          }
          onClick={() =>
            cambiarVista(
              'mes'
            )
          }
        >
          Mes
        </button>

      </div>

      {/* CREAR TURNO */}

      {mostrarFormulario && (
        <div className="card">
          <CrearTurnoForm
            onCreated={
              handleTurnoCreado
            }
            onCancel={
              handleCancelarCreacion
            }
          />
        </div>
      )}

      {/* EDITAR TURNO */}

      {turnoEditando && (
        <div className="card">
          <EditarTurnoForm
            turno={
              turnoEditando
            }
            onUpdated={
              handleTurnoActualizado
            }
            onCancel={
              handleCancelarEdicion
            }
          />
        </div>
      )}

      {/* REGISTRAR SESIÓN */}

      {turnoRegistrandoSesion && (
        <div
          className="agenda-modal-backdrop"
          onClick={
            handleCancelarSesion
          }
        >
          <div
            className="agenda-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="agenda-modal-header">
              <h2>
                Registrar sesión
              </h2>

              <button
                type="button"
                className="agenda-modal-close"
                onClick={
                  handleCancelarSesion
                }
              >
                ×
              </button>
            </div>

            <RegistrarSesionTurnoForm
              turno={
                turnoRegistrandoSesion
              }
              onCreated={
                handleSesionCreada
              }
              onCancel={
                handleCancelarSesion
              }
            />
          </div>
        </div>
      )}

      {/* CONTENIDO DE LA AGENDA */}

      <section className="card">

        {/* HOY */}

        {vista === 'hoy' && (
          <AgendaHoyGrid
            turnos={
              turnosOrdenados
            }
            horariosSemanales={
              horariosSemanales
            }
            onTurnoClick={
              handleSeleccionarTurno
            }
          />
        )}

        {/* SEMANA */}

        {vista === 'semana' && (
          <AgendaSemanalGrid
            turnos={
              turnosOrdenados
            }
            horariosSemanales={
              horariosSemanales
            }
            onTurnoClick={
              handleSeleccionarTurno
            }
          />
        )}

        {/* MES */}

        {vista === 'mes' && (
          <AgendaMensualGrid
            turnos={
              turnosOrdenados
            }
            horariosSemanales={
              horariosSemanales
            }
            onTurnoClick={
              handleSeleccionarTurno
            }
          />
        )}

      </section>

      {/* MODAL DETALLE TURNO */}

      {turnoSeleccionado && (
        <div
          className="agenda-modal-backdrop"
          onClick={() =>
            setTurnoSeleccionado(
              null
            )
          }
        >
          <section
            className="agenda-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CABECERA MODAL */}

            <div className="agenda-modal-header">

              <div>
                <h2>
                  Detalle del turno
                </h2>

                {turnoSeleccionado
                  .esHorarioFijo && (
                  <small>
                    Horario fijo semanal
                  </small>
                )}
              </div>

              <button
                type="button"
                className="agenda-modal-close"
                onClick={() =>
                  setTurnoSeleccionado(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            {/* FECHA + HORARIO */}

            <div className="agenda-turn-info">

              <div className="agenda-info-box">
                <span className="agenda-info-label">
                  Fecha
                </span>

                <span className="agenda-info-value">
                  {mostrarFecha(
                    turnoSeleccionado
                      .fechaInicio
                  )}
                </span>
              </div>

              <div className="agenda-info-box">
                <span className="agenda-info-label">
                  Horario
                </span>

                <span className="agenda-info-value">
                  {mostrarHora(
                    turnoSeleccionado
                      .fechaInicio
                  )}

                  {' - '}

                  {mostrarHora(
                    turnoSeleccionado
                      .fechaFin
                  )}
                </span>
              </div>

            </div>

            {/* OBSERVACIÓN */}

            {turnoSeleccionado
              .observacion && (
              <div
                className="agenda-info-box"
                style={{
                  marginBottom:
                    '20px'
                }}
              >
                <span className="agenda-info-label">
                  Observación
                </span>

                <span className="agenda-info-value">
                  {
                    turnoSeleccionado
                      .observacion
                  }
                </span>
              </div>
            )}

            {/* PACIENTES */}

            <h3 className="agenda-patients-title">
              Pacientes
            </h3>

            <div className="agenda-patient-list">

              {(
                turnoSeleccionado
                  .participantes ||
                []
              ).map(
                (
                  participante,
                  index
                ) => {
                  const paciente =
                    participante.paciente

                  const pacienteId =
                    paciente?._id ||
                    paciente

                  const idCambio =
                    `${turnoSeleccionado._id}-${pacienteId}`

                  return (
                    <article
                      key={
                        pacienteId ||
                        index
                      }
                      className="agenda-patient-card"
                    >

                      {/* NOMBRE + ESTADO */}

                      <div className="agenda-patient-top">

                        <div className="agenda-patient-name">
                          {
                            paciente
                              ?.nombre
                          }{' '}

                          {
                            paciente
                              ?.apellido
                          }
                        </div>

                        <span
                          className={
                            `agenda-status ${participante.estado}`
                          }
                        >
                          {mostrarEstado(
                            participante.estado
                          )}
                        </span>

                      </div>

                      {/* REGISTRAR SESIÓN */}

                      <button
                        type="button"
                        className="agenda-register-session"
                        onClick={() =>
                          handleRegistrarSesion(
                            turnoSeleccionado,
                            participante
                          )
                        }
                      >
                        📝 Registrar sesión
                      </button>

                      {/* ACCIONES */}

                      <div className="agenda-secondary-actions">

                        {participante.estado !==
                          'realizado' && (
                          <button
                            type="button"
                            className="agenda-action-button agenda-action-success"
                            disabled={
                              cambiandoEstadoId ===
                              idCambio
                            }
                            onClick={() =>
                              handleCambiarEstado(
                                turnoSeleccionado,
                                participante,
                                'realizado'
                              )
                            }
                          >
                            ✓ Realizado
                          </button>
                        )}

                        {participante.estado !==
                          'no_asistio' && (
                          <button
                            type="button"
                            className="agenda-action-button"
                            disabled={
                              cambiandoEstadoId ===
                              idCambio
                            }
                            onClick={() =>
                              handleCambiarEstado(
                                turnoSeleccionado,
                                participante,
                                'no_asistio'
                              )
                            }
                          >
                            No asistió
                          </button>
                        )}

                        {participante.estado !==
                          'cancelado' && (
                          <button
                            type="button"
                            className="agenda-action-button agenda-action-danger"
                            disabled={
                              cambiandoEstadoId ===
                              idCambio
                            }
                            onClick={() =>
                              handleCambiarEstado(
                                turnoSeleccionado,
                                participante,
                                'cancelado'
                              )
                            }
                          >
                            Cancelar
                          </button>
                        )}

                        {participante.estado !==
                          'programado' && (
                          <button
                            type="button"
                            className="agenda-action-button"
                            disabled={
                              cambiandoEstadoId ===
                              idCambio
                            }
                            onClick={() =>
                              handleCambiarEstado(
                                turnoSeleccionado,
                                participante,
                                'programado'
                              )
                            }
                          >
                            Volver a programado
                          </button>
                        )}

                      </div>

                    </article>
                  )
                }
              )}

            </div>

            {/* FOOTER */}

            <div className="agenda-modal-footer">

              <button
                type="button"
                className="agenda-edit-button"
                onClick={() =>
                  handleEditarTurno(
                    turnoSeleccionado
                  )
                }
              >
                Editar turno
              </button>

              <button
                type="button"
                className="agenda-close-button"
                onClick={() =>
                  setTurnoSeleccionado(
                    null
                  )
                }
              >
                Cerrar
              </button>

            </div>

          </section>
        </div>
      )}

    </main>
  )
}