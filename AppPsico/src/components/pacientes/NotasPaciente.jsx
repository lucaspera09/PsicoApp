import { useEffect, useState } from 'react'

import api from '../../api/api.js'
import CrearNotaForm from './CrearNotaForm.jsx'
import EditarNotaForm from './EditarNotaForm.jsx'

export default function NotasPaciente({
  pacienteId
}) {
  const [notas, setNotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [
    mostrarFormulario,
    setMostrarFormulario
  ] = useState(false)

  const [
    notaEditando,
    setNotaEditando
  ] = useState(null)

  useEffect(() => {
    const cargarNotas = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(
          `/notas/paciente/${pacienteId}`
        )

        const notasRecibidas =
          response.data?.data || response.data

        setNotas(
          Array.isArray(notasRecibidas)
            ? notasRecibidas
            : []
        )
      } catch (error) {
        console.error(
          'Error al cargar notas:',
          error
        )

        setError(
          error.response?.data?.message ||
          'No se pudieron cargar las notas'
        )
      } finally {
        setLoading(false)
      }
    }

    if (pacienteId) {
      cargarNotas()
    }
  }, [pacienteId])

  const handleNotaCreada = (nuevaNota) => {
    setNotas((prev) => [
      nuevaNota,
      ...prev
    ])

    setMostrarFormulario(false)
  }

  const handleCancelar = () => {
    setMostrarFormulario(false)
  }

  const handleEditarNota = (nota) => {
    setMostrarFormulario(false)
    setNotaEditando(nota)
  }

  const handleNotaActualizada = (
    notaActualizada
  ) => {
    setNotas((prev) =>
      prev.map((nota) =>
        nota._id === notaActualizada._id
          ? notaActualizada
          : nota
      )
    )

    setNotaEditando(null)
  }

  const handleCancelarEdicion = () => {
    setNotaEditando(null)
  }

  const mostrarTipo = (tipo) => {
    const tipos = {
      entrevista: 'Entrevista',
      llamada: 'Llamada',
      comentario_padres: 'Comentario de padres',
      reunion: 'Reunión',
      observacion: 'Observación',
      otro: 'Otro'
    }

    return tipos[tipo] || tipo
  }

  const handleEliminarNota = async (nota) => {
    const confirmado = window.confirm(
      `¿Querés eliminar la nota "${nota.titulo}"?`
    )

    if (!confirmado) {
      return
    }

    try {
      await api.delete(
        `/notas/${nota._id}`
      )

      setNotas((prev) =>
        prev.filter(
          (item) => item._id !== nota._id
        )
      )

      if (notaEditando?._id === nota._id) {
        setNotaEditando(null)
      }
    } catch (error) {
      console.error(
        'Error al eliminar nota:',
        error
      )

      alert(
        error.response?.data?.message ||
        'No se pudo eliminar la nota'
      )
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return 'Sin fecha'
    }

    return new Date(fecha)
      .toLocaleDateString(
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
      <section className="notes-section">
        <h2>Notas y entrevistas</h2>
        <p>Cargando notas...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="notes-section">
        <h2>Notas y entrevistas</h2>
        <p>{error}</p>
      </section>
    )
  }

  return (
    <section className="notes-section">

      <div className="notes-header">

        <div>
          <p className="notes-eyebrow">
            Seguimiento
          </p>

          <h2>
            Notas y entrevistas
          </h2>

          <p>
            Entrevistas, llamadas,
            reuniones y observaciones
            relacionadas al paciente.
          </p>
        </div>

        {!mostrarFormulario &&
          !notaEditando && (
            <button
              type="button"
              className="notes-new-button"
              onClick={() =>
                setMostrarFormulario(true)
              }
            >
              + Nueva nota
            </button>
          )}

      </div>

      {mostrarFormulario && (
        <div className="notes-form-wrapper">
          <CrearNotaForm
            pacienteId={pacienteId}
            onCreated={handleNotaCreada}
            onCancel={handleCancelar}
          />
        </div>
      )}

      {notaEditando && (
        <div className="notes-form-wrapper">
          <EditarNotaForm
            nota={notaEditando}
            onUpdated={handleNotaActualizada}
            onCancel={handleCancelarEdicion}
          />
        </div>
      )}

      {notas.length === 0 ? (
        <div className="notes-empty">

          <div className="notes-empty-icon">
            ✎
          </div>

          <h3>
            No hay notas registradas
          </h3>

          <p>
            Las entrevistas y observaciones
            aparecerán acá.
          </p>

        </div>
      ) : (
        <div className="notes-list">

          {notas.map((nota) => (
            <article
              key={nota._id}
              className="note-card"
            >

              <div className="note-card-header">

                <div>
                  <span className="note-type-badge">
                    {mostrarTipo(nota.tipo)}
                  </span>

                  <h3>
                    {nota.titulo}
                  </h3>

                  <span className="note-date">
                    {formatearFecha(nota.fecha)}
                  </span>
                </div>

                <div className="note-actions">

                  <button
                    type="button"
                    onClick={() =>
                      handleEditarNota(nota)
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="note-delete"
                    onClick={() =>
                      handleEliminarNota(nota)
                    }
                  >
                    Eliminar
                  </button>

                </div>

              </div>

              <div className="note-content">
                {nota.contenido ||
                  'Sin contenido'}
              </div>

            </article>
          ))}

        </div>
      )}

    </section>
  )
}