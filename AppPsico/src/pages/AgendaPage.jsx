import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  Link,
  useLocation,
  useNavigate
} from 'react-router'

import api from '../api/api.js'

import RegistrarSesionTurnoForm from '../components/agenda/RegistrarSesionTurnoForm.jsx'

import AgendaHoyGrid from '../components/agenda/AgendaHoyGrid.jsx'
import AgendaSemanalGrid from '../components/agenda/AgendaSemanalGrid.jsx'
import AgendaMensualGrid from '../components/agenda/AgendaMensualGrid.jsx'

export default function AgendaPage() {
  const location =
    useLocation()

  const navigate =
    useNavigate()

  const accesoRapidoProcesado =
    useRef(false)

  const [
    turnos,
    setTurnos
  ] = useState([])

  const [
    horariosSemanales,
    setHorariosSemanales
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
    vista,
    setVista
  ] = useState('hoy')

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

  const [
    quitandoPacienteId,
    setQuitandoPacienteId
  ] = useState(null)

  /*
    ========================================
    CARGAR AGENDA
    ========================================
  */

  useEffect(() => {
    const cargarAgenda =
      async () => {
        try {
          setLoading(true)
          setError(null)

          const [
            responseTurnos,
            responseHorarios
          ] = await Promise.all([
            api.get('/turnos'),

            api.get(
              '/horarios-semanales'
            )
          ])

          const turnosRecibidos =
            responseTurnos.data?.data ||
            responseTurnos.data

          const horariosRecibidos =
            responseHorarios.data?.data ||
            responseHorarios.data

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

  /*
    ========================================
    ORDENAR TURNOS REALES
    ========================================
  */

  const turnosOrdenados =
    useMemo(() => {
      return [...turnos].sort(
        (a, b) =>
          new Date(
            a.fechaInicio
          ) -
          new Date(
            b.fechaInicio
          )
      )
    }, [turnos])

  /*
    ========================================
    CONVERTIR HORARIO FIJO
    EN TURNO REAL
    ========================================
  */

  const asegurarTurnoReal =
    async (turno) => {
      if (
        !turno.esHorarioFijo
      ) {
        return turno
      }

      const participantes =
        Array.isArray(
          turno.participantes
        )
          ? turno.participantes
              .map(
                (
                  participante
                ) => ({
                  paciente:
                    participante
                      .paciente?._id ||
                    participante
                      .paciente,

                  estado:
                    participante
                      .estado ||
                    'programado'
                })
              )
              .filter(
                (
                  participante
                ) =>
                  participante
                    .paciente
              )
          : []

      if (
        participantes.length ===
        0
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

      setTurnos(
        (prev) => [
          ...prev,
          turnoReal
        ]
      )

      setTurnoSeleccionado(
        turnoReal
      )

      return turnoReal
    }

  /*
    ========================================
    SELECCIONAR HORARIO
    ========================================
  */

  const handleSeleccionarTurno = (
    turno
  ) => {
    setTurnoSeleccionado(
      turno
    )

    setTurnoRegistrandoSesion(
      null
    )
  }

  /*
    ========================================
    REGISTRAR SESIÓN
    ========================================
  */

  const handleRegistrarSesion =
    async (
      turno,
      participante
    ) => {
      try {
        const turnoReal =
          await asegurarTurnoReal(
            turno
          )

        const pacienteId =
          participante
            .paciente?._id ||
          participante.paciente

        const participanteReal =
          turnoReal.participantes
            ?.find(
              (item) =>
                (
                  item
                    .paciente?._id ||
                  item.paciente
                )?.toString() ===
                pacienteId
                  ?.toString()
            )

        if (
          !participanteReal
        ) {
          throw new Error(
            'No se encontró al paciente dentro del horario'
          )
        }

        const turnoParaSesion = {
          ...turnoReal,

          paciente:
            participanteReal
              .paciente
        }

        setTurnoSeleccionado(
          null
        )

        setTurnoRegistrandoSesion(
          turnoParaSesion
        )

      } catch (error) {
        console.error(
          'Error al preparar el horario:',
          error
        )

        alert(
          error.response?.data?.message ||
          error.message ||
          'No se pudo preparar el horario para registrar la sesión'
        )
      }
    }

  /*
    ========================================
    ACCESO RÁPIDO
    ========================================
  */

  useEffect(() => {
    if (
      loading ||
      accesoRapidoProcesado.current
    ) {
      return
    }

    const turnoRecibido =
      location.state
        ?.registrarSesion

    const pacienteSesionId =
      location.state
        ?.pacienteSesionId

    if (
      !turnoRecibido &&
      !pacienteSesionId
    ) {
      return
    }

    accesoRapidoProcesado.current =
      true

    const limpiarNavegacion =
      () => {
        navigate(
          '/agenda',
          {
            replace: true,
            state: null
          }
        )
      }

    const obtenerPacienteId = (
      paciente
    ) => {
      return (
        paciente?._id ||
        paciente
      )?.toString()
    }

    const buscarParticipante = (
      turno,
      pacienteId = null
    ) => {
      const participantes =
        turno.participantes ||
        []

      if (pacienteId) {
        return participantes.find(
          (
            participante
          ) =>
            obtenerPacienteId(
              participante.paciente
            ) ===
            pacienteId.toString()
        )
      }

      return (
        participantes.find(
          (
            participante
          ) =>
            participante.estado ===
            'programado'
        ) ||
        participantes[0]
      )
    }

    const esHoy = (
      fecha
    ) => {
      const fechaTurno =
        new Date(fecha)

      const hoy =
        new Date()

      return (
        fechaTurno.getFullYear() ===
          hoy.getFullYear() &&
        fechaTurno.getMonth() ===
          hoy.getMonth() &&
        fechaTurno.getDate() ===
          hoy.getDate()
      )
    }

    const abrirDesdeTurno =
      async (
        turno,
        pacienteId = null
      ) => {
        const participante =
          buscarParticipante(
            turno,
            pacienteId
          )

        if (!participante) {
          alert(
            'No se encontró al paciente dentro del horario.'
          )

          limpiarNavegacion()

          return
        }

        await handleRegistrarSesion(
          turno,
          participante
        )

        limpiarNavegacion()
      }

    const buscarHorarioPacienteHoy =
      async () => {
        const turnoReal =
          turnos.find(
            (turno) => {
              if (
                !turno.fechaInicio ||
                !esHoy(
                  turno.fechaInicio
                )
              ) {
                return false
              }

              return (
                turno.participantes ||
                []
              ).some(
                (
                  participante
                ) =>
                  obtenerPacienteId(
                    participante
                      .paciente
                  ) ===
                  pacienteSesionId
                    .toString()
              )
            }
          )

        if (turnoReal) {
          await abrirDesdeTurno(
            turnoReal,
            pacienteSesionId
          )

          return
        }

        const hoy =
          new Date()

        hoy.setHours(
          0,
          0,
          0,
          0
        )

        const horario =
          horariosSemanales.find(
            (item) => {
              if (!item.activo) {
                return false
              }

              if (
                item.diaSemana !==
                hoy.getDay()
              ) {
                return false
              }

              if (
                item.fechaDesde
              ) {
                const desde =
                  new Date(
                    item.fechaDesde
                  )

                desde.setHours(
                  0,
                  0,
                  0,
                  0
                )

                if (
                  hoy < desde
                ) {
                  return false
                }
              }

              if (
                item.fechaHasta
              ) {
                const hasta =
                  new Date(
                    item.fechaHasta
                  )

                hasta.setHours(
                  23,
                  59,
                  59,
                  999
                )

                if (
                  hoy > hasta
                ) {
                  return false
                }
              }

              const pacientes =
                Array.isArray(
                  item.pacientes
                )
                  ? item.pacientes
                  : item.paciente
                  ? [
                      item.paciente
                    ]
                  : []

              return pacientes.some(
                (
                  paciente
                ) =>
                  obtenerPacienteId(
                    paciente
                  ) ===
                  pacienteSesionId
                    .toString()
              )
            }
          )

        if (horario) {
          const [
            horaInicio,
            minutoInicio
          ] =
            horario.horaInicio
              .split(':')
              .map(Number)

          const [
            horaFin,
            minutoFin
          ] =
            horario.horaFin
              .split(':')
              .map(Number)

          const fechaInicio =
            new Date()

          fechaInicio.setHours(
            horaInicio,
            minutoInicio,
            0,
            0
          )

          const fechaFin =
            new Date()

          fechaFin.setHours(
            horaFin,
            minutoFin,
            0,
            0
          )

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

          const turnoVirtual = {
            _id:
              `horario-${horario._id}-${hoy
                .toISOString()
                .slice(0, 10)}`,

            horarioSemanalId:
              horario._id,

            esHorarioFijo:
              true,

            fechaInicio:
              fechaInicio
                .toISOString(),

            fechaFin:
              fechaFin
                .toISOString(),

            participantes:
              pacientes.map(
                (
                  paciente
                ) => ({
                  paciente,

                  estado:
                    'programado'
                })
              )
          }

          await abrirDesdeTurno(
            turnoVirtual,
            pacienteSesionId
          )

          return
        }

        alert(
          'Este paciente no tiene un horario programado para hoy.'
        )

        limpiarNavegacion()
      }

    const ejecutar =
      async () => {
        try {
          if (turnoRecibido) {
            await abrirDesdeTurno(
              turnoRecibido
            )

            return
          }

          if (
            pacienteSesionId
          ) {
            await buscarHorarioPacienteHoy()
          }

        } catch (error) {
          console.error(
            'Error al abrir el registro rápido:',
            error
          )

          alert(
            error.response?.data?.message ||
            error.message ||
            'No se pudo abrir el registro de la sesión'
          )

          limpiarNavegacion()
        }
      }

    ejecutar()

  }, [
    loading,
    location.state,
    navigate,
    turnos,
    horariosSemanales
  ])

  /*
    ========================================
    REGISTRO RÁPIDO
    ========================================
  */

  const handleRegistrarSesionRapida = (
    turno
  ) => {
    const participantes =
      turno.participantes ||
      []

    const participanteInicial =
      participantes.find(
        (
          participante
        ) =>
          participante.estado ===
          'programado'
      ) ||
      participantes[0]

    if (
      !participanteInicial
    ) {
      alert(
        'Este horario no tiene pacientes'
      )

      return
    }

    handleRegistrarSesion(
      turno,
      participanteInicial
    )
  }

  /*
    ========================================
    SESIONES CREADAS
    ========================================
  */

  const handleSesionCreada =
    async (
      nuevasSesiones,
      pacientesSeleccionados
    ) => {
      const turno =
        turnoRegistrandoSesion

      if (!turno) {
        return
      }

      let pacientesIds =
        Array.isArray(
          pacientesSeleccionados
        )
          ? pacientesSeleccionados
          : []

      if (
        pacientesIds.length ===
          0 &&
        turno.paciente
      ) {
        const pacienteId =
          turno.paciente?._id ||
          turno.paciente

        if (pacienteId) {
          pacientesIds = [
            pacienteId
          ]
        }
      }

      if (
        pacientesIds.length ===
        0
      ) {
        return
      }

      try {
        let turnoActualizado =
          turno

        for (
          const pacienteId
          of pacientesIds
        ) {
          const participante =
            turnoActualizado
              .participantes
              ?.find(
                (item) =>
                  (
                    item
                      .paciente?._id ||
                    item.paciente
                  )?.toString() ===
                  pacienteId
                    ?.toString()
              )

          if (
            participante?.estado ===
            'realizado'
          ) {
            continue
          }

          const response =
            await api.patch(
              `/turnos/${turno._id}/status`,
              {
                pacienteId,

                estado:
                  'realizado'
              }
            )

          turnoActualizado =
            response.data?.data ||
            response.data
        }

        setTurnos(
          (prev) =>
            prev.map(
              (item) =>
                item._id ===
                turno._id
                  ? turnoActualizado
                  : item
            )
        )

        setTurnoRegistrandoSesion(
          (prev) => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              ...turnoActualizado,

              paciente:
                prev.paciente
            }
          }
        )

        return turnoActualizado

      } catch (error) {
        console.error(
          'Las sesiones se guardaron, pero no se pudieron actualizar todos los estados:',
          error
        )

        alert(
          'Las sesiones se guardaron, pero hubo un problema al actualizar el estado de alguno de los pacientes.'
        )

        throw error
      }
    }

  const handleCancelarSesion =
    () => {
      setTurnoRegistrandoSesion(
        null
      )
    }

  /*
    ========================================
    CAMBIAR ESTADO
    ========================================
  */

  const handleCambiarEstado =
    async (
      turno,
      participante,
      nuevoEstado
    ) => {
      const nombresEstados = {
        programado:
          'Programado',

        realizado:
          'Realizado',

        cancelado:
          'Cancelado',

        no_asistio:
          'No asistió'
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

        setTurnos(
          (prev) =>
            prev.map(
              (item) =>
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

  /*
    ========================================
    QUITAR UN PACIENTE
    DEL HORARIO SEMANAL

    IMPORTANTE:

    - No elimina al paciente.
    - No elimina sesiones anteriores.
    - No elimina a los otros pacientes.
    - Solamente lo saca de este
      horario semanal.

    Si era el último paciente,
    se desactiva el horario entero.
    ========================================
  */

  const handleQuitarPacienteHorario =
    async (
      turno,
      participante
    ) => {
      const paciente =
        participante.paciente

      const pacienteId =
        paciente?._id ||
        paciente

      const nombrePaciente =
        `${paciente?.nombre || ''} ${
          paciente?.apellido || ''
        }`.trim() ||
        'este paciente'

      if (
        !turno.esHorarioFijo ||
        !turno.horarioSemanalId
      ) {
        alert(
          'Este registro ya corresponde a una atención del día. Para modificar el horario semanal hacelo desde Horarios.'
        )

        return
      }

      const confirmado =
        window.confirm(
          `¿Querés quitar a ${nombrePaciente} de este horario semanal? Los demás pacientes seguirán agendados en este mismo horario.`
        )

      if (!confirmado) {
        return
      }

      try {
        setQuitandoPacienteId(
          pacienteId?.toString()
        )

        const horario =
          horariosSemanales.find(
            (item) =>
              item._id ===
              turno.horarioSemanalId
          )

        if (!horario) {
          throw new Error(
            'No se encontró el horario semanal'
          )
        }

        const pacientesActuales =
          Array.isArray(
            horario.pacientes
          )
            ? horario.pacientes
            : horario.paciente
            ? [
                horario.paciente
              ]
            : []

        const pacientesRestantes =
          pacientesActuales
            .filter(
              (item) =>
                (
                  item?._id ||
                  item
                )?.toString() !==
                pacienteId?.toString()
            )
            .map(
              (item) =>
                item?._id ||
                item
            )

        /*
          SI ERA EL ÚLTIMO PACIENTE
          DESACTIVAMOS EL HORARIO.
        */

        if (
          pacientesRestantes.length ===
          0
        ) {
          await api.delete(
            `/horarios-semanales/${horario._id}`
          )

          setHorariosSemanales(
            (prev) =>
              prev.filter(
                (item) =>
                  item._id !==
                  horario._id
              )
          )

          setTurnoSeleccionado(
            null
          )

          return
        }

        /*
          SI QUEDAN PACIENTES,
          MODIFICAMOS EL MISMO HORARIO.
        */

        const datos = {
          pacientes:
            pacientesRestantes,

          diaSemana:
            horario.diaSemana,

          horaInicio:
            horario.horaInicio,

          horaFin:
            horario.horaFin
        }

        if (
          horario.fechaDesde
        ) {
          datos.fechaDesde =
            horario.fechaDesde
        }

        if (
          horario.fechaHasta
        ) {
          datos.fechaHasta =
            horario.fechaHasta
        } else {
          datos.fechaHasta =
            null
        }

        const response =
          await api.put(
            `/horarios-semanales/${horario._id}`,
            datos
          )

        const actualizado =
          response.data?.data ||
          response.data

        /*
          ACTUALIZAMOS LOS HORARIOS
          DE LA AGENDA.
        */

        setHorariosSemanales(
          (prev) =>
            prev.map(
              (item) =>
                item._id ===
                actualizado._id
                  ? actualizado
                  : item
            )
        )

        /*
          Cerramos el detalle.
          Al volver a abrirlo,
          ya aparecerán únicamente
          los pacientes restantes.
        */

        setTurnoSeleccionado(
          null
        )

      } catch (error) {
        console.error(
          'Error al quitar paciente del horario:',
          error
        )

        alert(
          error.response?.data?.message ||
          error.message ||
          'No se pudo quitar al paciente del horario'
        )

      } finally {
        setQuitandoPacienteId(
          null
        )
      }
    }

  /*
    ========================================
    FORMATOS
    ========================================
  */

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
        hour:
          '2-digit',

        minute:
          '2-digit'
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
          weekday:
            'long',

          day:
            '2-digit',

          month:
            'long',

          year:
            'numeric'
        }
      )

    return (
      texto
        .charAt(0)
        .toUpperCase() +
      texto.slice(1)
    )
  }

  /*
    ========================================
    CAMBIAR VISTA
    ========================================
  */

  const cambiarVista = (
    nuevaVista
  ) => {
    setVista(
      nuevaVista
    )

    setTurnoSeleccionado(
      null
    )

    setTurnoRegistrandoSesion(
      null
    )
  }

  /*
    ========================================
    LOADING
    ========================================
  */

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

  /*
    ========================================
    ERROR
    ========================================
  */

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
            Tus horarios semanales,
            pacientes y sesiones.
          </p>

        </div>

        <Link
          to="/horarios"
          className="agenda-new-button"
        >
          + Nuevo horario
        </Link>

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

      {/* AGENDA */}

      <section className="card">

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
            onRegistrarSesion={
              handleRegistrarSesionRapida
            }
          />

        )}

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

      {/* DETALLE DEL HORARIO */}

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

            {/* HEADER */}

            <div className="agenda-modal-header">

              <div>

                <h2>
                  Detalle del horario
                </h2>

                {turnoSeleccionado
                  .esHorarioFijo && (

                  <small>
                    Horario semanal
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

            {/* FECHA Y HORA */}

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

                  const quitando =
                    quitandoPacienteId ===
                    pacienteId?.toString()

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

                          {paciente?.nombre}{' '}
                          {paciente?.apellido}

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

                        {/* QUITAR DEL HORARIO */}

                        {turnoSeleccionado
                          .esHorarioFijo &&
                          turnoSeleccionado
                            .horarioSemanalId && (

                          <button
                            type="button"
                            className="agenda-action-button agenda-action-remove"
                            disabled={
                              quitando
                            }
                            onClick={() =>
                              handleQuitarPacienteHorario(
                                turnoSeleccionado,
                                participante
                              )
                            }
                          >
                            {quitando
                              ? 'Quitando...'
                              : '🗑 Quitar del horario'}
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

              <Link
                to="/horarios"
                className="agenda-edit-button"
                onClick={() =>
                  setTurnoSeleccionado(
                    null
                  )
                }
              >
                Gestionar horarios
              </Link>

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