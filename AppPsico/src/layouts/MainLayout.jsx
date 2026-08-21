import { NavLink, Outlet } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import NexoLogo from '../components/branding/NexoLogo.jsx'

import { logout } from '../features/auth.slice.js'

export default function MainLayout() {
  const dispatch = useDispatch()

  const { user } = useSelector(
    (state) => state.auth
  )

  const getNavClass = ({ isActive }) =>
    isActive
      ? 'app-nav-link active'
      : 'app-nav-link'

  const handleLogout = () => {
    dispatch(logout())
  }

  const esAdmin =
    user?.role === 'admin'

  const esProfesional =
    user?.role === 'profesional'

  const nombreUsuario =
    user?.profesional?.nombre ||
    user?.email ||
    'Usuario'

  const profesion =
    user?.profesional?.profesion ||
    (
      esAdmin
        ? 'Administrador'
        : 'Profesional'
    )

  return (
    <div className="app-shell">

      {/* SIDEBAR PC */}

      <aside className="app-sidebar">

        <div className="app-brand">

  <NexoLogo
    size={42}
  />

  <div>

    <strong>
      Nexo
    </strong>

    <small>
      Agenda y seguimiento
    </small>

  </div>

</div>

        {/* USUARIO */}

        <div className="app-user-card">

          <div className="app-user-avatar">
            {nombreUsuario
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <div className="app-user-info">

            <strong>
              {nombreUsuario}
            </strong>

            <span>
              {profesion}
            </span>

          </div>

        </div>

        {/* NAVEGACIÓN */}

        <nav className="app-sidebar-nav">

          <NavLink
            to="/"
            end
            className={getNavClass}
          >
            <span className="app-nav-icon">
              ⌂
            </span>

            Inicio
          </NavLink>

          {esProfesional && (
            <>
              <NavLink
                to="/agenda"
                className={getNavClass}
              >
                <span className="app-nav-icon">
                  ◫
                </span>

                Agenda
              </NavLink>

              <NavLink
                to="/pacientes"
                className={getNavClass}
              >
                <span className="app-nav-icon">
                  ♡
                </span>

                Pacientes
              </NavLink>

              <NavLink
                to="/horarios"
                className={getNavClass}
              >
                <span className="app-nav-icon">
                  ◷
                </span>

                Horarios
              </NavLink>
            </>
          )}

          {esAdmin && (
            <NavLink
              to="/profesionales"
              className={getNavClass}
            >
              <span className="app-nav-icon">
                ♙
              </span>

              Profesionales
            </NavLink>
          )}

        </nav>

        {/* FOOTER SIDEBAR */}

        <div className="app-sidebar-footer">

          <button
            type="button"
            className="app-logout-button"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            Cerrar sesión
          </button>

        </div>

      </aside>

      {/* CONTENIDO */}

      <div className="app-main">

        {/* HEADER MOBILE */}

        <header className="app-mobile-header">

          <div className="app-brand-mobile">

  <NexoLogo
    size={38}
  />

  <div>

    <strong>
      Nexo
    </strong>

    <span className="app-mobile-user-name">
      {nombreUsuario}
    </span>

  </div>

</div>

          <button
            type="button"
            className="app-mobile-logout"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            ↪
          </button>

        </header>

        <div className="app-content">
          <Outlet />
        </div>

      </div>

      {/* NAVEGACIÓN CELULAR */}

      <nav
        className={
          esAdmin
            ? 'app-bottom-nav admin'
            : 'app-bottom-nav'
        }
      >

        <NavLink
          to="/"
          end
          className={getNavClass}
        >
          <span className="app-bottom-icon">
            ⌂
          </span>

          <span>
            Inicio
          </span>
        </NavLink>

        {esProfesional && (
          <>
            <NavLink
              to="/agenda"
              className={getNavClass}
            >
              <span className="app-bottom-icon">
                ◫
              </span>

              <span>
                Agenda
              </span>
            </NavLink>

            <NavLink
              to="/pacientes"
              className={getNavClass}
            >
              <span className="app-bottom-icon">
                ♡
              </span>

              <span>
                Pacientes
              </span>
            </NavLink>

            <NavLink
              to="/horarios"
              className={getNavClass}
            >
              <span className="app-bottom-icon">
                ◷
              </span>

              <span>
                Horarios
              </span>
            </NavLink>
          </>
        )}

        {esAdmin && (
          <NavLink
            to="/profesionales"
            className={getNavClass}
          >
            <span className="app-bottom-icon">
              ♙
            </span>

            <span>
              Profesionales
            </span>
          </NavLink>
        )}

      </nav>

    </div>
  )
}