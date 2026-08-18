import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router'

import ProtectedRoute from './app/guards/ProtectedRoute.jsx'

import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PacientesPage from './pages/PacientesPage.jsx'
import PacienteDetallePage from './pages/PacienteDetallePage.jsx'
import AgendaPage from './pages/AgendaPage.jsx'
import ProfesionalesPage from './pages/ProfesionalesPage.jsx'

import {
  loadCurrentUser
} from './features/auth.slice.js'

function App() {
  const dispatch = useDispatch()

  const {
    user,
    token,
    initialized
  } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token && !initialized) {
      dispatch(loadCurrentUser())
    }
  }, [token, initialized, dispatch])

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/" replace />
              : <LoginPage />
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<DashboardPage />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
            />
          }
        >
          <Route
            path="/profesionales"
            element={<ProfesionalesPage />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={['profesional']}
            />
          }
        >
          <Route
            path="/pacientes"
            element={<PacientesPage />}
          />

          <Route
            path="/pacientes/:id"
            element={<PacienteDetallePage />}
          />

          <Route
            path="/agenda"
            element={<AgendaPage />}
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App