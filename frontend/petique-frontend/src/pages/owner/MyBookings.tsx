import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { toast } from 'sonner'
import { CalendarCheck } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import { Link } from 'react-router-dom'

type Booking = {
    id: string
    pet_id: string
    vet_id: string
    start_at: string
    end_at: string
    booking_status: string
    reason: string | null
}

const MyBookingsPage = () => {
    const queryClient = useQueryClient()

    const { data: bookings = [], isLoading } = useQuery<Booking[]>({
        queryKey: ['bookings'],
        queryFn: async () => (await api.get('/bookings')).data,
    })

    const cancelMut = useMutation({
        mutationFn: (id: string) =>
            api.patch(`/bookings/${id}`, { booking_status: 'cancelled' }),
        onSuccess: () => {
            toast.success('Booking cancelled')
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
        },
        onError: () => toast.error('Failed to cancel booking'),
    })

    const sortedBookings = [...bookings].sort(
        (a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-header">My Bookings</h1>
                <p className="page-sub">View and manage your vet appointments.</p>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-ink/40">Loading...</div>
            ) : sortedBookings.length === 0 ? (
                <EmptyState
                    icon={CalendarCheck}
                    title="No bookings yet"
                    description="Find a vet and book your first appointment!"
                    action={
                        <Link to="/vets" className="btn-primary inline-flex !w-auto px-6">
                            Browse Vets
                        </Link>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {sortedBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="card flex items-center justify-between p-5"
                        >
                            <div className="space-y-1">
                                <p className="font-semibold text-ink">
                                    {new Date(booking.start_at).toLocaleDateString('en-US', {
                                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                                    })}
                                </p>
                                <p className="text-sm text-ink/60">
                                    {new Date(booking.start_at).toLocaleTimeString('en-US', {
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                    {' — '}
                                    {new Date(booking.end_at).toLocaleTimeString('en-US', {
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                </p>
                                {booking.reason && (
                                    <p className="text-sm text-ink/50">Reason: {booking.reason}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={booking.booking_status} />
                                {booking.booking_status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Cancel this booking?')) cancelMut.mutate(booking.id)
                                        }}
                                        className="text-sm text-danger hover:underline"
                                        disabled={cancelMut.isPending}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyBookingsPage
