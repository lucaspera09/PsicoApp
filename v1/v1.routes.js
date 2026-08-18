import express from 'express'

import authRoutes from './routes/auth.routes.js'
import profesionalesRoutes from './routes/profesionales.routes.js'
import pacientesRoutes from './routes/pacientes.routes.js'
import responsablesRoutes from './routes/responsables.routes.js'
import notasRoutes from './routes/notas.routes.js'
import turnosRoutes from './routes/turnos.routes.js'
import sesionesRoutes from './routes/sesiones.routes.js'
import planesTrabajoRoutes from './routes/planesTrabajo.routes.js'
import archivosRoutes from './routes/archivos.routes.js'

const router = express.Router()

router.use(
  '/auth',
  authRoutes
)

router.use(
  '/profesionales',
  profesionalesRoutes
)

router.use(
  '/pacientes',
  pacientesRoutes
)

router.use(
  '/responsables',
  responsablesRoutes
)

router.use(
  '/notas',
  notasRoutes
)

router.use(
  '/turnos',
  turnosRoutes
)

router.use(
  '/sesiones',
  sesionesRoutes
)

router.use(
  '/planes-trabajo',
  planesTrabajoRoutes
)

router.use(
  '/archivos',
  archivosRoutes
)

export default router