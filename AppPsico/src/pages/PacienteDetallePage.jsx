import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import api from '../api/api.js'

import ResponsablesPaciente from '../components/pacientes/ResponsablesPaciente.jsx'
import NotasPaciente from '../components/pacientes/NotasPaciente.jsx'
import PlanesTrabajoPaciente from '../components/pacientes/PlanesTrabajoPaciente.jsx'
import SesionesPaciente from '../components/pacientes/SesionesPaciente.jsx'

export default function PacienteDetallePage() {
  const { id } = useParams()

  const [
    paciente,
    setPaciente
  ] = useState(null)

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState(null)

  useEffect(() => {
    const cargarPaciente = async () => {
      try {
        setLoading(true)
        setError(null)

        const response =
          await api.get(
            `/pacientes/${id}`
          )

        const pacienteRecibido =
          response.data?.data ||
          response.data

        setPaciente(
          pacienteRecibido
        )
      } catch (error) {
        console.error(
          'Error al cargar paciente:',
          error
        )

        setError(
          error.response?.data?.message ||
          'No se pudo cargar el paciente'
        )
      } finally {
        setLoading(false)
      }
    }

    cargarPaciente()
  }, [id])

  const calcularEdad = (
    fechaNacimiento
  ) => {
    if (!fechaNacimiento) {
      return null
    }

    const nacimiento =
      new Date(
        fechaNacimiento
      )

    const hoy =
      new Date()

    let edad =
      hoy.getFullYear() -
      nacimiento.getFullYear()

    const diferenciaMes =
      hoy.getMonth() -
      nacimiento.getMonth()

    if (
      diferenciaMes < 0 ||
      (
        diferenciaMes === 0 &&
        hoy.getDate() <
          nacimiento.getDate()
      )
    ) {
      edad--
    }

    return edad
  }

  const formatearFecha = (
    fecha
  ) => {
    if (!fecha) {
      return 'Sin fecha'
    }

    return new Date(
      fecha
    ).toLocaleDateString(
      'es-UY'
    )
  }

  const mostrarLista = (
    lista,
    vacio
  ) => {
    if (
      !Array.isArray(lista) ||
      lista.length === 0
    ) {
      return vacio
    }

    return lista.join(', ')
  }

  if (loading) {
    return (
      <main className="patient-detail-page">
        <p>
          Cargando ficha del paciente...
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="patient-detail-page">

        <Link
          to="/pacientes"
          className="patient-detail-back"
        >
          ← Volver a pacientes
        </Link>

        <div className="patient-detail-error">
          <h1>
            Ficha del paciente
          </h1>

          <p>
            {error}
          </p>
        </div>

      </main>
    )
  }

  if (!paciente) {
    return (
      <main className="patient-detail-page">
        <p>
          Paciente no encontrado.
        </p>
      </main>
    )
  }

  const edad =
    calcularEdad(
      paciente.fechaNacimiento
    )

  const inicialNombre =
    paciente.nombre
      ?.charAt(0)
      ?.toUpperCase() ||
    ''

  const inicialApellido =
    paciente.apellido
      ?.charAt(0)
      ?.toUpperCase() ||
    ''

  return (
    <main className="patient-detail-page">

      {/* VOLVER */}

      <Link
        to="/pacientes"
        className="patient-detail-back"
      >
        ← Volver a pacientes
      </Link>

      {/* HEADER */}

      <section className="patient-detail-header">

        <div className="patient-detail-identity">

          <div className="patient-detail-avatar">
            {inicialNombre}
            {inicialApellido}
          </div>

          <div>
            <p className="patient-detail-eyebrow">
              Ficha del paciente
            </p>

            <div className="patient-detail-title-row">

              <h1>
                {paciente.nombre}{' '}
                {paciente.apellido}
              </h1>

              <span
                className={
                  paciente.activo
                    ? 'patient-detail-status active'
                    : 'patient-detail-status inactive'
                }
              >
                {paciente.activo
                  ? 'Activo'
                  : 'Inactivo'}
              </span>

            </div>

            <p className="patient-detail-summary">
              {edad !== null
                ? `${edad} años`
                : 'Edad no registrada'}

              {' · '}

              {paciente.documento
                ? `Documento ${paciente.documento}`
                : 'Sin documento'}
            </p>
          </div>

        </div>

      </section>

      {/* RESUMEN */}

      <section className="patient-detail-summary-grid">

        <div className="patient-detail-summary-card">
          <span>
            Fecha de nacimiento
          </span>

          <strong>
            {formatearFecha(
              paciente.fechaNacimiento
            )}
          </strong>
        </div>

        <div className="patient-detail-summary-card">
          <span>
            Edad
          </span>

          <strong>
            {edad !== null
              ? `${edad} años`
              : 'Sin fecha'}
          </strong>
        </div>

        <div className="patient-detail-summary-card">
          <span>
            Fecha de ingreso
          </span>

          <strong>
            {formatearFecha(
              paciente.fechaIngreso
            )}
          </strong>
        </div>

      </section>

      {/* DATOS PERSONALES */}

      <section className="patient-detail-card">

        <div className="patient-detail-section-header">
          <div>
            <p className="patient-detail-section-eyebrow">
              Información general
            </p>

            <h2>
              Datos personales
            </h2>
          </div>
        </div>

        <div className="patient-detail-data-grid">

          <div className="patient-detail-data-item">
            <span>
              Nombre
            </span>

            <strong>
              {paciente.nombre}
            </strong>
          </div>

          <div className="patient-detail-data-item">
            <span>
              Apellido
            </span>

            <strong>
              {paciente.apellido}
            </strong>
          </div>

          <div className="patient-detail-data-item">
            <span>
              Documento
            </span>

            <strong>
              {paciente.documento ||
                'Sin documento'}
            </strong>
          </div>

          <div className="patient-detail-data-item">
            <span>
              Nacimiento
            </span>

            <strong>
              {formatearFecha(
                paciente.fechaNacimiento
              )}
            </strong>
          </div>

          <div className="patient-detail-data-item">
            <span>
              Edad
            </span>

            <strong>
              {edad !== null
                ? `${edad} años`
                : 'Sin fecha'}
            </strong>
          </div>

          <div className="patient-detail-data-item">
            <span>
              Ingreso
            </span>

            <strong>
              {formatearFecha(
                paciente.fechaIngreso
              )}
            </strong>
          </div>

        </div>

      </section>

      {/* INFORMACIÓN CLÍNICA */}

      <section className="patient-detail-card">

        <div className="patient-detail-section-header">
          <div>
            <p className="patient-detail-section-eyebrow">
              Historia clínica
            </p>

            <h2>
              Información clínica
            </h2>
          </div>
        </div>

        <div className="patient-clinical-grid">

          <div className="patient-clinical-item">
            <span>
              Enfermedades
            </span>

            <p>
              {mostrarLista(
                paciente.enfermedades,
                'Ninguna registrada'
              )}
            </p>
          </div>

          <div className="patient-clinical-item">
            <span>
              Alergias
            </span>

            <p>
              {mostrarLista(
                paciente.alergias,
                'Ninguna registrada'
              )}
            </p>
          </div>

          <div className="patient-clinical-item">
            <span>
              Medicamentos
            </span>

            <p>
              {mostrarLista(
                paciente.medicamentos,
                'Ninguno registrado'
              )}
            </p>
          </div>

          <div className="patient-clinical-item">
            <span>
              Antecedentes
            </span>

            <p>
              {paciente.antecedentes ||
                'Sin antecedentes registrados'}
            </p>
          </div>

          <div className="patient-clinical-item full">
            <span>
              Información importante
            </span>

            <p>
              {paciente.informacionImportante ||
                'Sin información registrada'}
            </p>
          </div>

          <div className="patient-clinical-item full">
            <span>
              Observaciones generales
            </span>

            <p>
              {paciente.observacionesGenerales ||
                'Sin observaciones'}
            </p>
          </div>

        </div>

      </section>

      {/* RESPONSABLES */}

      <section className="patient-detail-module">
        <ResponsablesPaciente
          pacienteId={
            paciente._id
          }
        />
      </section>

      {/* NOTAS */}

      <section className="patient-detail-module">
        <NotasPaciente
          pacienteId={
            paciente._id
          }
        />
      </section>

      {/* PLANES */}

      <section className="patient-detail-module">
        <PlanesTrabajoPaciente
          pacienteId={
            paciente._id
          }
        />
      </section>

      {/* SESIONES */}

      <section className="patient-detail-module patient-detail-sessions">
        <SesionesPaciente
          pacienteId={
            paciente._id
          }
        />
      </section>

    </main>
  )
}