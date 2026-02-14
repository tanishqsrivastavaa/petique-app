import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { toast } from 'sonner'
import { useState } from 'react'
import { CalendarOff, Plus, Trash2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'

type TimeOff = {
    id: string
    vet_id: string
    start_at: string
    end_at: string
    reason: string | null
}

type VetProfile = { id: string }

const TimeOffPage = () => {
    const queryClient = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [form, setForm] = useState({ start_at: '', end_at: '', reason: '' })

    const { data: profile } = useQuery<VetProfile>({
        queryKey: ['vet-profile'],
        queryFn: async () => (await api.get('/vets/me')).data,
    })

    const { data: timeOffs = [], isLoading } = useQuery<TimeOff[]>({
        queryKey: ['vet-time-off', profile?.id],
        queryFn: async () => (await api.get(`/vets/${profile!.id}/time-off`)).data,
        enabled: !!profile?.id,
    })

    const createMut = useMutation({
        mutationFn: (data: typeof form) => api.post('/vets/me/time-off', data),
        onSuccess: () => {
            toast.success('Time off added!')
            queryClient.invalidateQueries({ queryKey: ['vet-time-off'] })
            setModalOpen(false)
        },
        onError: (err: any) =>
            toast.error(err?.response?.data?.detail ?? 'Failed to add time off'),
    })

    const deleteMut = useMutation({
        mutationFn: (id: string) => api.delete(`/vets/me/time-off/${id}`),
        onSuccess: () => {
            toast.success('Time off removed')
            queryClient.invalidateQueries({ queryKey: ['vet-time-off'] })
        },
        onError: () => toast.error('Failed to remove'),
    })

    const sortedTimeOffs = [...timeOffs].sort(
        (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createMut.mutate(form)
    }

    const fmtDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-header">Time Off</h1>
                    <p className="page-sub">Block out days when you're unavailable.</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn-primary !w-auto gap-2 px-5">
                    <Plus size={16} /> Add Time Off
                </button>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-ink/40">Loading...</div>
            ) : sortedTimeOffs.length === 0 ? (
                <EmptyState
                    icon={CalendarOff}
                    title="No time off scheduled"
                    description="Add blocks when you'll be away so clients know when you're unavailable."
                    action={
                        <button onClick={() => setModalOpen(true)} className="btn-primary !w-auto px-6">
                            Add Time Off
                        </button>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {sortedTimeOffs.map((t) => (
                        <div
                            key={t.id}
                            className="card flex items-center justify-between p-5 group"
                        >
                            <div>
                                <p className="font-semibold text-ink">
                                    {fmtDate(t.start_at)} — {fmtDate(t.end_at)}
                                </p>
                                {t.reason && <p className="text-sm text-ink/60">{t.reason}</p>}
                            </div>
                            <button
                                onClick={() => { if (confirm('Remove this time off?')) deleteMut.mutate(t.id) }}
                                className="btn-icon opacity-0 group-hover:opacity-100 !text-danger"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Time Off">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="input-label">From</label>
                            <input
                                type="datetime-local"
                                value={form.start_at}
                                onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">To</label>
                            <input
                                type="datetime-local"
                                value={form.end_at}
                                onChange={(e) => setForm({ ...form, end_at: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="input-label">Reason (optional)</label>
                        <input
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="Conference, vacation, etc."
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={createMut.isPending}>
                        {createMut.isPending ? 'Adding…' : 'Add Time Off'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

export default TimeOffPage
