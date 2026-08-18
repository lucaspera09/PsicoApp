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
  if (loading) {
    return (
      <section>
        <h2>Notas y entrevistas</h2>

        <p>Cargando notas...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2>Notas y entrevistas</h2>

        <p>{error}</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Notas y entrevistas</h2>

      {!mostrarFormulario && !notaEditando && (
        <button
          type="button"
          onClick={() =>
            setMostrarFormulario(true)
          }
        >
          + Nueva nota
        </button>
      )}

      {mostrarFormulario && (
        <CrearNotaForm
          pacienteId={pacienteId}
          onCreated={handleNotaCreada}
          onCancel={handleCancelar}
        />
      )}

      {notaEditando && (
        <EditarNotaForm
          nota={notaEditando}
          onUpdated={handleNotaActualizada}
          onCancel={handleCancelarEdicion}
        />
      )}

      {notas.length === 0 ? (
        <p>
          No hay notas registradas.
        </p>
      ) : (
        <div>
          {notas.map((nota) => (
            <article key={nota._id}>

              <h3>
                {nota.titulo}
              </h3>

              <p>
                <strong>Tipo:</strong>{' '}
                {mostrarTipo(nota.tipo)}
              </p>

              <p>
                <strong>Fecha:</strong>{' '}
                {nota.fecha
                  ? new Date(
                      nota.fecha
                    ).toLocaleDateString(
                      'es-UY'
                    )
                  : 'Sin fecha'
                }
              </p>

              <p>
                <strong>Contenido:</strong>{' '}
                {nota.contenido}
              </p>

              <div>
  <button
    type="button"
    onClick={() =>
      handleEditarNota(nota)
    }
  >
    Editar
  </button>

  {' '}

  <button
    type="button"
    onClick={() =>
      handleEliminarNota(nota)
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