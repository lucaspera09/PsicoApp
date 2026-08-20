import { useEffect, useMemo, useState } from 'react'

import api from '../api/api.js'

import CrearProfesionalForm from '../components/admin/CrearProfesionalForm.jsx'
import EditarProfesionalForm from '../components/admin/EditarProfesionalForm.jsx'

export default function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [
    mostrarFormulario,
    setMostrarFormulario
  ] = useState(false)

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

        const response =
          await api.get('/profesionales')

        const recibidos =
          response.data?.data ||
          response.data

        setProfesionales(
          Array.isArray(recibidos)
            ? recibidos
            : []
        )
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

  const profesionalesFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase()

      if (!texto) {
        return profesionales
      }

      return profesionales.filter(
        (profesional) => {
          const nombre =
            `${profesional.nombre || ''} ${profesional.apellido || ''}`
              .toLowerCase()

          const profesion =
            (
              profesional.profesion ||
              ''
            ).toLowerCase()

          const email =
            (
              profesional.user?.email ||
              ''
            ).toLowerCase()

          return (
            nombre.includes(texto) ||
            profesion.includes(texto) ||
            email.includes(texto)
          )
        }
      )
    }, [
      profesionales,
      busqueda
    ])

  const handleProfesionalCreado = (
    nuevoProfesional
  ) => {
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

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
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

  const handleCambiarEstado = async (
    profesional
  ) => {
    const nuevoEstado =
      !profesional.activo

    const mensaje =
      nuevoEstado
        ? `¿Querés activar a ${profesional.nombre} ${profesional.apellido}?`
        : `¿Querés desactivar a ${profesional.nombre} ${profesional.apellido}?`

    const confirmado =
      window.confirm(mensaje)

    if (!confirmado) {
      return
    }

    try {
      setCambiandoEstadoId(
        profesional._id
      )

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
      <main className="professionals-page">
        <p>
          Cargando profesionales...
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="professionals-page">
        <h1>
          Profesionales
        </h1>

        <p>
          {error}
        </p>
      </main>
    )
  }

  return (
    <main className="professionals-page">

      <section className="professionals-header">

        <div>
          <p className="professionals-eyebrow">
            Administración
          </p>

          <h1>
            Profesionales
          </h1>

          <p>
            Administrá las cuentas
            y el acceso de los profesionales.
          </p>
        </div>

        {!mostrarFormulario &&
          !profesionalEditando && (
            <button
              type="button"
              className="professionals-new-button"
              onClick={() =>
                setMostrarFormulario(true)
              }
            >
              + Nuevo profesional
            </button>
          )}

      </section>

      {mostrarFormulario && (
        <section className="card professionals-form-card">
          <CrearProfesionalForm
            onCreated={handleProfesionalCreado}
            onCancel={handleCancelarFormulario}
          />
        </section>
      )}

      {profesionalEditando && (
        <section className="card professionals-form-card">
          <EditarProfesionalForm
            profesional={profesionalEditando}
            onUpdated={handleProfesionalActualizado}
            onCancel={handleCancelarEdicion}
          />
        </section>
      )}

      <section className="professionals-toolbar">

        <div className="professionals-search">
          <span>
            ⌕
          </span>

          <input
            type="search"
            value={busqueda}
            onChange={(event) =>
              setBusqueda(
                event.target.value
              )
            }
            placeholder="Buscar por nombre, profesión o email..."
          />
        </div>

        <span className="professionals-count">
          {profesionalesFiltrados.length}{' '}
          {profesionalesFiltrados.length === 1
            ? 'profesional'
            : 'profesionales'}
        </span>

      </section>

      {profesionalesFiltrados.length === 0 ? (
        <section className="professionals-empty">

          <div className="professionals-empty-icon">
            ♙
          </div>

          <h2>
            No encontramos profesionales
          </h2>

          <p>
            Probá con otra búsqueda
            o agregá un profesional nuevo.
          </p>

        </section>
      ) : (
        <section className="professionals-grid">

          {profesionalesFiltrados.map(
            (profesional) => (
              <article
                key={profesional._id}
                className="professional-card"
              >

                <div className="professional-card-header">

                  <div className="professional-avatar">
                    {profesional.nombre
                      ?.charAt(0)
                      ?.toUpperCase()}

                    {profesional.apellido
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <span
                    className={
                      profesional.activo
                        ? 'professional-status active'
                        : 'professional-status inactive'
                    }
                  >
                    {profesional.activo
                      ? 'Activo'
                      : 'Inactivo'}
                  </span>

                </div>

                <div className="professional-card-body">

                  <h2>
                    {profesional.nombre}{' '}
                    {profesional.apellido}
                  </h2>

                  <span className="professional-role">
                    {profesional.profesion ||
                      'Profesión sin especificar'}
                  </span>

                  <div className="professional-info">

                    <div>
                      <span>
                        Email
                      </span>

                      <strong>
                        {profesional.user?.email ||
                          'Sin email'}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Teléfono
                      </span>

                      <strong>
                        {profesional.telefono ||
                          'Sin teléfono'}
                      </strong>
                    </div>

                  </div>

                </div>

                <div className="professional-actions">

                  <button
                    type="button"
                    className="professional-edit"
                    onClick={() =>
                      handleEditar(
                        profesional
                      )
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className={
                      profesional.activo
                        ? 'professional-state danger'
                        : 'professional-state success'
                    }
                    onClick={() =>
                      handleCambiarEstado(
                        profesional
                      )
                    }
                    disabled={
                      cambiandoEstadoId ===
                      profesional._id
                    }
                  >
                    {cambiandoEstadoId ===
                    profesional._id
                      ? 'Guardando...'
                      : profesional.activo
                      ? 'Desactivar'
                      : 'Activar'}
                  </button>

                </div>

              </article>
            )
          )}

        </section>
      )}

    </main>
  )
}