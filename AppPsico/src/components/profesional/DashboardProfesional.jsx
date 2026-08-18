import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

import { logout } from '../../features/auth.slice.js'

export default function DashboardProfesional() {
  const dispatch = useDispatch()

  const { user } = useSelector(
    (state) => state.auth
  )

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <main>
      <h1>Panel profesional</h1>

      <p>
        Bienvenido {user?.profesional?.nombre || user?.email}
      </p>

      <section>
        <h2>Accesos rápidos</h2>

        <div>
          <Link to="/pacientes">
            Ver pacientes
          </Link>
        </div>

        <div>
          <Link to="/agenda">
            Ver agenda
          </Link>
        </div>
      </section>

      <button
        type="button"
        onClick={handleLogout}
      >
        Cerrar sesión
      </button>
    </main>
  )
}