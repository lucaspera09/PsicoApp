import {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router'

import api from '../api/api.js'

export default function NotaRapidaPage() {
  const navigate = useNavigate()

  const [pacientes, setPacientes] =
    useState([])

  const [busqueda, setBusqueda] =
    useState('')

  const [
    pacienteSeleccionado,
    setPacienteSeleccionado
  ] = useState(null)

  const [tipo, setTipo] =
    useState('comentario_padres')

  const [titulo, setTitulo] =
    useState('')

  const [contenido, setContenido] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [guardando, setGuardando] =
    useState(false)

  const [error, setError] =
    useState(null)

  const [guardado, setGuardado] =
    useState(false)

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        setLoading(true)
        setError(null)

        const response =
          await api.get('/pacientes')

        const recibidos =
          response.data?.data ||
          response.data

        setPacientes(
          Array.isArray(recibidos)
            ? recibidos.filter(
                (paciente) =>
                  paciente.activo !== false
              )
            : []
        )
      } catch (error) {
        console.error(
          'Error al cargar pacientes:',
          error
        )

        setError(
          error.response?.data?.message ||
          'No se pudieron cargar los pacientes'
        )
      } finally {
        setLoading(false)
      }
    }

    cargarPacientes()
  }, [])

  const pacientesFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase()

      if (!texto) {
        return pacientes
      }

      return pacientes.filter(
        (paciente) => {
          const nombreCompleto =
            `${paciente.nombre || ''} ${paciente.apellido || ''}`
              .toLowerCase()

          return nombreCompleto.includes(
            texto
          )
        }
      )
    }, [
      pacientes,
      busqueda
    ])

  const handleSeleccionarPaciente = (
    paciente
  ) => {
    setPacienteSeleccionado(
      paciente
    )

    setBusqueda('')

    setGuardado(false)
    setError(null)
  }

  const handleCambiarPaciente = () => {
    setPacienteSeleccionado(
      null
    )

    setGuardado(false)
    setError(null)
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (!pacienteSeleccionado) {
      setError(
        'Seleccioná un paciente'
      )

      return
    }

    if (!contenido.trim()) {
      setError(
        'Escribí algo antes de guardar la nota'
      )

      return
    }

    try {
      setGuardando(true)
      setError(null)

      await api.post(
        '/notas',
        {
          paciente:
            pacienteSeleccionado._id,

          tipo,

          titulo:
            titulo.trim() ||
            'Nota rápida',

          contenido:
            contenido.trim(),

          fecha:
            new Date().toISOString()
        }
      )

      setGuardado(true)

      setTitulo('')
      setContenido('')
    } catch (error) {
      console.error(
        'Error al guardar nota:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo guardar la nota'
      )
    } finally {
      setGuardando(false)
    }
  }

  const handleNuevaNota = () => {
    setGuardado(false)
    setTitulo('')
    setContenido('')
  }

  if (loading) {
    return (
      <main className="quick-note-page">
        <p>
          Cargando pacientes...
        </p>
      </main>
    )
  }

  return (
    <main className="quick-note-page">

      {/* HEADER */}

      <section className="quick-note-header">

        <div>
          <p className="quick-note-eyebrow">
            Registro rápido
          </p>

          <h1>
            Nueva nota
          </h1>

          <p>
            Anotá lo importante mientras
            hablás con un padre, familiar
            o profesional.
          </p>
        </div>

        <button
          type="button"
          className="quick-note-back"
          onClick={() =>
            navigate('/')
          }
        >
          ← Volver
        </button>

      </section>

      {/* MENSAJE GUARDADO */}

      {guardado && (
        <section className="quick-note-success">

          <div className="quick-note-success-icon">
            ✓
          </div>

          <div>
            <strong>
              Nota guardada
            </strong>

            <p>
              La nota quedó registrada
              en la ficha de{' '}
              {
                pacienteSeleccionado
                  ?.nombre
              }{' '}
              {
                pacienteSeleccionado
                  ?.apellido
              }.
            </p>
          </div>

          <div className="quick-note-success-actions">

            <button
              type="button"
              onClick={
                handleNuevaNota
              }
            >
              Otra nota
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/pacientes/${pacienteSeleccionado._id}`
                )
              }
            >
              Ver ficha
            </button>

          </div>

        </section>
      )}

      {!guardado && (
        <form
          className="quick-note-card"
          onSubmit={
            handleSubmit
          }
        >

          {/* PACIENTE */}

          <section className="quick-note-section">

            <div className="quick-note-section-heading">

              <div className="quick-note-number">
                1
              </div>

              <div>
                <h2>
                  Paciente
                </h2>

                <p>
                  ¿Sobre quién querés
                  registrar la nota?
                </p>
              </div>

            </div>

            {!pacienteSeleccionado ? (
              <>

                <div className="quick-note-search">

                  <span>
                    ⌕
                  </span>

                  <input
                    type="search"
                    value={
                      busqueda
                    }
                    onChange={(event) =>
                      setBusqueda(
                        event.target.value
                      )
                    }
                    placeholder="Buscar paciente..."
                    autoFocus
                  />

                </div>

                <div className="quick-note-patients">

                  {pacientesFiltrados.map(
                    (paciente) => (
                      <button
                        key={
                          paciente._id
                        }
                        type="button"
                        className="quick-note-patient"
                        onClick={() =>
                          handleSeleccionarPaciente(
                            paciente
                          )
                        }
                      >

                        <div className="quick-note-avatar">

                          {paciente.nombre
                            ?.charAt(0)
                            ?.toUpperCase()}

                          {paciente.apellido
                            ?.charAt(0)
                            ?.toUpperCase()}

                        </div>

                        <div>
                          <strong>
                            {
                              paciente.nombre
                            }{' '}
                            {
                              paciente.apellido
                            }
                          </strong>

                          <span>
                            Seleccionar
                          </span>
                        </div>

                        <span className="quick-note-patient-arrow">
                          →
                        </span>

                      </button>
                    )
                  )}

                </div>

              </>
            ) : (
              <div className="quick-note-selected-patient">

                <div className="quick-note-avatar">

                  {pacienteSeleccionado.nombre
                    ?.charAt(0)
                    ?.toUpperCase()}

                  {pacienteSeleccionado.apellido
                    ?.charAt(0)
                    ?.toUpperCase()}

                </div>

                <div>
                  <span>
                    Nota para
                  </span>

                  <strong>
                    {
                      pacienteSeleccionado.nombre
                    }{' '}
                    {
                      pacienteSeleccionado.apellido
                    }
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCambiarPaciente
                  }
                >
                  Cambiar
                </button>

              </div>
            )}

          </section>

          {/* DATOS DE LA NOTA */}

          {pacienteSeleccionado && (
            <>

              <section className="quick-note-section">

                <div className="quick-note-section-heading">

                  <div className="quick-note-number">
                    2
                  </div>

                  <div>
                    <h2>
                      Tipo de nota
                    </h2>

                    <p>
                      Podés cambiarlo
                      rápidamente.
                    </p>
                  </div>

                </div>

                <div className="quick-note-types">

                  <button
                    type="button"
                    className={
                      tipo ===
                      'comentario_padres'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setTipo(
                        'comentario_padres'
                      )
                    }
                  >
                    👨‍👩‍👧 Padres
                  </button>

                  <button
                    type="button"
                    className={
                      tipo ===
                      'entrevista'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setTipo(
                        'entrevista'
                      )
                    }
                  >
                    💬 Entrevista
                  </button>

                  <button
                    type="button"
                    className={
                      tipo ===
                      'llamada'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setTipo(
                        'llamada'
                      )
                    }
                  >
                    ☎ Llamada
                  </button>

                  <button
                    type="button"
                    className={
                      tipo ===
                      'reunion'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setTipo(
                        'reunion'
                      )
                    }
                  >
                    👥 Reunión
                  </button>

                  <button
                    type="button"
                    className={
                      tipo ===
                      'observacion'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setTipo(
                        'observacion'
                      )
                    }
                  >
                    👁 Observación
                  </button>

                  <button
                    type="button"
                    className={
                      tipo ===
                      'otro'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setTipo(
                        'otro'
                      )
                    }
                  >
                    • Otro
                  </button>

                </div>

              </section>

              <section className="quick-note-section quick-note-writing">

                <div className="quick-note-section-heading">

                  <div className="quick-note-number">
                    3
                  </div>

                  <div>
                    <h2>
                      Escribí la nota
                    </h2>

                    <p>
                      No hace falta completar
                      formularios largos.
                    </p>
                  </div>

                </div>

                <div className="quick-note-field">

                  <label>
                    Título
                    <span>
                      opcional
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      titulo
                    }
                    onChange={(event) =>
                      setTitulo(
                        event.target.value
                      )
                    }
                    placeholder="Ej: Conversación con la madre"
                  />

                </div>

                <div className="quick-note-field">

                  <label>
                    Nota
                  </label>

                  <textarea
                    value={
                      contenido
                    }
                    onChange={(event) =>
                      setContenido(
                        event.target.value
                      )
                    }
                    placeholder="Empezá a escribir acá..."
                    rows="10"
                  />

                </div>

              </section>

              {error && (
                <div className="quick-note-error">
                  {error}
                </div>
              )}

              <div className="quick-note-footer">

                <span>
                  La nota se guardará en
                  la ficha del paciente.
                </span>

                <button
                  type="submit"
                  disabled={
                    guardando ||
                    !contenido.trim()
                  }
                  className="quick-note-save"
                >
                  {guardando
                    ? 'Guardando...'
                    : '✓ Guardar nota'}
                </button>

              </div>

            </>
          )}

        </form>
      )}

    </main>
  )
}