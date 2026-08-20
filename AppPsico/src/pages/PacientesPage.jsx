import {
  useEffect,
  useMemo,
  useState
} from 'react'

import { Link } from 'react-router'

import api from '../api/api.js'

import CrearPacienteForm from '../components/pacientes/CrearPacienteForm.jsx'
import EditarPacienteForm from '../components/pacientes/EditarPacienteForm.jsx'

export default function PacientesPage() {
  const [
    pacientes,
    setPacientes
  ] = useState([])

  const [
    busqueda,
    setBusqueda
  ] = useState('')

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState(null)

  const [
    pacienteEditando,
    setPacienteEditando
  ] = useState(null)

  const [
    mostrarFormulario,
    setMostrarFormulario
  ] = useState(false)

  const [
    cambiandoEstadoId,
    setCambiandoEstadoId
  ] = useState(null)

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        setLoading(true)
        setError(null)

        const response =
          await api.get(
            '/pacientes'
          )

        const recibidos =
          response.data?.data ||
          response.data

        setPacientes(
          Array.isArray(
            recibidos
          )
            ? recibidos
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

          const documento =
            (
              paciente.documento ||
              ''
            )
              .toString()
              .toLowerCase()

          return (
            nombreCompleto.includes(
              texto
            ) ||
            documento.includes(
              texto
            )
          )
        }
      )
    }, [
      pacientes,
      busqueda
    ])

  const handlePacienteCreado = (
    nuevoPaciente
  ) => {
    setPacientes(
      (prev) => [
        nuevoPaciente,
        ...prev
      ]
    )

    setMostrarFormulario(
      false
    )
  }

  const handleCancelarFormulario =
    () => {
      setMostrarFormulario(
        false
      )
    }

  const handleEditarPaciente = (
    paciente
  ) => {
    setMostrarFormulario(
      false
    )

    setPacienteEditando(
      paciente
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handlePacienteActualizado = (
    pacienteActualizado
  ) => {
    setPacientes(
      (prev) =>
        prev.map(
          (paciente) =>
            paciente._id ===
            pacienteActualizado._id
              ? pacienteActualizado
              : paciente
        )
    )

    setPacienteEditando(
      null
    )
  }

  const handleCancelarEdicion =
    () => {
      setPacienteEditando(
        null
      )
    }

  const handleCambiarEstado =
    async (
      paciente
    ) => {
      const nuevoEstado =
        !paciente.activo

      const mensaje =
        nuevoEstado
          ? `¿Querés activar a ${paciente.nombre} ${paciente.apellido}?`
          : `¿Querés desactivar a ${paciente.nombre} ${paciente.apellido}?`

      const confirmado =
        window.confirm(
          mensaje
        )

      if (!confirmado) {
        return
      }

      try {
        setCambiandoEstadoId(
          paciente._id
        )

        await api.patch(
          `/pacientes/${paciente._id}/status`,
          {
            activo:
              nuevoEstado
          }
        )

        setPacientes(
          (prev) =>
            prev.map(
              (item) =>
                item._id ===
                paciente._id
                  ? {
                      ...item,
                      activo:
                        nuevoEstado
                    }
                  : item
            )
        )
      } catch (error) {
        console.error(
          'Error al cambiar estado:',
          error
        )

        alert(
          error.response?.data?.message ||
          'No se pudo cambiar el estado del paciente'
        )
      } finally {
        setCambiandoEstadoId(
          null
        )
      }
    }

  const calcularEdad = (
    fechaNacimiento
  ) => {
    if (!fechaNacimiento) {
      return null
    }

    const nacimiento =
      new Date(
        fechaNacimiento
      )

    const hoy =
      new Date()

    let edad =
      hoy.getFullYear() -
      nacimiento.getFullYear()

    const mes =
      hoy.getMonth() -
      nacimiento.getMonth()

    if (
      mes < 0 ||
      (
        mes === 0 &&
        hoy.getDate() <
          nacimiento.getDate()
      )
    ) {
      edad--
    }

    return edad
  }

  if (loading) {
    return (
      <main className="patients-page">
        <p>
          Cargando pacientes...
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="patients-page">
        <h1>
          Pacientes
        </h1>

        <p>
          {error}
        </p>
      </main>
    )
  }

  return (
    <main className="patients-page">

      {/* HEADER */}

      <section className="patients-header">

        <div>
          <p className="patients-eyebrow">
            Gestión clínica
          </p>

          <h1>
            Pacientes
          </h1>

          <p>
            Accedé rápidamente a
            las fichas e información
            de tus pacientes.
          </p>
        </div>

        {!mostrarFormulario &&
          !pacienteEditando && (
            <button
              type="button"
              className="patients-new-button"
              onClick={() =>
                setMostrarFormulario(
                  true
                )
              }
            >
              + Nuevo paciente
            </button>
          )}

      </section>

      {/* FORMULARIOS */}

      {mostrarFormulario && (
        <section className="card patients-form-card">
          <CrearPacienteForm
            onCreated={
              handlePacienteCreado
            }
            onCancel={
              handleCancelarFormulario
            }
          />
        </section>
      )}

      {pacienteEditando && (
        <section className="card patients-form-card">
          <EditarPacienteForm
            paciente={
              pacienteEditando
            }
            onUpdated={
              handlePacienteActualizado
            }
            onCancel={
              handleCancelarEdicion
            }
          />
        </section>
      )}

      {/* BUSCADOR */}

      <section className="patients-toolbar">

        <div className="patients-search">
          <span className="patients-search-icon">
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
            placeholder="Buscar por nombre o documento..."
          />
        </div>

        <div className="patients-count">
          {
            pacientesFiltrados.length
          }{' '}
          {pacientesFiltrados.length ===
          1
            ? 'paciente'
            : 'pacientes'}
        </div>

      </section>

      {/* LISTADO */}

      {pacientesFiltrados.length ===
      0 ? (
        <section className="patients-empty">
          <div className="patients-empty-icon">
            ♡
          </div>

          <h2>
            No encontramos pacientes
          </h2>

          <p>
            Probá con otra búsqueda
            o agregá un paciente nuevo.
          </p>
        </section>
      ) : (
        <section className="patients-grid">

          {pacientesFiltrados.map(
            (paciente) => {
              const edad =
                calcularEdad(
                  paciente.fechaNacimiento
                )

              return (
                <article
                  key={
                    paciente._id
                  }
                  className="patient-card"
                >

                  <div className="patient-card-top">

                    <div className="patient-avatar">
                      {paciente.nombre
                        ?.charAt(0)
                        ?.toUpperCase()}

                      {paciente.apellido
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <span
                      className={
                        paciente.activo
                          ? 'patient-status active'
                          : 'patient-status inactive'
                      }
                    >
                      {paciente.activo
                        ? 'Activo'
                        : 'Inactivo'}
                    </span>

                  </div>

                  <div className="patient-card-body">

                    <h2>
                      {
                        paciente.nombre
                      }{' '}

                      {
                        paciente.apellido
                      }
                    </h2>

                    <div className="patient-info-list">

                      <div>
                        <span>
                          Documento
                        </span>

                        <strong>
                          {paciente.documento ||
                            'Sin documento'}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Edad
                        </span>

                        <strong>
                          {edad !== null
                            ? `${edad} años`
                            : 'Sin fecha'}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Nacimiento
                        </span>

                        <strong>
                          {paciente.fechaNacimiento
                            ? new Date(
                                paciente.fechaNacimiento
                              ).toLocaleDateString(
                                'es-UY'
                              )
                            : 'Sin fecha'}
                        </strong>
                      </div>

                    </div>

                  </div>

                  <div className="patient-card-actions">

                    <Link
                      to={`/pacientes/${paciente._id}`}
                      className="patient-primary-action"
                    >
                      Ver ficha
                    </Link>

                    <button
                      type="button"
                      className="patient-secondary-action"
                      onClick={() =>
                        handleEditarPaciente(
                          paciente
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className={
                        paciente.activo
                          ? 'patient-state-action danger'
                          : 'patient-state-action success'
                      }
                      onClick={() =>
                        handleCambiarEstado(
                          paciente
                        )
                      }
                      disabled={
                        cambiandoEstadoId ===
                        paciente._id
                      }
                    >
                      {cambiandoEstadoId ===
                      paciente._id
                        ? 'Guardando...'
                        : paciente.activo
                        ? 'Desactivar'
                        : 'Activar'}
                    </button>

                  </div>

                </article>
              )
            }
          )}

        </section>
      )}

    </main>
  )
}