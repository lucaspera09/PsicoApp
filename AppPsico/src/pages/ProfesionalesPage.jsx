import {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  useLocation
} from 'react-router'

import api from '../api/api.js'

import EditarProfesionalForm from '../components/admin/EditarProfesionalForm.jsx'

export default function ProfesionalesPage() {
  const location =
    useLocation()

  const [
    profesionales,
    setProfesionales
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
    seccionActiva,
    setSeccionActiva
  ] = useState(
    location.state
      ?.seccionInicial ||
      'pendientes'
  )

  const [
    profesionalEditando,
    setProfesionalEditando
  ] = useState(null)

  const [
    procesandoId,
    setProcesandoId
  ] = useState(null)

  /*
    CARGAR PROFESIONALES
  */

  useEffect(() => {
    const cargarProfesionales =
      async () => {
        try {
          setLoading(true)
          setError(null)

          const response =
            await api.get(
              '/profesionales',
              {
                params: {
                  limit: 100
                }
              }
            )

          const recibidos =
            response.data?.data ||
            response.data

          setProfesionales(
            Array.isArray(
              recibidos
            )
              ? recibidos
              : []
          )
        } catch (error) {
          console.error(
            'Error al cargar profesionales:',
            error
          )

          setError(
            error.response
              ?.data
              ?.message ||
            'No se pudieron cargar los profesionales'
          )
        } finally {
          setLoading(false)
        }
      }

    cargarProfesionales()
  }, [])

  /*
    ESTADO DE CUENTA

    Compatibilidad:
    usuarios viejos sin estadoCuenta
    se consideran aprobados.
  */

  const obtenerEstadoCuenta = (
    profesional
  ) => {
    return (
      profesional.user
        ?.estadoCuenta ||
      'aprobado'
    )
  }

  /*
    CONTADORES
  */

  const cantidadPendientes =
    useMemo(
      () =>
        profesionales.filter(
          (profesional) =>
            obtenerEstadoCuenta(
              profesional
            ) ===
            'pendiente'
        ).length,
      [profesionales]
    )

  const cantidadAprobados =
    useMemo(
      () =>
        profesionales.filter(
          (profesional) =>
            obtenerEstadoCuenta(
              profesional
            ) ===
            'aprobado'
        ).length,
      [profesionales]
    )

  const cantidadRechazados =
    useMemo(
      () =>
        profesionales.filter(
          (profesional) =>
            obtenerEstadoCuenta(
              profesional
            ) ===
            'rechazado'
        ).length,
      [profesionales]
    )

  /*
    FILTRADO POR PESTAÑA +
    BUSCADOR
  */

  const profesionalesFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase()

      return profesionales.filter(
        (profesional) => {
          const estado =
            obtenerEstadoCuenta(
              profesional
            )

          if (
            seccionActiva ===
              'pendientes' &&
            estado !== 'pendiente'
          ) {
            return false
          }

          if (
            seccionActiva ===
              'aprobados' &&
            estado !== 'aprobado'
          ) {
            return false
          }

          if (
            seccionActiva ===
              'rechazados' &&
            estado !== 'rechazado'
          ) {
            return false
          }

          if (!texto) {
            return true
          }

          const nombre =
            `${
              profesional.nombre ||
              ''
            } ${
              profesional.apellido ||
              ''
            }`
              .toLowerCase()

          const profesion =
            (
              profesional.profesion ||
              ''
            ).toLowerCase()

          const email =
            (
              profesional.user
                ?.email ||
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
      busqueda,
      seccionActiva
    ])

  /*
    APROBAR
  */

  const handleAprobar =
    async (profesional) => {
      const confirmado =
        window.confirm(
          `¿Querés aprobar la cuenta de ${profesional.nombre} ${profesional.apellido}?`
        )

      if (!confirmado) {
        return
      }

      try {
        setProcesandoId(
          profesional._id
        )

        const response =
          await api.patch(
            `/profesionales/${profesional._id}/aprobar`
          )

        const actualizado =
          response.data?.data ||
          response.data

        setProfesionales(
          (prev) =>
            prev.map(
              (item) =>
                item._id ===
                profesional._id
                  ? actualizado
                  : item
            )
        )

      } catch (error) {
        console.error(
          'Error al aprobar solicitud:',
          error
        )

        alert(
          error.response
            ?.data
            ?.message ||
          'No se pudo aprobar la solicitud'
        )
      } finally {
        setProcesandoId(null)
      }
    }

  /*
    RECHAZAR
  */

  const handleRechazar =
    async (profesional) => {
      const confirmado =
        window.confirm(
          `¿Querés rechazar la solicitud de ${profesional.nombre} ${profesional.apellido}?`
        )

      if (!confirmado) {
        return
      }

      try {
        setProcesandoId(
          profesional._id
        )

        const response =
          await api.patch(
            `/profesionales/${profesional._id}/rechazar`
          )

        const actualizado =
          response.data?.data ||
          response.data

        setProfesionales(
          (prev) =>
            prev.map(
              (item) =>
                item._id ===
                profesional._id
                  ? actualizado
                  : item
            )
        )

      } catch (error) {
        console.error(
          'Error al rechazar solicitud:',
          error
        )

        alert(
          error.response
            ?.data
            ?.message ||
          'No se pudo rechazar la solicitud'
        )
      } finally {
        setProcesandoId(null)
      }
    }

  /*
    EDITAR
  */

  const handleEditar = (
    profesional
  ) => {
    setProfesionalEditando(
      profesional
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleProfesionalActualizado =
    (
      profesionalActualizado
    ) => {
      setProfesionales(
        (prev) =>
          prev.map(
            (profesional) =>
              profesional._id ===
              profesionalActualizado._id
                ? profesionalActualizado
                : profesional
          )
      )

      setProfesionalEditando(
        null
      )
    }

  /*
    ACTIVAR / DESACTIVAR
  */

  const handleCambiarEstado =
    async (profesional) => {
      const nuevoEstado =
        !profesional.activo

      const mensaje =
        nuevoEstado
          ? `¿Querés activar a ${profesional.nombre} ${profesional.apellido}?`
          : `¿Querés desactivar a ${profesional.nombre} ${profesional.apellido}?`

      if (
        !window.confirm(mensaje)
      ) {
        return
      }

      try {
        setProcesandoId(
          profesional._id
        )

        const response =
          await api.patch(
            `/profesionales/${profesional._id}/status`,
            {
              activo:
                nuevoEstado
            }
          )

        const actualizado =
          response.data?.data ||
          response.data

        setProfesionales(
          (prev) =>
            prev.map(
              (item) =>
                item._id ===
                profesional._id
                  ? actualizado
                  : item
            )
        )

      } catch (error) {
        console.error(
          'Error al cambiar estado:',
          error
        )

        alert(
          error.response
            ?.data
            ?.message ||
          'No se pudo cambiar el estado del profesional'
        )
      } finally {
        setProcesandoId(null)
      }
    }

  const mostrarFechaSolicitud = (
    profesional
  ) => {
    const fecha =
      profesional.createdAt ||
      profesional.user?.createdAt

    if (!fecha) {
      return 'Sin fecha'
    }

    return new Date(
      fecha
    ).toLocaleDateString(
      'es-UY',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    )
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

      {/* HEADER */}

      <section className="professionals-header">

        <div>

          <p className="professionals-eyebrow">
            Nexo Administración
          </p>

          <h1>
            Profesionales
          </h1>

          <p>
            Revisá solicitudes y administrá
            las cuentas habilitadas.
          </p>

        </div>

      </section>

      {/* EDICIÓN */}

      {profesionalEditando && (
        <section className="card professionals-form-card">

          <EditarProfesionalForm
            profesional={
              profesionalEditando
            }
            onUpdated={
              handleProfesionalActualizado
            }
            onCancel={() =>
              setProfesionalEditando(
                null
              )
            }
          />

        </section>
      )}

      {/* PESTAÑAS */}

      <nav className="professionals-tabs">

        <button
          type="button"
          className={
            seccionActiva ===
            'pendientes'
              ? 'professionals-tab active'
              : 'professionals-tab'
          }
          onClick={() =>
            setSeccionActiva(
              'pendientes'
            )
          }
        >
          Solicitudes

          {cantidadPendientes > 0 && (
            <span>
              {cantidadPendientes}
            </span>
          )}
        </button>

        <button
          type="button"
          className={
            seccionActiva ===
            'aprobados'
              ? 'professionals-tab active'
              : 'professionals-tab'
          }
          onClick={() =>
            setSeccionActiva(
              'aprobados'
            )
          }
        >
          Profesionales

          <span>
            {cantidadAprobados}
          </span>
        </button>

        <button
          type="button"
          className={
            seccionActiva ===
            'rechazados'
              ? 'professionals-tab active'
              : 'professionals-tab'
          }
          onClick={() =>
            setSeccionActiva(
              'rechazados'
            )
          }
        >
          Rechazadas

          {cantidadRechazados > 0 && (
            <span>
              {cantidadRechazados}
            </span>
          )}
        </button>

      </nav>

      {/* BUSCADOR */}

      <section className="professionals-toolbar">

        <div className="professionals-search">

          <span>
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
            placeholder="Buscar por nombre, profesión o email..."
          />

        </div>

        <span className="professionals-count">
          {
            profesionalesFiltrados.length
          }{' '}
          {profesionalesFiltrados.length ===
          1
            ? 'resultado'
            : 'resultados'}
        </span>

      </section>

      {/* VACÍO */}

      {profesionalesFiltrados.length ===
      0 ? (

        <section className="professionals-empty">

          <div className="professionals-empty-icon">
            {seccionActiva ===
            'pendientes'
              ? '✓'
              : '♙'}
          </div>

          <h2>
            {seccionActiva ===
            'pendientes'
              ? 'No hay solicitudes pendientes'
              : seccionActiva ===
                'rechazados'
              ? 'No hay solicitudes rechazadas'
              : 'No encontramos profesionales'}
          </h2>

          <p>
            {seccionActiva ===
            'pendientes'
              ? 'Cuando alguien solicite acceso a Nexo aparecerá acá.'
              : 'Probá con otra búsqueda.'}
          </p>

        </section>

      ) : (

        <section className="professionals-grid">

          {profesionalesFiltrados.map(
            (profesional) => {
              const estadoCuenta =
                obtenerEstadoCuenta(
                  profesional
                )

              const procesando =
                procesandoId ===
                profesional._id

              return (
                <article
                  key={
                    profesional._id
                  }
                  className={
                    estadoCuenta ===
                    'pendiente'
                      ? 'professional-card professional-request-card'
                      : 'professional-card'
                  }
                >

                  {/* HEADER */}

                  <div className="professional-card-header">

                    <div className="professional-avatar">

                      {profesional.nombre
                        ?.charAt(0)
                        ?.toUpperCase()}

                      {profesional.apellido
                        ?.charAt(0)
                        ?.toUpperCase()}

                    </div>

                    {estadoCuenta ===
                    'pendiente' ? (

                      <span className="professional-status pending">
                        Pendiente
                      </span>

                    ) : estadoCuenta ===
                      'rechazado' ? (

                      <span className="professional-status rejected">
                        Rechazada
                      </span>

                    ) : (

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

                    )}

                  </div>

                  {/* INFO */}

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
                          {profesional.user
                            ?.email ||
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

                      {estadoCuenta ===
                        'pendiente' && (

                        <div>

                          <span>
                            Solicitud
                          </span>

                          <strong>
                            {mostrarFechaSolicitud(
                              profesional
                            )}
                          </strong>

                        </div>

                      )}

                    </div>

                  </div>

                  {/* SOLICITUD */}

                  {estadoCuenta ===
                    'pendiente' && (

                    <div className="professional-request-actions">

                      <button
                        type="button"
                        className="professional-request-approve"
                        disabled={
                          procesando
                        }
                        onClick={() =>
                          handleAprobar(
                            profesional
                          )
                        }
                      >
                        {procesando
                          ? 'Procesando...'
                          : '✓ Aprobar'}
                      </button>

                      <button
                        type="button"
                        className="professional-request-reject"
                        disabled={
                          procesando
                        }
                        onClick={() =>
                          handleRechazar(
                            profesional
                          )
                        }
                      >
                        Rechazar
                      </button>

                    </div>

                  )}

                  {/* PROFESIONAL APROBADO */}

                  {estadoCuenta ===
                    'aprobado' && (

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
                        Editar datos
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
                          procesando
                        }
                      >
                        {procesando
                          ? 'Guardando...'
                          : profesional.activo
                          ? 'Desactivar'
                          : 'Activar'}
                      </button>

                    </div>

                  )}

                  {/* RECHAZADO */}

                  {estadoCuenta ===
                    'rechazado' && (

                    <div className="professional-rejected-message">
                      Esta solicitud no tiene
                      acceso a Nexo.
                    </div>

                  )}

                </article>
              )
            }
          )}

        </section>

      )}

    </main>
  )
}