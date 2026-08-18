import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import api from '../api/api.js'
import CrearPacienteForm from '../components/pacientes/CrearPacienteForm.jsx'
import EditarPacienteForm from '../components/pacientes/EditarPacienteForm.jsx'

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

        const response = await api.get('/pacientes')

        setPacientes(response.data.data)
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

  const handlePacienteCreado = (nuevoPaciente) => {
    setPacientes((prev) => [
      nuevoPaciente,
      ...prev
    ])

    setMostrarFormulario(false)
  }

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false)
  }

  const handleEditarPaciente = (paciente) => {
    setMostrarFormulario(false)
    setPacienteEditando(paciente)
  }

  const handlePacienteActualizado = (
    pacienteActualizado
  ) => {
    setPacientes((prev) =>
      prev.map((paciente) =>
        paciente._id === pacienteActualizado._id
          ? pacienteActualizado
          : paciente
      )
    )

    setPacienteEditando(null)
  }

  const handleCancelarEdicion = () => {
    setPacienteEditando(null)
  }

  const handleCambiarEstado = async (paciente) => {
    const nuevoEstado = !paciente.activo

    const mensaje = nuevoEstado
      ? `¿Querés activar a ${paciente.nombre} ${paciente.apellido}?`
      : `¿Querés desactivar a ${paciente.nombre} ${paciente.apellido}?`

    const confirmado = window.confirm(mensaje)

    if (!confirmado) {
      return
    }

    try {
      setCambiandoEstadoId(paciente._id)

      await api.patch(
        `/pacientes/${paciente._id}/status`,
        {
          activo: nuevoEstado
        }
      )

      setPacientes((prev) =>
        prev.map((item) =>
          item._id === paciente._id
            ? {
                ...item,
                activo: nuevoEstado
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
      setCambiandoEstadoId(null)
    }
  }

  if (loading) {
    return (
      <main>
        <p>Cargando pacientes...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Pacientes</h1>

        <p>{error}</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Pacientes</h1>

      <p>
        Gestioná tus pacientes.
      </p>

      {!mostrarFormulario && !pacienteEditando && (
        <button
          type="button"
          onClick={() =>
            setMostrarFormulario(true)
          }
        >
          + Nuevo paciente
        </button>
      )}

      {mostrarFormulario && (
        <CrearPacienteForm
          onCreated={handlePacienteCreado}
          onCancel={handleCancelarFormulario}
        />
      )}

      {pacienteEditando && (
        <EditarPacienteForm
          paciente={pacienteEditando}
          onUpdated={handlePacienteActualizado}
          onCancel={handleCancelarEdicion}
        />
      )}

      <section>
        <h2>
          Pacientes registrados
        </h2>

        {pacientes.length === 0 ? (
          <p>
            No tenés pacientes registrados.
          </p>
        ) : (
          <div>
            {pacientes.map((paciente) => (
              <article key={paciente._id}>

                <h3>
                  {paciente.nombre}{' '}
                  {paciente.apellido}
                </h3>

                <p>
                  Documento:{' '}
                  {paciente.documento ||
                    'Sin documento'}
                </p>

                <p>
                  Fecha de nacimiento:{' '}
                  {paciente.fechaNacimiento
                    ? new Date(
                        paciente.fechaNacimiento
                      ).toLocaleDateString(
                        'es-UY'
                      )
                    : 'Sin fecha'
                  }
                </p>

                <p>
                  Estado:{' '}
                  <strong>
                    {paciente.activo
                      ? 'Activo'
                      : 'Inactivo'}
                  </strong>
                </p>

                <div>
                  <Link
                    to={`/pacientes/${paciente._id}`}
                  >
                    Ver ficha
                  </Link>

                  {' '}

                  <button
                    type="button"
                    onClick={() =>
                      handleEditarPaciente(paciente)
                    }
                  >
                    Editar
                  </button>

                  {' '}

                  <button
                    type="button"
                    onClick={() =>
                      handleCambiarEstado(paciente)
                    }
                    disabled={
                      cambiandoEstadoId === paciente._id
                    }
                  >
                    {cambiandoEstadoId === paciente._id
                      ? 'Guardando...'
                      : paciente.activo
                        ? 'Desactivar'
                        : 'Activar'
                    }
                  </button>
                </div>

              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}