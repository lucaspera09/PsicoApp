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

  const handleCambiarEstadoPlan = async (plan) => {
    const nuevoEstado = !plan.activo

    const mensaje = nuevoEstado
      ? `¿Querés reactivar el plan "${plan.titulo}"?`
      : `¿Querés finalizar el plan "${plan.titulo}"?`

    const confirmado = window.confirm(mensaje)

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
        response.data?.data || response.data

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

  const mostrarEstadoObjetivo = (estado) => {
    const estados = {
      pendiente: 'Pendiente',
      en_progreso: 'En progreso',
      logrado: 'Logrado'
    }

    return estados[estado] || estado
  }

  const handleEliminarPlan = async (plan) => {
  const confirmado = window.confirm(
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
        (item) => item._id !== plan._id
      )
    )

    if (planEditando?._id === plan._id) {
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

  if (loading) {
    return (
      <section>
        <h2>Plan de trabajo</h2>

        <p>Cargando planes...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2>Plan de trabajo</h2>

        <p>{error}</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Plan de trabajo</h2>

      {!mostrarFormulario && !planEditando && (
        <button
          type="button"
          onClick={() =>
            setMostrarFormulario(true)
          }
        >
          + Nuevo plan de trabajo
        </button>
      )}

      {mostrarFormulario && (
        <CrearPlanTrabajoForm
          pacienteId={pacienteId}
          onCreated={handlePlanCreado}
          onCancel={handleCancelar}
        />
      )}

      {planEditando && (
        <EditarPlanTrabajoForm
          plan={planEditando}
          onUpdated={handlePlanActualizado}
          onCancel={handleCancelarEdicion}
        />
      )}

      {planes.length === 0 ? (
        <p>
          No hay planes de trabajo registrados.
        </p>
      ) : (
        <div>
          {planes.map((plan) => (
            <article key={plan._id}>

              <h3>
                {plan.titulo}
              </h3>

              <p>
                <strong>Descripción:</strong>{' '}
                {plan.descripcion ||
                  'Sin descripción'}
              </p>

              <p>
                <strong>
                  Fecha de inicio:
                </strong>{' '}
                {plan.fechaInicio
                  ? new Date(
                      plan.fechaInicio
                    ).toLocaleDateString('es-UY')
                  : 'Sin fecha'
                }
              </p>

              <p>
                <strong>
                  Fecha de finalización:
                </strong>{' '}
                {plan.fechaFin
                  ? new Date(
                      plan.fechaFin
                    ).toLocaleDateString('es-UY')
                  : 'Sin fecha definida'
                }
              </p>

              <p>
                <strong>Estado:</strong>{' '}
                <strong>
                  {plan.activo
                    ? 'Activo'
                    : 'Finalizado'}
                </strong>
              </p>

              <div>
                <h4>Objetivos</h4>

                {!plan.objetivos ||
                plan.objetivos.length === 0 ? (
                  <p>
                    No hay objetivos registrados.
                  </p>
                ) : (
                  <ul>
                    {plan.objetivos.map(
                      (objetivo, index) => (
                        <li
                          key={
                            objetivo._id ||
                            index
                          }
                        >
                          <strong>
                            {objetivo.descripcion}
                          </strong>

                          <p>
                            Estado:{' '}
                            {mostrarEstadoObjetivo(
                              objetivo.estado
                            )}
                          </p>

                          {objetivo.observacion && (
                            <p>
                              Observación:{' '}
                              {
                                objetivo.observacion
                              }
                            </p>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>

              <div>
  <button
    type="button"
    onClick={() =>
      handleEditarPlan(plan)
    }
  >
    Editar plan
  </button>

  {' '}

  <button
    type="button"
    onClick={() =>
      handleCambiarEstadoPlan(plan)
    }
    disabled={
      cambiandoEstadoId === plan._id
    }
  >
    {cambiandoEstadoId === plan._id
      ? 'Guardando...'
      : plan.activo
        ? 'Finalizar plan'
        : 'Reactivar plan'
    }
  </button>

  {' '}

  <button
    type="button"
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