import { useEffect, useState } from 'react'

import api from '../../api/api.js'

export default function CrearTurnoForm({
  onCreated,
  onCancel
}) {
  const [pacientes, setPacientes] = useState([])

  const [
    pacientesSeleccionados,
    setPacientesSeleccionados
  ] = useState([])

  const [form, setForm] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    observacion: ''
  })

  const [
    loadingPacientes,
    setLoadingPacientes
  ] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        setLoadingPacientes(true)

        const response =
          await api.get('/pacientes')

        const pacientesRecibidos =
          response.data?.data ||
          response.data

        setPacientes(
          Array.isArray(
            pacientesRecibidos
          )
            ? pacientesRecibidos
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
        setLoadingPacientes(false)
      }
    }

    cargarPacientes()
  }, [])

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))

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
              id !== pacienteId
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
      new Date(fechaFin) <=
      new Date(fechaInicio)
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
            paciente: pacienteId,
            estado: 'programado'
          })
        )

      const datos = {
        participantes,
        fechaInicio,
        fechaFin
      }

      if (
        form.observacion.trim()
      ) {
        datos.observacion =
          form.observacion.trim()
      }

      const response =
        await api.post(
          '/turnos',
          datos
        )

      const nuevoTurno =
        response.data?.data ||
        response.data

      if (onCreated) {
        onCreated(
          nuevoTurno
        )
      }
    } catch (error) {
      console.error(
        'Error al crear turno:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo crear el turno'
      )
    } finally {
      setLoading(false)
    }
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
            Nuevo turno
          </h2>

          <p>
            Seleccioná los pacientes,
            la fecha y el horario.
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
                Pacientes
              </label>

              <p>
                Podés seleccionar uno o
                varios pacientes para
                el mismo turno.
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

                        <span>
                          {seleccionado
                            ? 'Seleccionado'
                            : 'Seleccionar'}
                        </span>

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

        {/* DATOS */}

        <div className="turn-form-grid">

          <div className="form-group turn-form-date">
            <label htmlFor="turno-fecha">
              Fecha
            </label>

            <input
              id="turno-fecha"
              name="fecha"
              type="date"
              value={form.fecha}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="turno-hora-inicio">
              Hora de inicio
            </label>

            <input
              id="turno-hora-inicio"
              name="horaInicio"
              type="time"
              value={form.horaInicio}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="turno-hora-fin">
              Hora de fin
            </label>

            <input
              id="turno-hora-fin"
              name="horaFin"
              type="time"
              value={form.horaFin}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group turn-form-observation">
            <label htmlFor="turno-observacion">
              Observación
            </label>

            <textarea
              id="turno-observacion"
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
              : 'Crear turno'}
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