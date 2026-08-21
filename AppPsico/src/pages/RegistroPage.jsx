import {
  useState
} from 'react'

import {
  Link
} from 'react-router'

import api from '../api/api.js'

import NexoLogo from '../components/branding/NexoLogo.jsx'

export default function RegistroPage() {
  const [form, setForm] =
    useState({
      nombre: '',
      apellido: '',
      profesion: '',
      telefono: '',
      email: '',
      password: '',
      repetirPassword: ''
    })

  const [
    mostrarPassword,
    setMostrarPassword
  ] = useState(false)

  const [
    loading,
    setLoading
  ] = useState(false)

  const [
    error,
    setError
  ] = useState(null)

  const [
    enviado,
    setEnviado
  ] = useState(false)

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

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.profesion.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError(
        'Completá todos los campos obligatorios'
      )

      return
    }

    if (
      form.password.length < 8
    ) {
      setError(
        'La contraseña debe tener al menos 8 caracteres'
      )

      return
    }

    if (
      form.password !==
      form.repetirPassword
    ) {
      setError(
        'Las contraseñas no coinciden'
      )

      return
    }

    try {
      setLoading(true)
      setError(null)

      await api.post(
        '/auth/register',
        {
          nombre:
            form.nombre.trim(),

          apellido:
            form.apellido.trim(),

          profesion:
            form.profesion.trim(),

          telefono:
            form.telefono.trim(),

          email:
            form.email.trim(),

          password:
            form.password
        }
      )

      setEnviado(true)

    } catch (error) {
      console.error(
        'Error al registrar profesional:',
        error
      )

      setError(
        error.response?.data?.message ||
        'No se pudo enviar la solicitud'
      )
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <main className="register-page">

        <section className="register-success-card">

          <NexoLogo
            size={76}
          />

          <div className="register-success-icon">
            ✓
          </div>

          <h1>
            Solicitud enviada
          </h1>

          <p>
            Tu cuenta fue creada correctamente
            y quedó pendiente de aprobación.
          </p>

          <p className="register-success-detail">
            Cuando un administrador apruebe
            tu solicitud vas a poder iniciar
            sesión con el email y contraseña
            que elegiste.
          </p>

          <Link
            to="/login"
            className="register-back-login"
          >
            Volver al inicio de sesión
          </Link>

        </section>

      </main>
    )
  }

  return (
    <main className="register-page">

      <div className="register-decor register-decor-one" />
      <div className="register-decor register-decor-two" />

      <section className="register-card">

        {/* MARCA */}

        <div className="register-brand">

          <NexoLogo
            size={58}
          />

          <div>

            <h1>
              Nexo
            </h1>

            <p>
              Agenda y seguimiento profesional
            </p>

          </div>

        </div>

        {/* ENCABEZADO */}

        <div className="register-heading">

          <span>
            Crear cuenta profesional
          </span>

          <h2>
            Solicitá tu acceso
          </h2>

          <p>
            Completá tus datos. Tu cuenta
            quedará pendiente hasta ser
            aprobada.
          </p>

        </div>

        {/* FORMULARIO */}

        <form
          className="register-form"
          onSubmit={
            handleSubmit
          }
        >

          <div className="register-grid">

            <div className="register-field">

              <label htmlFor="nombre">
                Nombre *
              </label>

              <input
                id="nombre"
                name="nombre"
                type="text"
                value={
                  form.nombre
                }
                onChange={
                  handleChange
                }
                placeholder="Tu nombre"
                required
              />

            </div>

            <div className="register-field">

              <label htmlFor="apellido">
                Apellido *
              </label>

              <input
                id="apellido"
                name="apellido"
                type="text"
                value={
                  form.apellido
                }
                onChange={
                  handleChange
                }
                placeholder="Tu apellido"
                required
              />

            </div>

          </div>

          <div className="register-grid">

            <div className="register-field">

              <label htmlFor="profesion">
                Profesión *
              </label>

              <input
                id="profesion"
                name="profesion"
                type="text"
                value={
                  form.profesion
                }
                onChange={
                  handleChange
                }
                placeholder="Ej: Psicomotricista"
                required
              />

            </div>

            <div className="register-field">

              <label htmlFor="telefono">
                Teléfono
              </label>

              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={
                  form.telefono
                }
                onChange={
                  handleChange
                }
                placeholder="Ej: 099 123 456"
              />

            </div>

          </div>

          <div className="register-field">

            <label htmlFor="email">
              Email *
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />

          </div>

          <div className="register-grid">

            <div className="register-field">

              <label htmlFor="password">
                Contraseña *
              </label>

              <div className="register-password-wrapper">

                <input
                  id="password"
                  name="password"
                  type={
                    mostrarPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    form.password
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword(
                      (prev) =>
                        !prev
                    )
                  }
                >
                  {mostrarPassword
                    ? 'Ocultar'
                    : 'Ver'}
                </button>

              </div>

            </div>

            <div className="register-field">

              <label htmlFor="repetirPassword">
                Repetir contraseña *
              </label>

              <input
                id="repetirPassword"
                name="repetirPassword"
                type={
                  mostrarPassword
                    ? 'text'
                    : 'password'
                }
                value={
                  form.repetirPassword
                }
                onChange={
                  handleChange
                }
                placeholder="Repetí tu contraseña"
                autoComplete="new-password"
                required
              />

            </div>

          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={
              loading
            }
          >
            {loading
              ? 'Enviando solicitud...'
              : 'Enviar solicitud'}
          </button>

        </form>

        <div className="register-login-link">

          <span>
            ¿Ya tenés una cuenta?
          </span>

          <Link
            to="/login"
          >
            Iniciar sesión
          </Link>

        </div>

      </section>

    </main>
  )
}