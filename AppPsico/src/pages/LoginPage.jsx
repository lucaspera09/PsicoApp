import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  login,
  clearAuthError
} from '../features/auth.slice.js'

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

      <div className="login-background-circle login-circle-one" />

      <div className="login-background-circle login-circle-two" />

      <section className="login-card">

        {/* MARCA */}

        <div className="login-brand">

          <div className="login-logo">
            P
          </div>

          <div>
            <h1>
              PsicoApp
            </h1>

            <p>
              Gestión clínica simple,
              organizada y profesional.
            </p>
          </div>

        </div>

        {/* TITULO */}

        <div className="login-heading">

          <h2>
            Bienvenido
          </h2>

          <p>
            Ingresá a tu cuenta para
            continuar.
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
                @
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
                placeholder="tu@email.com"
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
                •
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

          {/* ERROR */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* BOTON */}

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

        </form>

        <div className="login-footer">
          <span>
            PsicoApp
          </span>

          <span>
            Gestión para profesionales
          </span>
        </div>

      </section>

    </main>
  )
}