import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { toast } from 'sonner'
import { useState } from 'react'
import { Stethoscope, MapPin, Phone, Clock, ArrowLeft } from 'lucide-react'
import Modal from '../../components/ui/Modal'

type Vet = {
    id: string
    full_name: string
    specialty: string
    bio: string | null
    phone: string | null
    clinic_name: string | null
    clinic_address: string | null
    city: string | null
    email: string | null
}

type WorkingHour = {
    id: string
    day: string
    start_time: string
    end_time: string
    is_active: boolean
}

type Pet = { id: string; name: string; species: string }

const dayLabel: Record<string, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}
const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const specialtyLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const VetDetailPage = () => {
    const { vetId } = useParams()
    const queryClient = useQueryClient()
    const [bookOpen, setBookOpen] = useState(false)
    const [form, setForm] = useState({
        pet_id: '',
        start_at: '',
        end_at: '',
        reason: '',
    })

    const { data: vet } = useQuery<Vet>({
        queryKey: ['vet', vetId],
        queryFn: async () => (await api.get(`/vets/${vetId}`)).data,
    })

    const { data: hours = [] } = useQuery<WorkingHour[]>({
        queryKey: ['vet-hours', vetId],
        queryFn: async () => (await api.get(`/vets/${vetId}/working-hours`)).data,
    })

    const { data: pets = [] } = useQuery<Pet[]>({
        queryKey: ['pets'],
        queryFn: async () => (await api.get('/pets')).data,
    })

    const bookMut = useMutation({
        mutationFn: (data: typeof form) =>
            api.post('/bookings', { ...data, vet_id: vetId }),
        onSuccess: () => {
            toast.success('Appointment booked!')
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            setBookOpen(false)
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail ?? 'Booking failed')
        },
    })

    const sortedHours = [...hours]
        .filter((h) => h.is_active)
        .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault()
        bookMut.mutate(form)
    }

    if (!vet) return <div className="py-12 text-center text-ink/40">Loading...</div>

    return (
        <div className="space-y-6">
            <Link to="/vets" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
                <ArrowLeft size={14} /> Back to all vets
            </Link>

            {/* Profile Card */}
            <div className="card p-8 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                            <Stethoscope size={28} className="text-brand-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-ink">{vet.full_name}</h1>
                            <span className="badge bg-brand-100 text-brand-800">
                                {specialtyLabel(vet.specialty)}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => setBookOpen(true)} className="btn-primary !w-auto px-6">
                        Book Appointment
                    </button>
                </div>

                {vet.bio && <p className="text-ink/70 leading-relaxed">{vet.bio}</p>}

                <div className="flex flex-wrap gap-6 text-sm text-ink/60">
                    {vet.clinic_name && (
                        <span className="flex items-center gap-1">
                            <Stethoscope size={14} className="text-brand-500" /> {vet.clinic_name}
                        </span>
                    )}
                    {vet.city && (
                        <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-brand-500" /> {vet.city}
                        </span>
                    )}
                    {vet.phone && (
                        <span className="flex items-center gap-1">
                            <Phone size={14} className="text-brand-500" /> {vet.phone}
                        </span>
                    )}
                </div>
            </div>

            {/* Working Hours */}
            <div className="card p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
                    <Clock size={18} className="text-brand-500" /> Working Hours
                </h2>
                {sortedHours.length === 0 ? (
                    <p className="text-sm text-ink/50">No working hours set yet.</p>
                ) : (
                    <div className="space-y-2">
                        {sortedHours.map((h) => (
                            <div key={h.id} className="flex items-center justify-between rounded-lg bg-fog p-3">
                                <span className="font-medium text-ink">{dayLabel[h.day] ?? h.day}</span>
                                <span className="text-sm text-ink/60">
                                    {h.start_time.slice(0, 5)} — {h.end_time.slice(0, 5)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Book Appointment">
                <form onSubmit={handleBook} className="space-y-4">
                    <div className="space-y-1">
                        <label className="input-label">Which pet?</label>
                        <select
                            value={form.pet_id}
                            onChange={(e) => setForm({ ...form, pet_id: e.target.value })}
                            required
                        >
                            <option value="">Select a pet...</option>
                            {pets.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="input-label">Start</label>
                            <input
                                type="datetime-local"
                                value={form.start_at}
                                onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">End</label>
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
                        <textarea
                            rows={2}
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="Annual checkup, vaccination, etc."
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={bookMut.isPending}>
                        {bookMut.isPending ? 'Booking…' : 'Confirm Booking'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

export default VetDetailPage
