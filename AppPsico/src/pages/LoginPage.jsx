import {
  useEffect,
  useState
} from 'react'

import {
  useDispatch,
  useSelector
} from 'react-redux'

import {
  login,
  clearAuthError
} from '../features/auth.slice.js'

import {
  Link
} from 'react-router'

import NexoLogo from '../components/branding/NexoLogo.jsx'

export default function LoginPage() {
  const dispatch = useDispatch()

  const {
    loading,
    error
  } = useSelector(
    (state) => state.auth
  )

  const [
    mostrarPassword,
    setMostrarPassword
  ] = useState(false)

  const [
    form,
    setForm
  ] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    return () => {
      dispatch(
        clearAuthError()
      )
    }
  }, [dispatch])

  const handleChange = (
    event
  ) => {
    const {
      name,
      value
    } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))

    if (error) {
      dispatch(
        clearAuthError()
      )
    }
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (
      !form.email.trim() ||
      !form.password
    ) {
      return
    }

    await dispatch(
      login({
        email:
          form.email.trim(),

        password:
          form.password
      })
    )
  }

  return (
    <main className="login-page">

      <div className="login-decor login-decor-one" />

      <div className="login-decor login-decor-two" />

      <div className="login-shell">

        {/* =========================
            LADO IZQUIERDO
        ========================== */}

        <section className="login-showcase">

          <div className="login-showcase-brand">

            <NexoLogo
              size={38}
            />

            <strong>
              Nexo
            </strong>

          </div>

          <div className="login-showcase-content">

            <div className="login-showcase-copy">

              <span className="login-showcase-eyebrow">
                Agenda y seguimiento profesional
              </span>

              <h1>
                Organizá cada sesión.
                <strong>
                  Registrá lo importante.
                </strong>
              </h1>

              <p>
                Tu agenda, tus pacientes
                y tus notas siempre en orden.
              </p>

            </div>

            <div className="login-benefits">

              <div className="login-benefit">

                <div className="login-benefit-icon">
                  ◷
                </div>

                <div>
                  <strong>
                    Agenda simple
                  </strong>

                  <span>
                    Visualizá y organizá
                    rápidamente tus turnos.
                  </span>
                </div>

              </div>

              <div className="login-benefit">

                <div className="login-benefit-icon">
                  ✎
                </div>

                <div>
                  <strong>
                    Registro rápido
                  </strong>

                  <span>
                    Guardá sesiones y notas
                    sin perder tiempo.
                  </span>
                </div>

              </div>

              <div className="login-benefit">

                <div className="login-benefit-icon">
                  ◎
                </div>

                <div>
                  <strong>
                    Seguimiento profesional
                  </strong>

                  <span>
                    Toda la información
                    del paciente en un lugar.
                  </span>
                </div>

              </div>

            </div>

            {/* ILUSTRACIÓN VISUAL */}

            <div className="login-showcase-visual">

              <div className="login-floating-card login-floating-calendar">

                <div className="login-floating-card-header">

                  <span>
                    Hoy
                  </span>

                  <strong>
                    Agenda
                  </strong>

                </div>

                <div className="login-mini-turn">

                  <span>
                    14:00
                  </span>

                  <div>
                    <strong>
                      Mateo Pérez
                    </strong>

                    <small>
                      Sesión
                    </small>
                  </div>

                </div>

                <div className="login-mini-turn">

                  <span>
                    15:00
                  </span>

                  <div>
                    <strong>
                      Sofía García
                    </strong>

                    <small>
                      Sesión
                    </small>
                  </div>

                </div>

              </div>

              <div className="login-floating-card login-floating-note">

                <span className="login-floating-label">
                  Nota rápida
                </span>

                <strong>
                  Conversación con la familia
                </strong>

                <p>
                  Buena evolución durante
                  las últimas sesiones...
                </p>

              </div>

              <div className="login-floating-card login-floating-next">

                <span className="login-floating-label">
                  Próximo turno
                </span>

                <strong>
                  16:30
                </strong>

                <p>
                  Juan Rodríguez
                </p>

              </div>

              <div className="login-floating-logo">

                <NexoLogo
                  size={78}
                />

              </div>

            </div>

          </div>

          <div className="login-showcase-footer">

            <span>
              ✓ Información organizada
            </span>

            <span>
              ✓ Acceso desde cualquier dispositivo
            </span>

          </div>

        </section>

        {/* =========================
            LOGIN
        ========================== */}

        <section className="login-panel">

          <div className="login-card">

            {/* LOGO GRANDE */}

            <div className="login-main-brand">

              <NexoLogo
                size={92}
                className="login-main-logo"
              />

              <h1>
                Nexo
              </h1>

              <p>
                Agenda y seguimiento
                profesional
              </p>

            </div>

            {/* TITULO */}

            <div className="login-heading">

              <h2>
                Bienvenido
              </h2>

              <p>
                Ingresá a tu cuenta
                para continuar.
              </p>

            </div>

            {/* FORMULARIO */}

            <form
              className="login-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* EMAIL */}

              <div className="login-form-group">

                <label htmlFor="email">
                  Email
                </label>

                <div className="login-input-wrapper">

                  <span className="login-input-icon">
                    ✉
                  </span>

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
                    placeholder="Correo electrónico"
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="login-form-group">

                <label htmlFor="password">
                  Contraseña
                </label>

                <div className="login-input-wrapper">

                  <span className="login-input-icon">
                    ⌑
                  </span>

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
                    placeholder="Ingresá tu contraseña"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setMostrarPassword(
                        (prev) =>
                          !prev
                      )
                    }
                    aria-label={
                      mostrarPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    {mostrarPassword
                      ? 'Ocultar'
                      : 'Ver'}
                  </button>

                </div>

              </div>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={
                  loading
                }
              >
                {loading
                  ? 'Ingresando...'
                  : 'Iniciar sesión'}
              </button>

                  <div className="login-register">

  <span>
    ¿Sos profesional y todavía no tenés cuenta?
  </span>

  <Link
    to="/registro"
  >
    Crear cuenta
  </Link>

</div>
            </form>

            <div className="login-card-message">
              ♡ Organizá, registrá y acompañá.
            </div>

          </div>

        </section>

      </div>

    </main>
  )
}