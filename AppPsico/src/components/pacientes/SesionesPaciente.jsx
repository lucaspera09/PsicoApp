import { useEffect, useState } from 'react'

import api from '../../api/api.js'
import CrearSesionForm from './CrearSesionForm.jsx'
import EditarSesionForm from './EditarSesionForm.jsx'

export default function SesionesPaciente({
  pacienteId
}) {
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [
    mostrarFormulario,
    setMostrarFormulario
  ] = useState(false)

  const [
    sesionEditando,
    setSesionEditando
  ] = useState(null)

  useEffect(() => {
    const cargarSesiones = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(
          `/sesiones/paciente/${pacienteId}`
        )

        const sesionesRecibidas =
          response.data?.data || response.data

        setSesiones(
          Array.isArray(sesionesRecibidas)
            ? sesionesRecibidas
            : []
        )
      } catch (error) {
        console.error(
          'Error al cargar sesiones:',
          error
        )

        setError(
          error.response?.data?.message ||
          'No se pudieron cargar las sesiones'
        )
      } finally {
        setLoading(false)
      }
    }

    if (pacienteId) {
      cargarSesiones()
    }
  }, [pacienteId])

  const handleSesionCreada = (
    nuevaSesion
  ) => {
    setSesiones((prev) => [
      nuevaSesion,
      ...prev
    ])

    setMostrarFormulario(false)
  }

  const handleCancelar = () => {
    setMostrarFormulario(false)
  }

  const handleEditarSesion = (sesion) => {
    setMostrarFormulario(false)
    setSesionEditando(sesion)
  }

  const handleSesionActualizada = (
    sesionActualizada
  ) => {
    setSesiones((prev) =>
      prev.map((sesion) =>
        sesion._id === sesionActualizada._id
          ? sesionActualizada
          : sesion
      )
    )

    setSesionEditando(null)
  }

  const handleCancelarEdicion = () => {
    setSesionEditando(null)
  }

  const handleEliminarSesion = async (
    sesion
  ) => {
    const fecha = sesion.fecha
      ? new Date(
          sesion.fecha
        ).toLocaleDateString('es-UY')
      : ''

    const confirmado = window.confirm(
      `¿Querés eliminar la sesión del ${fecha}?`
    )

    if (!confirmado) {
      return
    }

    try {
      await api.delete(
        `/sesiones/${sesion._id}`
      )

      setSesiones((prev) =>
        prev.filter(
          (item) =>
            item._id !== sesion._id
        )
      )

      if (
        sesionEditando?._id ===
        sesion._id
      ) {
        setSesionEditando(null)
      }
    } catch (error) {
      console.error(
        'Error al eliminar sesión:',
        error
      )

      alert(
        error.response?.data?.message ||
        'No se pudo eliminar la sesión'
      )
    }
  }

  if (loading) {
    return (
      <section>
        <h2>Sesiones</h2>

        <p>Cargando sesiones...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2>Sesiones</h2>

        <p>{error}</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Sesiones</h2>

      {!mostrarFormulario &&
        !sesionEditando && (
          <button
            type="button"
            onClick={() =>
              setMostrarFormulario(true)
            }
          >
            + Nueva sesión
          </button>
        )}

      {mostrarFormulario && (
        <CrearSesionForm
          pacienteId={pacienteId}
          onCreated={handleSesionCreada}
          onCancel={handleCancelar}
        />
      )}

      {sesionEditando && (
        <EditarSesionForm
          sesion={sesionEditando}
          onUpdated={
            handleSesionActualizada
          }
          onCancel={
            handleCancelarEdicion
          }
        />
      )}

      {sesiones.length === 0 ? (
        <p>
          No hay sesiones registradas.
        </p>
      ) : (
        <div>
          {sesiones.map((sesion) => (
            <article key={sesion._id}>

              <h3>
                Sesión del{' '}
                {sesion.fecha
                  ? new Date(
                      sesion.fecha
                    ).toLocaleDateString(
                      'es-UY'
                    )
                  : 'Sin fecha'
                }
              </h3>

              <p>
                <strong>
                  Áreas trabajadas:
                </strong>{' '}
                {sesion.areas?.length > 0
                  ? sesion.areas.join(', ')
                  : 'Sin áreas registradas'
                }
              </p>

              <p>
                <strong>
                  Actividades:
                </strong>{' '}
                {sesion.actividades?.length > 0
                  ? sesion.actividades.join(', ')
                  : 'Sin actividades registradas'
                }
              </p>

              <p>
                <strong>
                  Observación:
                </strong>{' '}
                {sesion.observacion ||
                  'Sin observaciones'}
              </p>

              <p>
                <strong>
                  Para la próxima sesión:
                </strong>{' '}
                {sesion.proximaSesion ||
                  'Sin indicaciones'}
              </p>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    handleEditarSesion(
                      sesion
                    )
                  }
                >
                  Editar
                </button>

                {' '}

                <button
                  type="button"
                  onClick={() =>
                    handleEliminarSesion(
                      sesion
                    )
                  }
                >
                  Eliminar
                </button>
              </div>

            </article>
          ))}
        </div>
      )}
    </section>
  )
}