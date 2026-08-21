import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  useLocation,
  useNavigate
} from 'react-router'

import api from '../api/api.js'

import CrearTurnoForm from '../components/agenda/CrearTurnoForm.jsx'
import EditarTurnoForm from '../components/agenda/EditarTurnoForm.jsx'
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

  /*
    CARGAR AGENDA
  */

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

  /*
    ORDENAR TURNOS
  */

  const turnosOrdenados = useMemo(() => {
    return [...turnos].sort(
      (a, b) =>
        new Date(a.fechaInicio) -
        new Date(b.fechaInicio)
    )
  }, [turnos])

  /*
    CREAR TURNO
  */

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

  /*
    CONVERTIR HORARIO FIJO
    EN TURNO REAL
  */

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

  /*
    SELECCIONAR TURNO
  */

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

  /*
    EDITAR TURNO
  */

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

  /*
    ABRIR REGISTRO DE SESIÓN

    Seguimos recibiendo el participante
    que el usuario tocó.

    Ese paciente queda seleccionado
    inicialmente dentro del formulario,
    pero después se pueden seleccionar
    los demás pacientes del mismo turno.
  */

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

      /*
        paciente se mantiene por
        compatibilidad.

        RegistrarSesionTurnoForm
        también recibe participantes,
        por lo que puede seleccionar
        varios niños.
      */

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
  /*
  ACCESO RÁPIDO DESDE EL INICIO
*/

/*
  ACCESOS RÁPIDOS A REGISTRAR SESIÓN

  Puede venir:
  1. Un turno desde el Dashboard.
  2. Un paciente desde su ficha.
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

  const limpiarNavegacion = () => {
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

    /*
      Si venimos desde la ficha,
      buscamos específicamente
      ese paciente.
    */
    if (pacienteId) {
      return participantes.find(
        (participante) =>
          obtenerPacienteId(
            participante.paciente
          ) ===
          pacienteId.toString()
      )
    }

    /*
      Si venimos desde el Dashboard,
      elegimos uno pendiente.
    */
    return (
      participantes.find(
        (participante) =>
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

  const abrirDesdeTurno = async (
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
        'No se encontró al paciente dentro del turno.'
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

  const buscarTurnoPacienteHoy =
    async () => {

      /*
        PRIMERO:
        buscamos un turno real de hoy.
      */

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
              (participante) =>
                obtenerPacienteId(
                  participante.paciente
                ) ===
                pacienteSesionId.toString()
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

      /*
        SEGUNDO:
        revisamos horarios fijos de hoy.
      */

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

            if (item.fechaDesde) {
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

              if (hoy < desde) {
                return false
              }
            }

            if (item.fechaHasta) {
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

              if (hoy > hasta) {
                return false
              }
            }

            const pacientes =
              Array.isArray(
                item.pacientes
              )
                ? item.pacientes
                : item.paciente
                ? [item.paciente]
                : []

            return pacientes.some(
              (paciente) =>
                obtenerPacienteId(
                  paciente
                ) ===
                pacienteSesionId.toString()
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
            ? [horario.paciente]
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
            fechaInicio.toISOString(),

          fechaFin:
            fechaFin.toISOString(),

          participantes:
            pacientes.map(
              (paciente) => ({
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

      /*
        NO TIENE TURNO HOY
      */

      alert(
        'Este paciente no tiene ningún turno programado para hoy.'
      )

      limpiarNavegacion()
    }

  const ejecutar = async () => {
    try {

      /*
        DESDE DASHBOARD
      */

      if (turnoRecibido) {
        await abrirDesdeTurno(
          turnoRecibido
        )

        return
      }

      /*
        DESDE FICHA DEL PACIENTE
      */

      if (pacienteSesionId) {
        await buscarTurnoPacienteHoy()
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

  const handleRegistrarSesionRapida = (
  turno
) => {
  const participantes =
    turno.participantes || []

  /*
    Elegimos primero un paciente
    que todavía esté programado.

    Si es horario fijo todos vienen
    como programados.
  */
  const participanteInicial =
    participantes.find(
      (participante) =>
        participante.estado ===
        'programado'
    ) ||
    participantes[0]

  if (!participanteInicial) {
    alert(
      'Este turno no tiene pacientes'
    )

    return
  }

  handleRegistrarSesion(
    turno,
    participanteInicial
  )
}
  /*
    SESIONES CREADAS

    Ahora RegistrarSesionTurnoForm
    devuelve:

    nuevasSesiones
    pacientesSeleccionados

    Ejemplo:
    pacientesSeleccionados = [
      idMateo,
      idJuan
    ]

    Marcamos a ambos como realizados.
  */

  const handleSesionCreada = async (
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

  /*
    Compatibilidad con el flujo
    de un solo paciente.
  */
  if (
    pacientesIds.length === 0 &&
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

  /*
    Si no se creó ninguna sesión,
    no hacemos cambios en el turno.
  */
  if (
    pacientesIds.length === 0
  ) {
    return
  }

  try {
    let turnoActualizado =
      turno

    /*
      Marcamos como realizado
      solamente a los pacientes
      cuyas sesiones se crearon.
    */
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
                item.paciente?._id ||
                item.paciente
              )?.toString() ===
              pacienteId?.toString()
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
            estado: 'realizado'
          }
        )

      turnoActualizado =
        response.data?.data ||
        response.data
    }

    /*
      Actualizamos el turno en
      la lista general de Agenda.
    */
    setTurnos((prev) =>
      prev.map((item) =>
        item._id ===
        turno._id
          ? turnoActualizado
          : item
      )
    )

    /*
      También actualizamos la copia
      que tiene abierto el formulario.

      Importante:
      NO cerramos el modal acá.
      RegistrarSesionTurnoForm decide
      cuándo cerrarlo.
    */
    setTurnoRegistrandoSesion(
      (prev) => {
        if (!prev) {
          return prev
        }

        return {
          ...prev,
          ...turnoActualizado,

          /*
            Conservamos el paciente
            desde el cual se abrió
            originalmente el formulario.
          */
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

    /*
      Lanzamos el error nuevamente
      para que RegistrarSesionTurnoForm
      sepa que el proceso no terminó
      correctamente.
    */
    throw error
  }
}

  const handleCancelarSesion = () => {
    setTurnoRegistrandoSesion(
      null
    )
  }

  /*
    CAMBIAR ESTADO MANUALMENTE
  */

  const handleCambiarEstado = async (
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

  /*
    FORMATOS
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
      texto.charAt(0).toUpperCase() +
      texto.slice(1)
    )
  }

  /*
    CAMBIAR VISTA
  */

  const cambiarVista = (
    nuevaVista
  ) => {
    setVista(nuevaVista)

    setTurnoSeleccionado(null)
    setMostrarFormulario(false)
    setTurnoEditando(null)
    setTurnoRegistrandoSesion(null)
  }

  /*
    LOADING
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
    ERROR
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
  onRegistrarSesion={
    handleRegistrarSesionRapida
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

            {/* CABECERA */}

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