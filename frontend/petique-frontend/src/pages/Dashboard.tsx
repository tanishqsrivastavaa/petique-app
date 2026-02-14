import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { PawPrint, CalendarCheck } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import { Link } from 'react-router-dom'

type Pet = { id: string; name: string; species: string; breed: string | null }
type Booking = {
  id: string
  pet_id: string
  vet_id: string
  start_at: string
  end_at: string
  booking_status: string
  reason: string | null
}

const DashboardPage = () => {
  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ['pets'],
    queryFn: async () => (await api.get('/pets')).data,
  })

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => (await api.get('/bookings')).data,
  })

  const upcomingBookings = bookings
    .filter((b) => b.booking_status === 'pending' || b.booking_status === 'confirmed')
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="page-sub">Welcome back! Here's an overview of your pets and appointments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={PawPrint} label="My Pets" value={pets.length} />
        <StatCard icon={CalendarCheck} label="Upcoming Bookings" value={upcomingBookings.length} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/pets"
          className="card flex items-center gap-4 p-6 hover:border-brand-300 transition"
        >
          <div className="rounded-xl bg-brand-50 p-3">
            <PawPrint size={22} className="text-brand-500" />
          </div>
          <div>
            <p className="font-semibold text-ink">Manage Pets</p>
            <p className="text-sm text-ink/60">Add, edit, or view your furry friends</p>
          </div>
        </Link>
        <Link
          to="/vets"
          className="card flex items-center gap-4 p-6 hover:border-brand-300 transition"
        >
          <div className="rounded-xl bg-brand-50 p-3">
            <CalendarCheck size={22} className="text-brand-500" />
          </div>
          <div>
            <p className="font-semibold text-ink">Book Appointment</p>
            <p className="text-sm text-ink/60">Browse vets and schedule a visit</p>
          </div>
        </Link>
      </div>

      {/* Upcoming */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">Upcoming Appointments</h2>
        {upcomingBookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No upcoming appointments"
            description="Browse vets and book your first appointment!"
            action={
              <Link to="/vets" className="btn-primary inline-flex !w-auto px-6">
                Browse Vets
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const pet = pets.find((p) => p.id === booking.pet_id)
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {pet?.name ?? 'Pet'}{' '}
                      <span className="text-ink/50 font-normal">· {pet?.species}</span>
                    </p>
                    <p className="text-sm text-ink/60">
                      {new Date(booking.start_at).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                      {' at '}
                      {new Date(booking.start_at).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <StatusBadge status={booking.booking_status} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
