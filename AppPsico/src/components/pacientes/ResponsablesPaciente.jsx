import { useEffect, useState } from 'react'

import api from '../../api/api.js'
import CrearResponsableForm from './CrearResponsableForm.jsx'
import EditarResponsableForm from './EditarResponsableForm.jsx'

export default function ResponsablesPaciente({
  pacienteId
}) {
  const [
    responsables,
    setResponsables
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

        const response =
          await api.get(
            `/responsables/paciente/${pacienteId}`
          )

        const responsablesRecibidos =
          response.data?.data ||
          response.data

        setResponsables(
          Array.isArray(
            responsablesRecibidos
          )
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
    setResponsables(
      (prev) => [
        nuevoResponsable,
        ...prev
      ]
    )

    setMostrarFormulario(false)
  }

  const handleCancelar = () => {
    setMostrarFormulario(false)
  }

  const handleEditarResponsable = (
    responsable
  ) => {
    setMostrarFormulario(false)
    setResponsableEditando(
      responsable
    )
  }

  const handleResponsableActualizado = (
    responsableActualizado
  ) => {
    setResponsables(
      (prev) =>
        prev.map(
          (responsable) =>
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

  const handleEliminarResponsable =
    async (responsable) => {
      const confirmado =
        window.confirm(
          `¿Querés eliminar a ${responsable.nombre} ${responsable.apellido}?`
        )

      if (!confirmado) {
        return
      }

      try {
        await api.delete(
          `/responsables/${responsable._id}`
        )

        setResponsables(
          (prev) =>
            prev.filter(
              (item) =>
                item._id !==
                responsable._id
            )
        )

        if (
          responsableEditando?._id ===
          responsable._id
        ) {
          setResponsableEditando(
            null
          )
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

  const obtenerIniciales = (
    responsable
  ) => {
    const nombre =
      responsable.nombre
        ?.charAt(0)
        ?.toUpperCase() ||
      ''

    const apellido =
      responsable.apellido
        ?.charAt(0)
        ?.toUpperCase() ||
      ''

    return `${nombre}${apellido}`
  }

  if (loading) {
    return (
      <section className="responsibles-section">
        <h2>
          Responsables
        </h2>

        <p>
          Cargando responsables...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="responsibles-section">
        <h2>
          Responsables
        </h2>

        <p>
          {error}
        </p>
      </section>
    )
  }

  return (
    <section className="responsibles-section">

      {/* HEADER */}

      <div className="responsibles-header">

        <div>
          <p className="responsibles-eyebrow">
            Contactos
          </p>

          <h2>
            Responsables
          </h2>

          <p>
            Familiares o referentes
            vinculados al paciente.
          </p>
        </div>

        {!mostrarFormulario &&
          !responsableEditando && (
            <button
              type="button"
              className="responsibles-new-button"
              onClick={() =>
                setMostrarFormulario(
                  true
                )
              }
            >
              + Nuevo responsable
            </button>
          )}

      </div>

      {/* CREAR */}

      {mostrarFormulario && (
        <div className="responsibles-form-wrapper">

          <CrearResponsableForm
            pacienteId={
              pacienteId
            }
            onCreated={
              handleResponsableCreado
            }
            onCancel={
              handleCancelar
            }
          />

        </div>
      )}

      {/* EDITAR */}

      {responsableEditando && (
        <div className="responsibles-form-wrapper">

          <EditarResponsableForm
            responsable={
              responsableEditando
            }
            onUpdated={
              handleResponsableActualizado
            }
            onCancel={
              handleCancelarEdicion
            }
          />

        </div>
      )}

      {/* VACÍO */}

      {responsables.length === 0 ? (
        <div className="responsibles-empty">

          <div className="responsibles-empty-icon">
            ♡
          </div>

          <h3>
            Sin responsables registrados
          </h3>

          <p>
            Agregá un familiar,
            tutor o contacto de referencia.
          </p>

        </div>
      ) : (
        <div className="responsibles-grid">

          {responsables.map(
            (responsable) => (
              <article
                key={
                  responsable._id
                }
                className="responsible-card"
              >

                {/* CABECERA */}

                <div className="responsible-card-header">

                  <div className="responsible-avatar">
                    {obtenerIniciales(
                      responsable
                    )}
                  </div>

                  <div className="responsible-main-info">

                    <h3>
                      {responsable.nombre}{' '}
                      {responsable.apellido}
                    </h3>

                    <span>
                      {responsable.relacion ||
                        'Relación sin especificar'}
                    </span>

                  </div>

                </div>

                {/* BADGES */}

                {(responsable.principal ||
                  responsable.contactoEmergencia) && (
                  <div className="responsible-badges">

                    {responsable.principal && (
                      <span className="responsible-badge primary">
                        Responsable principal
                      </span>
                    )}

                    {responsable.contactoEmergencia && (
                      <span className="responsible-badge emergency">
                        Emergencia
                      </span>
                    )}

                  </div>
                )}

                {/* DATOS */}

                <div className="responsible-contact-list">

                  <div>
                    <span>
                      Teléfono
                    </span>

                    <strong>
                      {responsable.telefono ||
                        'Sin teléfono'}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Email
                    </span>

                    <strong>
                      {responsable.email ||
                        'Sin email'}
                    </strong>
                  </div>

                </div>

                {/* OBSERVACIONES */}

                {responsable.observaciones && (
                  <div className="responsible-notes">

                    <span>
                      Observaciones
                    </span>

                    <p>
                      {
                        responsable.observaciones
                      }
                    </p>

                  </div>
                )}

                {/* ACCIONES */}

                <div className="responsible-actions">

                  <button
                    type="button"
                    className="responsible-edit"
                    onClick={() =>
                      handleEditarResponsable(
                        responsable
                      )
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="responsible-delete"
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
            )
          )}

        </div>
      )}

    </section>
  )
}