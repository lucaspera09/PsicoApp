import { useEffect, useState } from 'react'

import api from '../../api/api.js'
import CrearPlanTrabajoForm from './CrearPlanTrabajoForm.jsx'
import EditarPlanTrabajoForm from './EditarPlanTrabajoForm.jsx'

export default function PlanesTrabajoPaciente({
  pacienteId
}) {
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [
    mostrarFormulario,
    setMostrarFormulario
  ] = useState(false)

  const [
    planEditando,
    setPlanEditando
  ] = useState(null)

  const [
    cambiandoEstadoId,
    setCambiandoEstadoId
  ] = useState(null)

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(
          `/planes-trabajo/paciente/${pacienteId}`
        )

        const planesRecibidos =
          response.data?.data || response.data

        setPlanes(
          Array.isArray(planesRecibidos)
            ? planesRecibidos
            : []
        )
      } catch (error) {
        console.error(
          'Error al cargar planes:',
          error
        )

        setError(
          error.response?.data?.message ||
          'No se pudieron cargar los planes de trabajo'
        )
      } finally {
        setLoading(false)
      }
    }

    if (pacienteId) {
      cargarPlanes()
    }
  }, [pacienteId])

  const handlePlanCreado = (nuevoPlan) => {
    setPlanes((prev) => [
      nuevoPlan,
      ...prev
    ])

    setMostrarFormulario(false)
  }

  const handleCancelar = () => {
    setMostrarFormulario(false)
  }

  const handleEditarPlan = (plan) => {
    setMostrarFormulario(false)
    setPlanEditando(plan)
  }

  const handlePlanActualizado = (
    planActualizado
  ) => {
    setPlanes((prev) =>
      prev.map((plan) =>
        plan._id === planActualizado._id
          ? planActualizado
          : plan
      )
    )

    setPlanEditando(null)
  }

  const handleCancelarEdicion = () => {
    setPlanEditando(null)
  }

  const handleCambiarEstadoPlan = async (
    plan
  ) => {
    const nuevoEstado = !plan.activo

    const mensaje = nuevoEstado
      ? `¿Querés reactivar el plan "${plan.titulo}"?`
      : `¿Querés finalizar el plan "${plan.titulo}"?`

    const confirmado =
      window.confirm(mensaje)

    if (!confirmado) {
      return
    }

    try {
      setCambiandoEstadoId(plan._id)

      const response = await api.put(
        `/planes-trabajo/${plan._id}`,
        {
          activo: nuevoEstado
        }
      )

      const planActualizado =
        response.data?.data ||
        response.data

      setPlanes((prev) =>
        prev.map((item) =>
          item._id === plan._id
            ? {
                ...item,
                ...planActualizado,
                activo: nuevoEstado
              }
            : item
        )
      )
    } catch (error) {
      console.error(
        'Error al cambiar estado del plan:',
        error
      )

      alert(
        error.response?.data?.message ||
        'No se pudo cambiar el estado del plan'
      )
    } finally {
      setCambiandoEstadoId(null)
    }
  }

  const mostrarEstadoObjetivo = (
    estado
  ) => {
    const estados = {
      pendiente: 'Pendiente',
      en_progreso: 'En progreso',
      logrado: 'Logrado'
    }

    return estados[estado] || estado
  }

  const claseObjetivo = (estado) => {
    if (estado === 'logrado') {
      return 'achieved'
    }

    if (estado === 'en_progreso') {
      return 'progress'
    }

    return 'pending'
  }

  const handleEliminarPlan = async (
    plan
  ) => {
    const confirmado =
      window.confirm(
        `¿Querés eliminar el plan "${plan.titulo}"?`
      )

    if (!confirmado) {
      return
    }

    try {
      await api.delete(
        `/planes-trabajo/${plan._id}`
      )

      setPlanes((prev) =>
        prev.filter(
          (item) =>
            item._id !== plan._id
        )
      )

      if (
        planEditando?._id ===
        plan._id
      ) {
        setPlanEditando(null)
      }
    } catch (error) {
      console.error(
        'Error al eliminar plan:',
        error
      )

      alert(
        error.response?.data?.message ||
        'No se pudo eliminar el plan de trabajo'
      )
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return 'Sin fecha'
    }

    return new Date(fecha)
      .toLocaleDateString('es-UY')
  }

  if (loading) {
    return (
      <section className="plans-section">
        <h2>Plan de trabajo</h2>
        <p>Cargando planes...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="plans-section">
        <h2>Plan de trabajo</h2>
        <p>{error}</p>
      </section>
    )
  }

  return (
    <section className="plans-section">

      <div className="plans-header">

        <div>
          <p className="plans-eyebrow">
            Objetivos terapéuticos
          </p>

          <h2>
            Plan de trabajo
          </h2>

          <p>
            Organizá objetivos,
            seguimiento y evolución.
          </p>
        </div>

        {!mostrarFormulario &&
          !planEditando && (
            <button
              type="button"
              className="plans-new-button"
              onClick={() =>
                setMostrarFormulario(true)
              }
            >
              + Nuevo plan
            </button>
          )}

      </div>

      {mostrarFormulario && (
        <div className="plans-form-wrapper">

          <CrearPlanTrabajoForm
            pacienteId={pacienteId}
            onCreated={handlePlanCreado}
            onCancel={handleCancelar}
          />

        </div>
      )}

      {planEditando && (
        <div className="plans-form-wrapper">

          <EditarPlanTrabajoForm
            plan={planEditando}
            onUpdated={handlePlanActualizado}
            onCancel={handleCancelarEdicion}
          />

        </div>
      )}

      {planes.length === 0 ? (
        <div className="plans-empty">

          <div className="plans-empty-icon">
            ◎
          </div>

          <h3>
            Sin planes de trabajo
          </h3>

          <p>
            Creá el primer plan
            para empezar a organizar
            los objetivos del paciente.
          </p>

        </div>
      ) : (
        <div className="plans-list">

          {planes.map((plan) => (
            <article
              key={plan._id}
              className="plan-card"
            >

              <div className="plan-card-header">

                <div>
                  <span
                    className={
                      plan.activo
                        ? 'plan-status active'
                        : 'plan-status finished'
                    }
                  >
                    {plan.activo
                      ? 'Activo'
                      : 'Finalizado'}
                  </span>

                  <h3>
                    {plan.titulo}
                  </h3>
                </div>

                <div className="plan-dates">
                  {formatearFecha(
                    plan.fechaInicio
                  )}

                  {' → '}

                  {plan.fechaFin
                    ? formatearFecha(
                        plan.fechaFin
                      )
                    : 'Sin fecha final'}
                </div>

              </div>

              <div className="plan-description">

                <span>
                  Descripción
                </span>

                <p>
                  {plan.descripcion ||
                    'Sin descripción'}
                </p>

              </div>

              <div className="plan-objectives">

                <div className="plan-objectives-header">

                  <h4>
                    Objetivos
                  </h4>

                  <span>
                    {plan.objetivos?.length || 0}
                  </span>

                </div>

                {!plan.objetivos ||
                plan.objetivos.length === 0 ? (
                  <p className="plan-empty-objectives">
                    No hay objetivos registrados.
                  </p>
                ) : (
                  <div className="plan-objectives-list">

                    {plan.objetivos.map(
                      (objetivo, index) => (
                        <div
                          key={
                            objetivo._id ||
                            index
                          }
                          className="plan-objective"
                        >

                          <div className="plan-objective-top">

                            <strong>
                              {
                                objetivo.descripcion
                              }
                            </strong>

                            <span
                              className={`objective-status ${claseObjetivo(
                                objetivo.estado
                              )}`}
                            >
                              {mostrarEstadoObjetivo(
                                objetivo.estado
                              )}
                            </span>

                          </div>

                          {objetivo.observacion && (
                            <p>
                              {objetivo.observacion}
                            </p>
                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              <div className="plan-actions">

                <button
                  type="button"
                  className="plan-edit"
                  onClick={() =>
                    handleEditarPlan(plan)
                  }
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="plan-state"
                  onClick={() =>
                    handleCambiarEstadoPlan(plan)
                  }
                  disabled={
                    cambiandoEstadoId ===
                    plan._id
                  }
                >
                  {cambiandoEstadoId ===
                  plan._id
                    ? 'Guardando...'
                    : plan.activo
                      ? 'Finalizar'
                      : 'Reactivar'}
                </button>

                <button
                  type="button"
                  className="plan-delete"
                  onClick={() =>
                    handleEliminarPlan(plan)
                  }
                >
                  Eliminar
                </button>

              </div>

            </article>
          ))}

        </div>
      )}

    </section>
  )
}