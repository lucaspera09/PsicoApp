import { useEffect, useState } from 'react'

import api from '../../api/api.js'
import CrearResponsableForm from './CrearResponsableForm.jsx'
import EditarResponsableForm from './EditarResponsableForm.jsx'

export default function ResponsablesPaciente({
  pacienteId
}) {
  const [responsables, setResponsables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [
    mostrarFormulario,
    setMostrarFormulario
  ] = useState(false)

  const [
    responsableEditando,
    setResponsableEditando
  ] = useState(null)

  useEffect(() => {
    const cargarResponsables = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(
          `/responsables/paciente/${pacienteId}`
        )

        const responsablesRecibidos =
          response.data?.data || response.data

        setResponsables(
          Array.isArray(responsablesRecibidos)
            ? responsablesRecibidos
            : []
        )
      } catch (error) {
        console.error(
          'Error al cargar responsables:',
          error
        )

        setError(
          error.response?.data?.message ||
          'No se pudieron cargar los responsables'
        )
      } finally {
        setLoading(false)
      }
    }

    if (pacienteId) {
      cargarResponsables()
    }
  }, [pacienteId])

  const handleResponsableCreado = (
    nuevoResponsable
  ) => {
    setResponsables((prev) => [
      nuevoResponsable,
      ...prev
    ])

    setMostrarFormulario(false)
  }

  const handleCancelar = () => {
    setMostrarFormulario(false)
  }

  const handleEditarResponsable = (
    responsable
  ) => {
    setMostrarFormulario(false)
    setResponsableEditando(responsable)
  }

  const handleResponsableActualizado = (
    responsableActualizado
  ) => {
    setResponsables((prev) =>
      prev.map((responsable) =>
        responsable._id ===
        responsableActualizado._id
          ? responsableActualizado
          : responsable
      )
    )

    setResponsableEditando(null)
  }

  const handleCancelarEdicion = () => {
    setResponsableEditando(null)
  }

  const handleEliminarResponsable = async (
    responsable
  ) => {
    const confirmado = window.confirm(
      `¿Querés eliminar a ${responsable.nombre} ${responsable.apellido}?`
    )

    if (!confirmado) {
      return
    }

    try {
      await api.delete(
        `/responsables/${responsable._id}`
      )

      setResponsables((prev) =>
        prev.filter(
          (item) =>
            item._id !== responsable._id
        )
      )

      if (
        responsableEditando?._id ===
        responsable._id
      ) {
        setResponsableEditando(null)
      }
    } catch (error) {
      console.error(
        'Error al eliminar responsable:',
        error
      )

      alert(
        error.response?.data?.message ||
        'No se pudo eliminar el responsable'
      )
    }
  }

  if (loading) {
    return (
      <section>
        <h2>Responsables</h2>

        <p>Cargando responsables...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2>Responsables</h2>

        <p>{error}</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Responsables</h2>

      {!mostrarFormulario &&
        !responsableEditando && (
          <button
            type="button"
            onClick={() =>
              setMostrarFormulario(true)
            }
          >
            + Nuevo responsable
          </button>
        )}

      {mostrarFormulario && (
        <CrearResponsableForm
          pacienteId={pacienteId}
          onCreated={handleResponsableCreado}
          onCancel={handleCancelar}
        />
      )}

      {responsableEditando && (
        <EditarResponsableForm
          responsable={responsableEditando}
          onUpdated={
            handleResponsableActualizado
          }
          onCancel={
            handleCancelarEdicion
          }
        />
      )}

      {responsables.length === 0 ? (
        <p>
          No hay responsables registrados.
        </p>
      ) : (
        <div>
          {responsables.map((responsable) => (
            <article key={responsable._id}>

              <h3>
                {responsable.nombre}{' '}
                {responsable.apellido}
              </h3>

              <p>
                <strong>
                  Relación:
                </strong>{' '}
                {responsable.relacion ||
                  'Sin especificar'}
              </p>

              <p>
                <strong>
                  Teléfono:
                </strong>{' '}
                {responsable.telefono ||
                  'Sin teléfono'}
              </p>

              <p>
                <strong>
                  Email:
                </strong>{' '}
                {responsable.email ||
                  'Sin email'}
              </p>

              <p>
                <strong>
                  Responsable principal:
                </strong>{' '}
                {responsable.principal
                  ? 'Sí'
                  : 'No'}
              </p>

              <p>
                <strong>
                  Contacto de emergencia:
                </strong>{' '}
                {responsable.contactoEmergencia
                  ? 'Sí'
                  : 'No'}
              </p>

              {responsable.observaciones && (
                <p>
                  <strong>
                    Observaciones:
                  </strong>{' '}
                  {responsable.observaciones}
                </p>
              )}

              <div>
                <button
                  type="button"
                  onClick={() =>
                    handleEditarResponsable(
                      responsable
                    )
                  }
                >
                  Editar
                </button>

                {' '}

                <button
                  type="button"
                  onClick={() =>
                    handleEliminarResponsable(
                      responsable
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