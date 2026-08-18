import { useEffect, useState } from 'react'

import api from '../api/api.js'

import CrearProfesionalForm from '../components/admin/CrearProfesionalForm.jsx'
import EditarProfesionalForm from '../components/admin/EditarProfesionalForm.jsx'

export default function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [
    profesionalEditando,
    setProfesionalEditando
  ] = useState(null)

  const [
    cambiandoEstadoId,
    setCambiandoEstadoId
  ] = useState(null)

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get('/profesionales')

        setProfesionales(response.data.data)
      } catch (error) {
        setError(
          error.response?.data?.message ||
          'No se pudieron cargar los profesionales'
        )
      } finally {
        setLoading(false)
      }
    }

    cargarProfesionales()
  }, [])

  const handleProfesionalCreado = (nuevoProfesional) => {
    setProfesionales((prev) => [
      nuevoProfesional,
      ...prev
    ])

    setMostrarFormulario(false)
  }

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false)
  }

  const handleEditar = (profesional) => {
    setMostrarFormulario(false)
    setProfesionalEditando(profesional)
  }

  const handleProfesionalActualizado = (
    profesionalActualizado
  ) => {
    setProfesionales((prev) =>
      prev.map((profesional) =>
        profesional._id === profesionalActualizado._id
          ? profesionalActualizado
          : profesional
      )
    )

    setProfesionalEditando(null)
  }

  const handleCancelarEdicion = () => {
    setProfesionalEditando(null)
  }

  const handleCambiarEstado = async (profesional) => {
    const nuevoEstado = !profesional.activo

    const mensaje = nuevoEstado
      ? `¿Querés activar a ${profesional.nombre} ${profesional.apellido}?`
      : `¿Querés desactivar a ${profesional.nombre} ${profesional.apellido}?`

    const confirmado = window.confirm(mensaje)

    if (!confirmado) {
      return
    }

    try {
      setCambiandoEstadoId(profesional._id)

      await api.patch(
        `/profesionales/${profesional._id}/status`,
        {
          activo: nuevoEstado
        }
      )

      setProfesionales((prev) =>
        prev.map((item) =>
          item._id === profesional._id
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
        'No se pudo cambiar el estado del profesional'
      )
    } finally {
      setCambiandoEstadoId(null)
    }
  }

  if (loading) {
    return (
      <main>
        <p>Cargando profesionales...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Profesionales</h1>

        <p>{error}</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Profesionales</h1>

      <p>
        Administrá los profesionales registrados en el sistema.
      </p>

      {!mostrarFormulario && !profesionalEditando && (
        <button
          type="button"
          onClick={() => setMostrarFormulario(true)}
        >
          + Nuevo profesional
        </button>
      )}

      {mostrarFormulario && (
        <CrearProfesionalForm
          onCreated={handleProfesionalCreado}
          onCancel={handleCancelarFormulario}
        />
      )}

      {profesionalEditando && (
        <EditarProfesionalForm
          profesional={profesionalEditando}
          onUpdated={handleProfesionalActualizado}
          onCancel={handleCancelarEdicion}
        />
      )}

      <section>
        <h2>
          Profesionales registrados
        </h2>

        {profesionales.length === 0 ? (
          <p>
            No hay profesionales registrados.
          </p>
        ) : (
          <div>
            {profesionales.map((profesional) => (
              <article key={profesional._id}>

                <h3>
                  {profesional.nombre}{' '}
                  {profesional.apellido}
                </h3>

                <p>
                  Profesión:{' '}
                  {profesional.profesion}
                </p>

                <p>
                  Teléfono:{' '}
                  {profesional.telefono ||
                    'Sin teléfono'}
                </p>

                <p>
                  Email:{' '}
                  {profesional.user?.email ||
                    'Sin email'}
                </p>

                <p>
                  Estado:{' '}
                  <strong>
                    {profesional.activo
                      ? 'Activo'
                      : 'Inactivo'}
                  </strong>
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      handleEditar(profesional)
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleCambiarEstado(profesional)
                    }
                    disabled={
                      cambiandoEstadoId === profesional._id
                    }
                  >
                    {cambiandoEstadoId === profesional._id
                      ? 'Guardando...'
                      : profesional.activo
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