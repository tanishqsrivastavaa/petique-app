import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, getRole } from '../lib/auth'
import { type ReactNode } from 'react'

type RoleRouteProps = {
    role: 'owner' | 'vet'
    children: ReactNode
}

export const RoleRoute = ({ role, children }: RoleRouteProps) => {
    const location = useLocation()

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    const currentRole = getRole()
    if (currentRole !== role) {
        const redirect = currentRole === 'vet' ? '/vet/dashboard' : '/dashboard'
        return <Navigate to={redirect} replace />
    }

    return <>{children}</>
}
