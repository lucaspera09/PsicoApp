import { Link } from 'react-router'
import { useSelector } from 'react-redux'

export default function DashboardProfesional() {
  const { user } = useSelector(
    (state) => state.auth
  )

  const nombre =
    user?.profesional?.nombre ||
    user?.email ||
    'Profesional'

  return (
    <main className="dashboard-page">

      {/* ENCABEZADO */}

      <section className="dashboard-hero">

        <div>
          <p className="dashboard-eyebrow">
            Inicio
          </p>

          <h1>
            Hola, {nombre}
          </h1>

          <p>
            Registrá rápido lo importante
            y seguí con tu día.
          </p>
        </div>

      </section>

      {/* ACCIONES PRINCIPALES */}

      <section className="dashboard-main-actions">

        <Link
          to="/agenda"
          className="dashboard-main-action dashboard-main-session"
        >
          <div className="dashboard-main-icon">
            📝
          </div>

          <div className="dashboard-main-content">

            <span className="dashboard-main-label">
              Al terminar una atención
            </span>

            <h2>
              Registrar sesión
            </h2>

            <p>
              Elegí el turno y anotá
              rápidamente lo trabajado.
            </p>

          </div>

          <span className="dashboard-main-arrow">
            →
          </span>
        </Link>

        <Link
          to="/nota-rapida"
          className="dashboard-main-action dashboard-main-note"
        >
          <div className="dashboard-main-icon">
            ✍️
          </div>

          <div className="dashboard-main-content">

            <span className="dashboard-main-label">
              Mientras hablás con alguien
            </span>

            <h2>
              Nueva nota rápida
            </h2>

            <p>
              Elegí un paciente y registrá
              una conversación u observación.
            </p>

          </div>

          <span className="dashboard-main-arrow">
            →
          </span>
        </Link>

      </section>

      {/* TEXTO DE APOYO */}

      <section className="dashboard-focus-message">

        <div className="dashboard-focus-icon">
          ✓
        </div>

        <div>
          <strong>
            Lo importante primero
          </strong>

          <p>
            Sesiones y notas quedan como
            acciones principales. El resto
            de la información sigue disponible
            dentro de cada paciente.
          </p>
        </div>

      </section>

      {/* ACCESOS SECUNDARIOS */}

      <section className="dashboard-secondary-section">

        <div className="dashboard-section-heading">

          <div>
            <h2>
              Otras herramientas
            </h2>

            <p>
              Accesos para organizar
              y consultar información.
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
                Ver los turnos del día,
                semana o mes
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
                Fichas, historial
                e información clínica
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
                Organizar la agenda semanal
              </span>
            </div>
          </Link>

        </div>

      </section>

    </main>
  )
}