import { useSelector } from 'react-redux'

import DashboardAdmin from '../components/admin/DashboardAdmin.jsx'
import DashboardProfesional from '../components/profesional/DashboardProfesional.jsx'

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth)

  if (!user) {
    return null
  }

  if (user.role === 'admin') {
    return <DashboardAdmin />
  }

  if (user.role === 'profesional') {
    return <DashboardProfesional />
  }

  return (
    <main>
      <h1>Sin acceso</h1>

      <p>
        El usuario no tiene un rol válido.
      </p>
    </main>
  )
}