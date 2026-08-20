import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

import { logout } from '../../features/auth.slice.js'

export default function DashboardProfesional() {
  const dispatch = useDispatch()

  const { user } = useSelector(
    (state) => state.auth
  )

  const nombre =
    user?.profesional?.nombre ||
    user?.email ||
    'Profesional'

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <main className="dashboard-page">

      {/* HEADER */}

      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">
            Panel profesional
          </p>

          <h1>
            Hola, {nombre}
          </h1>

          <p>
            Tené a mano tu agenda,
            pacientes y accesos rápidos.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </section>

      {/* ACCIÓN PRINCIPAL */}

      <section className="dashboard-primary-action">
        <div>
          <span className="dashboard-primary-label">
            Acción rápida
          </span>

          <h2>
            Registrar una sesión
          </h2>

          <p>
            Entrá a la agenda,
            elegí el turno y registrá
            la sesión del paciente.
          </p>
        </div>

        <Link
          to="/agenda"
          className="dashboard-session-button"
        >
          📝 Registrar sesión
        </Link>
      </section>

      {/* ACCESOS */}

      <section>
        <div className="dashboard-section-heading">
          <div>
            <h2>
              Accesos rápidos
            </h2>

            <p>
              Lo que usás todos los días.
            </p>
          </div>
        </div>

        <div className="dashboard-actions-grid">

          <Link
            to="/agenda"
            className="dashboard-action-card"
          >
            <div className="dashboard-action-icon">
              ◫
            </div>

            <div>
              <strong>
                Agenda
              </strong>

              <span>
                Ver turnos y sesiones
              </span>
            </div>
          </Link>

          <Link
            to="/pacientes"
            className="dashboard-action-card"
          >
            <div className="dashboard-action-icon">
              ♡
            </div>

            <div>
              <strong>
                Pacientes
              </strong>

              <span>
                Fichas e información clínica
              </span>
            </div>
          </Link>

          <Link
            to="/horarios"
            className="dashboard-action-card"
          >
            <div className="dashboard-action-icon">
              ◷
            </div>

            <div>
              <strong>
                Horarios fijos
              </strong>

              <span>
                Configurar turnos semanales
              </span>
            </div>
          </Link>

          <Link
            to="/agenda"
            className="dashboard-action-card"
          >
            <div className="dashboard-action-icon">
              +
            </div>

            <div>
              <strong>
                Nuevo turno
              </strong>

              <span>
                Crear un turno manual
              </span>
            </div>
          </Link>

        </div>
      </section>

    </main>
  )
}