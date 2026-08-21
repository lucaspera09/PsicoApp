import {
  useEffect,
  useState
} from 'react'

import { Link } from 'react-router'
import { useSelector } from 'react-redux'

import api from '../../api/api.js'

export default function DashboardAdmin() {
  const { user } = useSelector(
    (state) => state.auth
  )

  const [
    solicitudesPendientes,
    setSolicitudesPendientes
  ] = useState(0)

  const [
    loading,
    setLoading
  ] = useState(true)

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        setLoading(true)

        const response =
          await api.get(
            '/profesionales',
            {
              params: {
                estadoCuenta:
                  'pendiente',

                page: 1,
                limit: 1
              }
            }
          )

        setSolicitudesPendientes(
          response.data?.total || 0
        )
      } catch (error) {
        console.error(
          'Error al cargar solicitudes:',
          error
        )

        setSolicitudesPendientes(0)
      } finally {
        setLoading(false)
      }
    }

    cargarSolicitudes()
  }, [])

  return (
    <main className="admin-dashboard-page">

      {/* HEADER */}

      <section className="admin-dashboard-hero">

        <div>

          <p className="admin-dashboard-eyebrow">
            Nexo Administración
          </p>

          <h1>
            Panel de administración
          </h1>

          <p>
            Gestioná profesionales
            y solicitudes de acceso.
          </p>

        </div>

      </section>

      {/* RESUMEN */}

      <section className="admin-dashboard-summary">

        <Link
          to="/profesionales"
          state={{
            seccionInicial:
              'pendientes'
          }}
          className="admin-summary-card admin-summary-card-link"
        >

          <div className="admin-summary-icon">
            ◷
          </div>

          <div>

            <span>
              Solicitudes pendientes
            </span>

            <strong>
              {loading
                ? '...'
                : solicitudesPendientes}
            </strong>

          </div>

          {solicitudesPendientes > 0 && (
            <span className="admin-request-alert">
              Nueva
            </span>
          )}

        </Link>

        <div className="admin-summary-card">

          <div className="admin-summary-icon">
            ✓
          </div>

          <div>

            <span>
              Sistema
            </span>

            <strong>
              Administración activa
            </strong>

          </div>

        </div>

      </section>

      {/* ACCIONES */}

      <section>

        <div className="admin-dashboard-section-header">

          <div>

            <h2>
              Gestión de Nexo
            </h2>

            <p>
              Revisá solicitudes y administrá
              las cuentas habilitadas.
            </p>

          </div>

        </div>

        <div className="admin-dashboard-actions">

          <Link
            to="/profesionales"
            state={{
              seccionInicial:
                'pendientes'
            }}
            className="admin-dashboard-action-card"
          >

            <div className="admin-dashboard-action-icon">
              ◷
            </div>

            <div className="admin-dashboard-action-content">

              <strong>
                Solicitudes de acceso
              </strong>

              <span>
                Revisá quién quiere registrarse
                en Nexo y aprobá o rechazá
                su solicitud.
              </span>

            </div>

            {solicitudesPendientes > 0 && (
              <span className="admin-dashboard-request-count">
                {solicitudesPendientes}
              </span>
            )}

            <span className="admin-dashboard-arrow">
              →
            </span>

          </Link>

          <Link
            to="/profesionales"
            state={{
              seccionInicial:
                'aprobados'
            }}
            className="admin-dashboard-action-card"
          >

            <div className="admin-dashboard-action-icon">
              ♙
            </div>

            <div className="admin-dashboard-action-content">

              <strong>
                Profesionales
              </strong>

              <span>
                Consultá las cuentas aprobadas
                y administrá su acceso.
              </span>

            </div>

            <span className="admin-dashboard-arrow">
              →
            </span>

          </Link>

        </div>

      </section>

      {/* PRIVACIDAD */}

      <section className="admin-privacy-card">

        <div className="admin-privacy-icon">
          ◇
        </div>

        <div>

          <strong>
            Administración separada
          </strong>

          <p>
            Desde este panel administrás cuentas
            profesionales. Los pacientes y sus
            registros clínicos no forman parte
            del panel administrativo.
          </p>

        </div>

      </section>

    </main>
  )
}