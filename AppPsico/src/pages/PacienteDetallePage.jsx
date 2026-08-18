import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'


import api from '../api/api.js'
import ResponsablesPaciente from '../components/pacientes/ResponsablesPaciente.jsx'
import NotasPaciente from '../components/pacientes/NotasPaciente.jsx'
import PlanesTrabajoPaciente from '../components/pacientes/PlanesTrabajoPaciente.jsx'
import SesionesPaciente from '../components/pacientes/SesionesPaciente.jsx'

export default function PacienteDetallePage() {
  const { id } = useParams()

  const [paciente, setPaciente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarPaciente = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(
          `/pacientes/${id}`
        )

        const pacienteRecibido =
          response.data?.data || response.data

        setPaciente(pacienteRecibido)
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

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) {
      return null
    }

    const nacimiento = new Date(fechaNacimiento)
    const hoy = new Date()

    let edad =
      hoy.getFullYear() - nacimiento.getFullYear()

    const diferenciaMes =
      hoy.getMonth() - nacimiento.getMonth()

    if (
      diferenciaMes < 0 ||
      (
        diferenciaMes === 0 &&
        hoy.getDate() < nacimiento.getDate()
      )
    ) {
      edad--
    }

    return edad
  }

  if (loading) {
    return (
      <main>
        <p>Cargando ficha del paciente...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Ficha del paciente</h1>

        <p>{error}</p>

        <Link to="/pacientes">
          Volver a pacientes
        </Link>
      </main>
    )
  }

  if (!paciente) {
    return (
      <main>
        <p>Paciente no encontrado.</p>
      </main>
    )
  }

  return (
    <main>

      <Link to="/pacientes">
        ← Volver a pacientes
      </Link>

      <h1>
        {paciente.nombre}{' '}
        {paciente.apellido}
      </h1>

      <p>
        Estado:{' '}
        <strong>
          {paciente.activo
            ? 'Activo'
            : 'Inactivo'}
        </strong>
      </p>

      <section>
        <h2>Datos personales</h2>

        <p>
          <strong>Nombre:</strong>{' '}
          {paciente.nombre}
        </p>

        <p>
          <strong>Apellido:</strong>{' '}
          {paciente.apellido}
        </p>

        <p>
          <strong>Documento:</strong>{' '}
          {paciente.documento ||
            'Sin documento'}
        </p>

        <p>
          <strong>Fecha de nacimiento:</strong>{' '}
          {paciente.fechaNacimiento
            ? new Date(
                paciente.fechaNacimiento
              ).toLocaleDateString('es-UY')
            : 'Sin fecha'
          }
        </p>

        <p>
          <strong>Edad:</strong>{' '}
          {paciente.fechaNacimiento
            ? `${calcularEdad(
                paciente.fechaNacimiento
              )} años`
            : 'Sin fecha de nacimiento'
          }
        </p>

        <p>
          <strong>Fecha de ingreso:</strong>{' '}
          {paciente.fechaIngreso
            ? new Date(
                paciente.fechaIngreso
              ).toLocaleDateString('es-UY')
            : 'Sin fecha'
          }
        </p>
      </section>

      <section>
        <h2>Información clínica</h2>

        <p>
          <strong>Enfermedades:</strong>{' '}
          {paciente.enfermedades?.length > 0
            ? paciente.enfermedades.join(', ')
            : 'Ninguna registrada'
          }
        </p>

        <p>
          <strong>Alergias:</strong>{' '}
          {paciente.alergias?.length > 0
            ? paciente.alergias.join(', ')
            : 'Ninguna registrada'
          }
        </p>

        <p>
          <strong>Medicamentos:</strong>{' '}
          {paciente.medicamentos?.length > 0
            ? paciente.medicamentos.join(', ')
            : 'Ninguno registrado'
          }
        </p>

        <p>
          <strong>Antecedentes:</strong>{' '}
          {paciente.antecedentes ||
            'Sin antecedentes registrados'}
        </p>

        <p>
          <strong>Información importante:</strong>{' '}
          {paciente.informacionImportante ||
            'Sin información registrada'}
        </p>

        <p>
          <strong>Observaciones generales:</strong>{' '}
          {paciente.observacionesGenerales ||
            'Sin observaciones'}
        </p>
      </section>

  <section>
  <h2>Información clínica</h2>

  {/* todo lo que ya tenés */}
</section>

<ResponsablesPaciente
  pacienteId={paciente._id}
/>
<NotasPaciente
  pacienteId={paciente._id}
/>
<PlanesTrabajoPaciente
  pacienteId={paciente._id}
/>

<SesionesPaciente
  pacienteId={paciente._id}
/>
    </main>
  )
}