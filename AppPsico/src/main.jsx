import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import './styles/variables.css'
import './styles/global.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/agenda.css'
import './styles/login.css'
import './styles/dashboard.css'
import './styles/patients.css'
import './styles/patientDetail.css'
import './styles/sessions.css'
import './styles/responsibles.css'
import './styles/notes.css'
import './styles/plans.css'
import './styles/weeklySchedules.css'
import './styles/professionals.css'
import './styles/adminDashboard.css'
import './styles/quickNote.css'

import App from './App.jsx'
import { store } from './store/store.js'

createRoot(
  document.getElementById('root')
).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)