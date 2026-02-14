import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'
import { type ReactNode } from 'react'

type ProtectedRouteProps = {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

