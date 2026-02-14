import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { CalendarCheck, ChevronRight } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import { Link } from 'react-router-dom'
import { useState } from 'react'

type Booking = {
    id: string
    pet_id: string
    vet_id: string
    user_id: string
    start_at: string
    end_at: string
    booking_status: string
    reason: string | null
}

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const

const VetBookingsPage = () => {
    const [activeTab, setActiveTab] = useState<string>('all')

    const { data: bookings = [], isLoading } = useQuery<Booking[]>({
        queryKey: ['vet-bookings'],
        queryFn: async () => {
            try {
                return (await api.get('/bookings/vet')).data
            } catch {
                return []
            }
        },
    })

    const filtered = activeTab === 'all'
        ? bookings
        : bookings.filter((b) => b.booking_status === activeTab)

    const sorted = [...filtered].sort(
        (a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-header">Bookings</h1>
                <p className="page-sub">View and manage all your appointments.</p>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${activeTab === tab
                                ? 'bg-brand-500 text-ink'
                                : 'bg-white border border-border text-ink/60 hover:bg-brand-50'
                            }`}
                    >
                        {tab === 'no_show' ? 'No Show' : tab}
                    </button>
                ))}
            </div>

            {/* Bookings list */}
            <div className="card p-6">
                {isLoading ? (
                    <p className="text-center text-ink/60 py-8">Loading bookings…</p>
                ) : sorted.length === 0 ? (
                    <EmptyState
                        icon={CalendarCheck}
                        title="No bookings found"
                        description={
                            activeTab === 'all'
                                ? 'You have no bookings yet.'
                                : `No ${activeTab} bookings.`
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {sorted.map((b) => (
                            <Link
                                key={b.id}
                                to={`/vet/bookings/${b.id}`}
                                className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-brand-300 hover:bg-brand-50/30"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-ink">
                                        {new Date(b.start_at).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-sm text-ink/60">
                                        {new Date(b.start_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                        {' — '}
                                        {new Date(b.end_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                    {b.reason && (
                                        <p className="mt-1 truncate text-xs text-ink/50">{b.reason}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={b.booking_status} />
                                    <ChevronRight size={16} className="text-ink/30" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default VetBookingsPage
