import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { toast } from 'sonner'
import { useState } from 'react'
import { Clock, Plus, Trash2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'

type WorkingHour = {
    id: string
    vet_id: string
    day: string
    start_time: string
    end_time: string
    is_active: boolean
}

type VetProfile = { id: string }

const dayLabel: Record<string, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}
const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const SchedulePage = () => {
    const queryClient = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [form, setForm] = useState({ day: 'mon', start_time: '09:00', end_time: '17:00' })

    const { data: profile } = useQuery<VetProfile>({
        queryKey: ['vet-profile'],
        queryFn: async () => (await api.get('/vets/me')).data,
    })

    const { data: hours = [], isLoading } = useQuery<WorkingHour[]>({
        queryKey: ['vet-hours', profile?.id],
        queryFn: async () => (await api.get(`/vets/${profile!.id}/working-hours`)).data,
        enabled: !!profile?.id,
    })

    const createMut = useMutation({
        mutationFn: (data: typeof form) =>
            api.post('/vets/me/working-hours', {
                day: data.day,
                start_time: data.start_time + ':00',
                end_time: data.end_time + ':00',
            }),
        onSuccess: () => {
            toast.success('Working hours added!')
            queryClient.invalidateQueries({ queryKey: ['vet-hours'] })
            setModalOpen(false)
        },
        onError: () => toast.error('Failed to add working hours'),
    })

    const deleteMut = useMutation({
        mutationFn: (id: string) => api.delete(`/vets/me/working-hours/${id}`),
        onSuccess: () => {
            toast.success('Working hours removed')
            queryClient.invalidateQueries({ queryKey: ['vet-hours'] })
        },
        onError: () => toast.error('Failed to remove'),
    })

    const sortedHours = [...hours].sort(
        (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createMut.mutate(form)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-header">Schedule</h1>
                    <p className="page-sub">Set your weekly working hours so clients can book appointments.</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn-primary !w-auto gap-2 px-5">
                    <Plus size={16} /> Add Hours
                </button>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-ink/40">Loading...</div>
            ) : sortedHours.length === 0 ? (
                <EmptyState
                    icon={Clock}
                    title="No schedule set"
                    description="Add your working hours so pet owners can see when you're available."
                    action={
                        <button onClick={() => setModalOpen(true)} className="btn-primary !w-auto px-6">
                            Add Working Hours
                        </button>
                    }
                />
            ) : (
                <div className="card p-6 space-y-2">
                    {sortedHours.map((h) => (
                        <div
                            key={h.id}
                            className="flex items-center justify-between rounded-xl bg-fog p-4 group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="w-24 font-semibold text-ink">{dayLabel[h.day]}</span>
                                <span className="rounded-lg bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                                    {h.start_time.slice(0, 5)} — {h.end_time.slice(0, 5)}
                                </span>
                            </div>
                            <button
                                onClick={() => { if (confirm('Remove these hours?')) deleteMut.mutate(h.id) }}
                                className="btn-icon opacity-0 group-hover:opacity-100 !text-danger"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Working Hours">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="input-label">Day</label>
                        <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                            {dayOrder.map((d) => (
                                <option key={d} value={d}>{dayLabel[d]}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="input-label">Start time</label>
                            <input
                                type="time"
                                value={form.start_time}
                                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">End time</label>
                            <input
                                type="time"
                                value={form.end_time}
                                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" disabled={createMut.isPending}>
                        {createMut.isPending ? 'Adding…' : 'Add Hours'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

export default SchedulePage
