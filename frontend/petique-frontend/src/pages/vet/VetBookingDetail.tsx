import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, PawPrint, CalendarCheck, Clock } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import { toast } from 'sonner'

type PetSummary = {
    id: string
    name: string
    species: string
    breed: string | null
    date_of_birth: string | null
    sex: string | null
    notes: string | null
}

type OwnerSummary = {
    id: string
    full_name: string
    email: string
}

type BookingDetail = {
    id: string
    pet_id: string
    vet_id: string
    user_id: string
    start_at: string
    end_at: string
    booking_status: string
    reason: string | null
    pet: PetSummary
    owner: OwnerSummary
}

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-slate-100 text-slate-700 border-slate-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    no_show: 'bg-orange-100 text-orange-800 border-orange-300',
}

function calculateAge(dob: string | null): string {
    if (!dob) return 'Unknown'
    const birthDate = new Date(dob)
    const now = new Date()
    let years = now.getFullYear() - birthDate.getFullYear()
    let months = now.getMonth() - birthDate.getMonth()
    if (months < 0) {
        years--
        months += 12
    }
    if (years > 0) return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? `, ${months} mo` : ''}`
    return `${months} month${months !== 1 ? 's' : ''}`
}

const VetBookingDetailPage = () => {
    const { bookingId } = useParams<{ bookingId: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: booking, isLoading } = useQuery<BookingDetail>({
        queryKey: ['vet-booking-detail', bookingId],
        queryFn: async () => (await api.get(`/bookings/vet/${bookingId}`)).data,
        enabled: !!bookingId,
    })

    const { mutate: updateStatus, isPending } = useMutation({
        mutationFn: async (newStatus: string) => {
            return (await api.patch(`/bookings/vet/${bookingId}`, { booking_status: newStatus })).data
        },
        onSuccess: () => {
            toast.success('Status updated!')
            queryClient.invalidateQueries({ queryKey: ['vet-booking-detail', bookingId] })
            queryClient.invalidateQueries({ queryKey: ['vet-bookings'] })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail ?? 'Failed to update status')
        },
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-ink/60">Loading booking details…</p>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-semibold text-ink">Booking not found</p>
                <button onClick={() => navigate('/vet/bookings')} className="btn-primary mt-4 !w-auto px-6">
                    Back to Bookings
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Back button */}
            <button
                onClick={() => navigate('/vet/bookings')}
                className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink transition"
            >
                <ArrowLeft size={16} />
                Back to Bookings
            </button>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="page-header">Booking Details</h1>
                    <p className="page-sub">
                        {new Date(booking.start_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </p>
                </div>
                <StatusBadge status={booking.booking_status} />
            </div>

            {/* Booking Info */}
            <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-xl bg-brand-50 p-2.5">
                        <CalendarCheck size={20} className="text-brand-500" />
                    </div>
                    <h2 className="text-lg font-bold text-ink">Appointment</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Date</p>
                        <p className="text-sm font-medium text-ink">
                            {new Date(booking.start_at).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Time</p>
                        <p className="text-sm font-medium text-ink">
                            {new Date(booking.start_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                            {' — '}
                            {new Date(booking.end_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Status</p>
                        <p className="text-sm font-medium text-ink capitalize">{booking.booking_status.replace('_', ' ')}</p>
                    </div>
                    {booking.reason && (
                        <div className="sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Reason</p>
                            <p className="text-sm text-ink">{booking.reason}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Owner Info */}
            <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-xl bg-brand-50 p-2.5">
                        <User size={20} className="text-brand-500" />
                    </div>
                    <h2 className="text-lg font-bold text-ink">Owner</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Name</p>
                        <p className="text-sm font-medium text-ink">{booking.owner.full_name}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Email</p>
                        <p className="text-sm font-medium text-ink">{booking.owner.email}</p>
                    </div>
                </div>
            </div>

            {/* Pet Info */}
            <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-xl bg-brand-50 p-2.5">
                        <PawPrint size={20} className="text-brand-500" />
                    </div>
                    <h2 className="text-lg font-bold text-ink">Pet</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Name</p>
                        <p className="text-sm font-medium text-ink">{booking.pet.name}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Species</p>
                        <p className="text-sm font-medium text-ink capitalize">{booking.pet.species}</p>
                    </div>
                    {booking.pet.breed && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Breed</p>
                            <p className="text-sm font-medium text-ink">{booking.pet.breed}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Age</p>
                        <p className="text-sm font-medium text-ink">{calculateAge(booking.pet.date_of_birth)}</p>
                    </div>
                    {booking.pet.sex && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Sex</p>
                            <p className="text-sm font-medium text-ink capitalize">{booking.pet.sex}</p>
                        </div>
                    )}
                    {booking.pet.notes && (
                        <div className="sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Notes</p>
                            <p className="text-sm text-ink">{booking.pet.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Switcher */}
            <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-xl bg-brand-50 p-2.5">
                        <Clock size={20} className="text-brand-500" />
                    </div>
                    <h2 className="text-lg font-bold text-ink">Update Status</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                        <button
                            key={s}
                            onClick={() => updateStatus(s)}
                            disabled={isPending || booking.booking_status === s}
                            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition disabled:opacity-40 disabled:cursor-not-allowed ${booking.booking_status === s
                                    ? statusColors[s] + ' ring-2 ring-offset-1 ring-brand-400'
                                    : 'border-border bg-white text-ink/60 hover:bg-brand-50'
                                }`}
                        >
                            {s === 'no_show' ? 'No Show' : s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default VetBookingDetailPage
