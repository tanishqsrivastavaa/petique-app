import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { CalendarCheck, Clock } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'

type Booking = {
    id: string
    start_at: string
    end_at: string
    booking_status: string
    reason: string | null
}

type VetProfile = {
    id: string
    full_name: string
}

const VetDashboardPage = () => {
    const { data: profile } = useQuery<VetProfile>({
        queryKey: ['vet-profile'],
        queryFn: async () => (await api.get('/vets/me')).data,
    })

    // Vets can see bookings via the general endpoint (the backend filters by user)
    // For now, we'll show a simple view of the vet's schedule
    const { data: bookings = [] } = useQuery<Booking[]>({
        queryKey: ['vet-bookings'],
        queryFn: async () => {
            try {
                return (await api.get('/bookings/vet')).data
            } catch {
                return []
            }
        },
    })

    const today = new Date().toISOString().split('T')[0]
    const todayBookings = bookings.filter(
        (b) => b.start_at.startsWith(today) && b.booking_status !== 'cancelled'
    )
    const upcomingBookings = bookings
        .filter((b) => new Date(b.start_at) >= new Date() && b.booking_status !== 'cancelled')
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
        .slice(0, 5)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="page-header">
                    Welcome, Dr. {profile?.full_name?.split(' ').filter(w => !['dr.', 'mr.', 'mrs.', 'ms.'].includes(w.toLowerCase()))[0] ?? 'Doctor'}!
                </h1>
                <p className="page-sub">Here's your schedule overview.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard icon={CalendarCheck} label="Today's Appointments" value={todayBookings.length} />
                <StatCard icon={Clock} label="Upcoming" value={upcomingBookings.length} />
            </div>

            <div className="card p-6">
                <h2 className="mb-4 text-lg font-bold text-ink">Upcoming Appointments</h2>
                {upcomingBookings.length === 0 ? (
                    <EmptyState
                        icon={CalendarCheck}
                        title="No upcoming appointments"
                        description="Your schedule is clear. New bookings will appear here."
                    />
                ) : (
                    <div className="space-y-3">
                        {upcomingBookings.map((b) => (
                            <div
                                key={b.id}
                                className="flex items-center justify-between rounded-xl border border-border p-4"
                            >
                                <div>
                                    <p className="font-semibold text-ink">
                                        {new Date(b.start_at).toLocaleDateString('en-US', {
                                            weekday: 'short', month: 'short', day: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-sm text-ink/60">
                                        {new Date(b.start_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                        {' — '}
                                        {new Date(b.end_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>
                                    {b.reason && <p className="text-xs text-ink/50">{b.reason}</p>}
                                </div>
                                <StatusBadge status={b.booking_status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default VetDashboardPage
