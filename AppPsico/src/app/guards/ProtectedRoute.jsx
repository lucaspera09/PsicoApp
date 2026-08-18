import { Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ allowedRoles }) {
  const {
    user,
    token,
    initialized
  } = useSelector((state) => state.auth)

  if (!initialized && token) {
    return null
  }

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return <Outlet />
}