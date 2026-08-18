import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

import { logout } from '../../features/auth.slice.js'

export default function DashboardAdmin() {
  const dispatch = useDispatch()

  const { user } = useSelector(
    (state) => state.auth
  )

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <main>
      <h1>Panel de administración</h1>

      <p>
        Bienvenido {user?.email}
      </p>

      <section>
        <h2>Administración</h2>

        <Link to="/profesionales">
          Gestionar profesionales
        </Link>
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