import { useEffect, useState } from 'react'

import api from '../../api/api.js'
import CrearSesionForm from './CrearSesionForm.jsx'
import EditarSesionForm from './EditarSesionForm.jsx'

export default function SesionesPaciente({
  pacienteId
}) {
  const [
    sesiones,
    setSesiones
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
    sesionEditando,
    setSesionEditando
  ] = useState(null)

  useEffect(() => {
    const cargarSesiones = async () => {
      try {
        setLoading(true)
        setError(null)

        const response =
          await api.get(
            `/sesiones/paciente/${pacienteId}`
          )

        const sesionesRecibidas =
          response.data?.data ||
          response.data

        setSesiones(
          Array.isArray(
            sesionesRecibidas
          )
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

  const handleEditarSesion = (
    sesion
  ) => {
    setMostrarFormulario(false)
    setSesionEditando(sesion)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleSesionActualizada = (
    sesionActualizada
  ) => {
    setSesiones((prev) =>
      prev.map((sesion) =>
        sesion._id ===
        sesionActualizada._id
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
    const fecha =
      sesion.fecha
        ? new Date(
            sesion.fecha
          ).toLocaleDateString(
            'es-UY'
          )
        : ''

    const confirmado =
      window.confirm(
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
            item._id !==
            sesion._id
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

  const formatearFecha = (
    fecha
  ) => {
    if (!fecha) {
      return 'Sin fecha'
    }

    return new Date(
      fecha
    ).toLocaleDateString(
      'es-UY',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    )
  }

  if (loading) {
    return (
      <section className="sessions-section">
        <h2>
          Sesiones
        </h2>

        <p>
          Cargando sesiones...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="sessions-section">
        <h2>
          Sesiones
        </h2>

        <p>
          {error}
        </p>
      </section>
    )
  }

  return (
    <section className="sessions-section">

      {/* HEADER */}

      <div className="sessions-header">

        <div>
          <p className="sessions-eyebrow">
            Evolución
          </p>

          <h2>
            Sesiones
          </h2>

          <p>
            Historial de trabajo
            realizado con el paciente.
          </p>
        </div>

        {!mostrarFormulario &&
          !sesionEditando && (
            <button
              type="button"
              className="sessions-new-button"
              onClick={() =>
                setMostrarFormulario(
                  true
                )
              }
            >
              + Nueva sesión
            </button>
          )}

      </div>

      {/* FORMULARIO CREAR */}

      {mostrarFormulario && (
        <div className="sessions-form-wrapper">

          <CrearSesionForm
            pacienteId={
              pacienteId
            }
            onCreated={
              handleSesionCreada
            }
            onCancel={
              handleCancelar
            }
          />

        </div>
      )}

      {/* FORMULARIO EDITAR */}

      {sesionEditando && (
        <div className="sessions-form-wrapper">

          <EditarSesionForm
            sesion={
              sesionEditando
            }
            onUpdated={
              handleSesionActualizada
            }
            onCancel={
              handleCancelarEdicion
            }
          />

        </div>
      )}

      {/* VACÍO */}

      {sesiones.length === 0 ? (
        <div className="sessions-empty">

          <div className="sessions-empty-icon">
            📝
          </div>

          <h3>
            Todavía no hay sesiones
          </h3>

          <p>
            Cuando registres una sesión,
            aparecerá en este historial.
          </p>

        </div>
      ) : (

        /* HISTORIAL */

        <div className="sessions-list">

          {sesiones.map(
            (sesion) => (
              <article
                key={
                  sesion._id
                }
                className="session-card"
              >

                {/* CABECERA */}

                <div className="session-card-header">

                  <div>
                    <span className="session-date-label">
                      Sesión
                    </span>

                    <h3>
                      {formatearFecha(
                        sesion.fecha
                      )}
                    </h3>
                  </div>

                  <div className="session-card-actions-top">

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

                    <button
                      type="button"
                      className="session-delete-button"
                      onClick={() =>
                        handleEliminarSesion(
                          sesion
                        )
                      }
                    >
                      Eliminar
                    </button>

                  </div>

                </div>

                {/* ÁREAS */}

                <div className="session-block">

                  <span className="session-block-label">
                    Áreas trabajadas
                  </span>

                  {sesion.areas?.length >
                  0 ? (
                    <div className="session-tags">

                      {sesion.areas.map(
                        (
                          area,
                          index
                        ) => (
                          <span
                            key={
                              `${area}-${index}`
                            }
                            className="session-tag"
                          >
                            {area}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="session-empty-text">
                      Sin áreas registradas
                    </p>
                  )}

                </div>

                {/* ACTIVIDADES */}

                <div className="session-block">

                  <span className="session-block-label">
                    Actividades
                  </span>

                  {sesion.actividades?.length >
                  0 ? (
                    <ul className="session-activities">

                      {sesion.actividades.map(
                        (
                          actividad,
                          index
                        ) => (
                          <li
                            key={
                              `${actividad}-${index}`
                            }
                          >
                            {actividad}
                          </li>
                        )
                      )}

                    </ul>
                  ) : (
                    <p className="session-empty-text">
                      Sin actividades registradas
                    </p>
                  )}

                </div>

                {/* OBSERVACIÓN */}

                <div className="session-block">

                  <span className="session-block-label">
                    Observación
                  </span>

                  <p className="session-text">
                    {sesion.observacion ||
                      'Sin observaciones'}
                  </p>

                </div>

                {/* PROXIMA */}

                <div className="session-next">

                  <span>
                    Para la próxima sesión
                  </span>

                  <p>
                    {sesion.proximaSesion ||
                      'Sin indicaciones'}
                  </p>

                </div>

              </article>
            )
          )}

        </div>
      )}

    </section>
  )
}