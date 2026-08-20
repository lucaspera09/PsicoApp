import {
  useEffect,
  useState
} from 'react'

import api from '../../api/api.js'

export default function EditarTurnoForm({
  turno,
  onUpdated,
  onCancel
}) {
  const [
    pacientes,
    setPacientes
  ] = useState([])

  const [
    pacientesSeleccionados,
    setPacientesSeleccionados
  ] = useState([])

  const [
    form,
    setForm
  ] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    observacion: ''
  })

  const [
    loadingPacientes,
    setLoadingPacientes
  ] = useState(true)

  const [
    loading,
    setLoading
  ] = useState(false)

  const [
    error,
    setError
  ] = useState(null)

  useEffect(() => {
    if (!turno) {
      return
    }

    const inicio =
      new Date(
        turno.fechaInicio
      )

    const fin =
      new Date(
        turno.fechaFin
      )

    const fecha =
      `${inicio.getFullYear()}-${String(
        inicio.getMonth() + 1
      ).padStart(
        2,
        '0'
      )}-${String(
        inicio.getDate()
      ).padStart(
        2,
        '0'
      )}`

    const horaInicio =
      `${String(
        inicio.getHours()
      ).padStart(
        2,
        '0'
      )}:${String(
        inicio.getMinutes()
      ).padStart(
        2,
        '0'
      )}`

    const horaFin =
      `${String(
        fin.getHours()
      ).padStart(
        2,
        '0'
      )}:${String(
        fin.getMinutes()
      ).padStart(
        2,
        '0'
      )}`

    setForm({
      fecha,
      horaInicio,
      horaFin,
      observacion:
        turno.observacion ||
        ''
    })

    const ids =
      (
        turno.participantes ||
        []
      )
        .map(
          (participante) =>
            participante
              .paciente?._id ||
            participante.paciente
        )
        .filter(Boolean)
        .map(
          (id) =>
            id.toString()
        )

    setPacientesSeleccionados(
      ids
    )
  }, [turno])

  useEffect(() => {
    const cargarPacientes =
      async () => {
        try {
          setLoadingPacientes(
            true
          )

          const response =
            await api.get(
              '/pacientes'
            )

          const recibidos =
            response.data?.data ||
            response.data

          setPacientes(
            Array.isArray(
              recibidos
            )
              ? recibidos
              : []
          )
        } catch (error) {
          console.error(
            'Error al cargar pacientes:',
            error
          )

          setError(
            'No se pudieron cargar los pacientes'
          )
        } finally {
          setLoadingPacientes(
            false
          )
        }
      }

    cargarPacientes()
  }, [])

  const handleChange = (
    event
  ) => {
    const {
      name,
      value
    } = event.target

    setForm(
      (prev) => ({
        ...prev,
        [name]: value
      })
    )

    if (error) {
      setError(null)
    }
  }

  const handlePacienteChange = (
    pacienteId
  ) => {
    setPacientesSeleccionados(
      (prev) => {
        if (
          prev.includes(
            pacienteId
          )
        ) {
          return prev.filter(
            (id) =>
              id !==
              pacienteId
          )
        }

        return [
          ...prev,
          pacienteId
        ]
      }
    )

    if (error) {
      setError(null)
    }
  }

  const obtenerEstadoPaciente = (
    pacienteId
  ) => {
    const participante =
      turno.participantes?.find(
        (item) =>
          (
            item.paciente?._id ||
            item.paciente
          )?.toString() ===
          pacienteId.toString()
      )

    return (
      participante?.estado ||
      'programado'
    )
  }

  const mostrarEstado = (
    estado
  ) => {
    const estados = {
      programado:
        'Programado',

      realizado:
        'Realizado',

      cancelado:
        'Cancelado',

      no_asistio:
        'No asistió'
    }

    return (
      estados[estado] ||
      estado
    )
  }

  const claseEstado = (
    estado
  ) => {
    if (
      estado ===
      'realizado'
    ) {
      return 'done'
    }

    if (
      estado ===
      'cancelado'
    ) {
      return 'cancelled'
    }

    if (
      estado ===
      'no_asistio'
    ) {
      return 'absent'
    }

    return 'scheduled'
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (
      pacientesSeleccionados.length ===
      0
    ) {
      setError(
        'Seleccioná al menos un paciente'
      )

      return
    }

    if (
      !form.fecha ||
      !form.horaInicio ||
      !form.horaFin
    ) {
      setError(
        'Completá fecha, hora de inicio y hora de fin'
      )

      return
    }

    const fechaInicio =
      `${form.fecha}T${form.horaInicio}:00`

    const fechaFin =
      `${form.fecha}T${form.horaFin}:00`

    if (
      new Date(
        fechaFin
      ) <=
      new Date(
        fechaInicio
      )
    ) {
      setError(
        'La hora de fin debe ser posterior a la hora de inicio'
      )

      return
    }

    try {
      setLoading(true)
      setError(null)

      const participantes =
        pacientesSeleccionados.map(
          (pacienteId) => ({
            paciente:
              pacienteId,

            estado:
              obtenerEstadoPaciente(
                pacienteId
              )
          })
        )

      const datos = {
        participantes,
        fechaInicio,
        fechaFin,
        observacion:
          form.observacion.trim()
      }

      const response =
        await api.put(
          `/turnos/${turno._id}`,
          datos
        )

      const turnoActualizado =
        response.data?.data ||
        response.data

      if (onUpdated) {
        onUpdated(
          turnoActualizado
        )
      }
    } catch (error) {
      console.error(
        'Error al actualizar turno:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo actualizar el turno'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!turno) {
    return null
  }

  const pacientesActivos =
    pacientes.filter(
      (paciente) =>
        paciente.activo
    )

  return (
    <section className="turn-form-section">

      <div className="turn-form-header">

        <div>
          <p className="turn-form-eyebrow">
            Agenda
          </p>

          <h2>
            Editar turno
          </h2>

          <p>
            Modificá pacientes,
            fecha, horario u observaciones.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="turn-form"
      >

        {/* PACIENTES */}

        <div className="turn-form-patients">

          <div className="turn-form-field-header">

            <div>
              <label>
                Pacientes del turno
              </label>

              <p>
                Los pacientes que ya estaban
                mantienen su estado actual.
              </p>
            </div>

            <span className="turn-form-selected-count">
              {
                pacientesSeleccionados.length
              }{' '}
              seleccionados
            </span>

          </div>

          {loadingPacientes ? (
            <div className="turn-form-loading">
              Cargando pacientes...
            </div>
          ) : pacientesActivos.length ===
            0 ? (
            <div className="turn-form-loading">
              No hay pacientes activos.
            </div>
          ) : (
            <div className="turn-patient-grid">

              {pacientesActivos.map(
                (paciente) => {
                  const seleccionado =
                    pacientesSeleccionados.includes(
                      paciente._id
                    )

                  const estado =
                    obtenerEstadoPaciente(
                      paciente._id
                    )

                  return (
                    <label
                      key={paciente._id}
                      className={
                        seleccionado
                          ? 'turn-patient-card selected'
                          : 'turn-patient-card'
                      }
                    >

                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() =>
                          handlePacienteChange(
                            paciente._id
                          )
                        }
                      />

                      <div className="turn-patient-avatar">
                        {paciente.nombre
                          ?.charAt(0)
                          ?.toUpperCase()}

                        {paciente.apellido
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div className="turn-patient-info">

                        <strong>
                          {paciente.nombre}{' '}
                          {paciente.apellido}
                        </strong>

                        {seleccionado ? (
                          <span
                            className={`turn-patient-state ${claseEstado(
                              estado
                            )}`}
                          >
                            {mostrarEstado(
                              estado
                            )}
                          </span>
                        ) : (
                          <span>
                            Seleccionar
                          </span>
                        )}

                      </div>

                      <div className="turn-patient-check">
                        {seleccionado
                          ? '✓'
                          : ''}
                      </div>

                    </label>
                  )
                }
              )}

            </div>
          )}

        </div>

        {/* FECHA Y HORARIO */}

        <div className="turn-form-grid">

          <div className="form-group turn-form-date">

            <label htmlFor="editar-turno-fecha">
              Fecha
            </label>

            <input
              id="editar-turno-fecha"
              name="fecha"
              type="date"
              value={form.fecha}
              onChange={handleChange}
              className="form-control"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="editar-turno-hora-inicio">
              Hora de inicio
            </label>

            <input
              id="editar-turno-hora-inicio"
              name="horaInicio"
              type="time"
              value={form.horaInicio}
              onChange={handleChange}
              className="form-control"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="editar-turno-hora-fin">
              Hora de fin
            </label>

            <input
              id="editar-turno-hora-fin"
              name="horaFin"
              type="time"
              value={form.horaFin}
              onChange={handleChange}
              className="form-control"
              required
            />

          </div>

          <div className="form-group turn-form-observation">

            <label htmlFor="editar-turno-observacion">
              Observación
            </label>

            <textarea
              id="editar-turno-observacion"
              name="observacion"
              value={form.observacion}
              onChange={handleChange}
              className="form-control turn-form-textarea"
              rows="4"
              placeholder="Podés agregar una observación para este turno..."
            />

          </div>

        </div>

        {error && (
          <div className="turn-form-error">
            {error}
          </div>
        )}

        <div className="turn-form-actions">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>

        </div>

      </form>

    </section>
  )
}