import { Link } from 'react-router'
import { useSelector } from 'react-redux'

export default function DashboardAdmin() {
  const { user } = useSelector(
    (state) => state.auth
  )

  return (
    <main className="admin-dashboard-page">

      <section className="admin-dashboard-hero">

        <div>
          <p className="admin-dashboard-eyebrow">
            Administración
          </p>

          <h1>
            Panel de administración
          </h1>

          <p>
            Bienvenido, {user?.email}
          </p>
        </div>

      </section>

      <section className="admin-dashboard-summary">

        <div className="admin-summary-card">

          <div className="admin-summary-icon">
            ♙
          </div>

          <div>
            <span>
              Gestión
            </span>

            <strong>
              Profesionales
            </strong>
          </div>

        </div>

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

      <section>

        <div className="admin-dashboard-section-header">

          <div>
            <h2>
              Accesos rápidos
            </h2>

            <p>
              Administrá las cuentas
              habilitadas en PsicoApp.
            </p>
          </div>

        </div>

        <div className="admin-dashboard-actions">

          <Link
            to="/profesionales"
            className="admin-dashboard-action-card"
          >

            <div className="admin-dashboard-action-icon">
              ♙
            </div>

            <div className="admin-dashboard-action-content">

              <strong>
                Gestionar profesionales
              </strong>

              <span>
                Crear, editar, activar
                o desactivar profesionales.
              </span>

            </div>

            <span className="admin-dashboard-arrow">
              →
            </span>

          </Link>

        </div>

      </section>

    </main>
  )
}