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
  } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    return () => {
      dispatch(clearAuthError())
    }
  }, [dispatch])

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
      dispatch(clearAuthError())
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.email.trim() || !form.password) {
      return
    }

    await dispatch(
      login({
        email: form.email.trim(),
        password: form.password
      })
    )
  }

  return (
    <main>
      <section>

        <h1>PsicoApp</h1>

        <p>
          Ingresá a tu cuenta
        </p>

        <form onSubmit={handleSubmit}>

          <div>
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ingresá tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Ingresando...'
              : 'Iniciar sesión'
            }
          </button>

        </form>

      </section>
    </main>
  )
}