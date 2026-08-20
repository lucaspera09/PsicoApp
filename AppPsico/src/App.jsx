import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router'

import ProtectedRoute from './app/guards/ProtectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'

import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PacientesPage from './pages/PacientesPage.jsx'
import PacienteDetallePage from './pages/PacienteDetallePage.jsx'
import AgendaPage from './pages/AgendaPage.jsx'
import ProfesionalesPage from './pages/ProfesionalesPage.jsx'
import HorariosSemanalesPage from './pages/HorariosSemanalesPage.jsx'
import NotaRapidaPage from './pages/NotaRapidaPage.jsx'

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

        {/* LOGIN */}

        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/" replace />
              : <LoginPage />
          }
        />

        {/* RUTAS PROTEGIDAS GENERALES */}

        <Route
          element={
            <ProtectedRoute />
          }
        >
          <Route
            element={
              <MainLayout />
            }
          >

            <Route
              path="/"
              element={
                <DashboardPage />
              }
            />

          </Route>
        </Route>

        {/* ADMIN */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                'admin'
              ]}
            />
          }
        >
          <Route
            element={
              <MainLayout />
            }
          >

            <Route
              path="/profesionales"
              element={
                <ProfesionalesPage />
              }
            />

          </Route>
        </Route>

        {/* PROFESIONAL */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                'profesional'
              ]}
            />
          }
        >
          <Route
            element={
              <MainLayout />
            }
          >

            <Route
              path="/pacientes"
              element={
                <PacientesPage />
              }
            />
            <Route
  path="/nota-rapida"
  element={
    <NotaRapidaPage />
  }
/>
            <Route
              path="/pacientes/:id"
              element={
                <PacienteDetallePage />
              }
            />

            <Route
              path="/agenda"
              element={
                <AgendaPage />
              }
            />

            <Route
              path="/horarios"
              element={
                <HorariosSemanalesPage />
              }
            />

          </Route>
        </Route>

        {/* CUALQUIER OTRA RUTA */}

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