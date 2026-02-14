import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RoleRoute } from './routes/RoleRoute'
import { isAuthenticated, getRole } from './lib/auth'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import MyPetsPage from './pages/owner/MyPets'
import BrowseVetsPage from './pages/owner/BrowseVets'
import VetDetailPage from './pages/owner/VetDetail'
import MyBookingsPage from './pages/owner/MyBookings'
import VetDashboardPage from './pages/vet/VetDashboard'
import VetProfilePage from './pages/vet/VetProfile'
import SchedulePage from './pages/vet/Schedule'
import TimeOffPage from './pages/vet/TimeOff'
import VetBookingsPage from './pages/vet/VetBookings'
import VetBookingDetailPage from './pages/vet/VetBookingDetail'

const RootRedirect = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  const role = getRole()
  const redirectTo = role === 'vet' ? '/vet/dashboard' : '/dashboard'
  return <Navigate to={redirectTo} replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  /* ── Owner routes ───────────────────────── */
  {
    element: (
      <RoleRoute role="owner">
        <AppLayout />
      </RoleRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/pets', element: <MyPetsPage /> },
      { path: '/vets', element: <BrowseVetsPage /> },
      { path: '/vets/:vetId', element: <VetDetailPage /> },
      { path: '/bookings', element: <MyBookingsPage /> },
    ],
  },

  /* ── Vet routes ─────────────────────────── */
  {
    element: (
      <RoleRoute role="vet">
        <AppLayout />
      </RoleRoute>
    ),
    children: [
      { path: '/vet/dashboard', element: <VetDashboardPage /> },
      { path: '/vet/profile', element: <VetProfilePage /> },
      { path: '/vet/schedule', element: <SchedulePage /> },
      { path: '/vet/time-off', element: <TimeOffPage /> },
      { path: '/vet/bookings', element: <VetBookingsPage /> },
      { path: '/vet/bookings/:bookingId', element: <VetBookingDetailPage /> },
    ],
  },
])
