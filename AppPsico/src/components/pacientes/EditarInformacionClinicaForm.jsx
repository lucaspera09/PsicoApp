import { useState } from 'react'

import api from '../../api/api.js'

export default function EditarInformacionClinicaForm({
  paciente,
  onUpdated,
  onCancel
}) {
  const [form, setForm] = useState({
    enfermedades:
      paciente.enfermedades?.join(', ') || '',

    alergias:
      paciente.alergias?.join(', ') || '',

    medicamentos:
      paciente.medicamentos?.join(', ') || '',

    antecedentes:
      paciente.antecedentes || '',

    informacionImportante:
      paciente.informacionImportante || '',

    observacionesGenerales:
      paciente.observacionesGenerales || ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  const convertirALista = (texto) => {
    return texto
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const response = await api.put(
        `/pacientes/${paciente._id}`,
        {
          enfermedades:
            convertirALista(
              form.enfermedades
            ),

          alergias:
            convertirALista(
              form.alergias
            ),

          medicamentos:
            convertirALista(
              form.medicamentos
            ),

          antecedentes:
            form.antecedentes.trim(),

          informacionImportante:
            form.informacionImportante.trim(),

          observacionesGenerales:
            form.observacionesGenerales.trim()
        }
      )

      const pacienteActualizado =
        response.data?.data ||
        response.data

      if (onUpdated) {
        onUpdated(
          pacienteActualizado
        )
      }
    } catch (error) {
      console.error(
        'Error al editar información clínica:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo actualizar la información clínica'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="clinical-form-section">

      <div className="clinical-form-header">

        <div>
          <p className="clinical-form-eyebrow">
            Historia clínica
          </p>

          <h3>
            Editar información clínica
          </h3>

          <p>
            Actualizá la información de salud
            y las observaciones generales.
          </p>
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="clinical-form"
      >

        <div className="clinical-form-grid">

          <div className="form-group">

            <label htmlFor="clinica-enfermedades">
              Enfermedades
            </label>

            <input
              id="clinica-enfermedades"
              name="enfermedades"
              type="text"
              value={form.enfermedades}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: asma, diabetes"
            />

            <small>
              Separalas con comas.
            </small>

          </div>

          <div className="form-group">

            <label htmlFor="clinica-alergias">
              Alergias
            </label>

            <input
              id="clinica-alergias"
              name="alergias"
              type="text"
              value={form.alergias}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: penicilina, frutos secos"
            />

            <small>
              Separalas con comas.
            </small>

          </div>

          <div className="form-group clinical-form-full">

            <label htmlFor="clinica-medicamentos">
              Medicamentos
            </label>

            <input
              id="clinica-medicamentos"
              name="medicamentos"
              type="text"
              value={form.medicamentos}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: Salbutamol, Risperidona"
            />

            <small>
              Separalos con comas.
            </small>

          </div>

        </div>

        <div className="form-group">

          <label htmlFor="clinica-antecedentes">
            Antecedentes
          </label>

          <textarea
            id="clinica-antecedentes"
            name="antecedentes"
            value={form.antecedentes}
            onChange={handleChange}
            className="form-control clinical-form-textarea"
            rows="4"
            placeholder="Antecedentes médicos, familiares o del desarrollo..."
          />

        </div>

        <div className="form-group clinical-important-field">

          <label htmlFor="clinica-importante">
            Información importante
          </label>

          <textarea
            id="clinica-importante"
            name="informacionImportante"
            value={form.informacionImportante}
            onChange={handleChange}
            className="form-control clinical-form-textarea"
            rows="4"
            placeholder="Información que sea importante tener presente..."
          />

        </div>

        <div className="form-group">

          <label htmlFor="clinica-observaciones">
            Observaciones generales
          </label>

          <textarea
            id="clinica-observaciones"
            name="observacionesGenerales"
            value={form.observacionesGenerales}
            onChange={handleChange}
            className="form-control clinical-form-textarea"
            rows="5"
            placeholder="Observaciones generales sobre el paciente..."
          />

        </div>

        {error && (
          <div className="clinical-form-error">
            {error}
          </div>
        )}

        <div className="clinical-form-actions">

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : 'Guardar información clínica'}
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