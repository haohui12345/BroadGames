import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function PrivateRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function AdminRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/" replace />

  return <Outlet />
}

export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}