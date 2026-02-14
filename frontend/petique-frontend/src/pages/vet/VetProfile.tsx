import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { UserCircle, Save } from 'lucide-react'

type VetProfile = {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    specialty: string
    bio: string | null
    clinic_name: string | null
    clinic_address: string | null
    city: string | null
    state_region: string | null
    postal_code: string | null
    country: string | null
}

const specialties = [
    { value: 'general_practice', label: 'General Practice' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'dentistry', label: 'Dentistry' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'ophthalmology', label: 'Ophthalmology' },
    { value: 'exotics', label: 'Exotics' },
]

const VetProfilePage = () => {
    const queryClient = useQueryClient()
    const [form, setForm] = useState({
        specialty: 'general_practice',
        bio: '',
        phone: '',
        clinic_name: '',
        clinic_address: '',
        city: '',
        state_region: '',
        postal_code: '',
        country: '',
    })

    const { data: profile } = useQuery<VetProfile>({
        queryKey: ['vet-profile'],
        queryFn: async () => (await api.get('/vets/me')).data,
    })

    useEffect(() => {
        if (profile) {
            setForm({
                specialty: profile.specialty ?? 'general_practice',
                bio: profile.bio ?? '',
                phone: profile.phone ?? '',
                clinic_name: profile.clinic_name ?? '',
                clinic_address: profile.clinic_address ?? '',
                city: profile.city ?? '',
                state_region: profile.state_region ?? '',
                postal_code: profile.postal_code ?? '',
                country: profile.country ?? '',
            })
        }
    }, [profile])

    const updateMut = useMutation({
        mutationFn: (data: typeof form) => api.patch('/vets/me', data),
        onSuccess: () => {
            toast.success('Profile updated!')
            queryClient.invalidateQueries({ queryKey: ['vet-profile'] })
        },
        onError: () => toast.error('Failed to update profile'),
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMut.mutate(form)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-header">My Profile</h1>
                <p className="page-sub">Keep your professional details up to date.</p>
            </div>

            <form onSubmit={handleSubmit} className="card max-w-2xl space-y-6 p-8">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-border pb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                        <UserCircle size={28} className="text-brand-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-ink">{profile?.full_name}</p>
                        <p className="text-sm text-ink/60">{profile?.email}</p>
                    </div>
                </div>

                {/* Professional */}
                <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Professional</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="input-label">Specialty</label>
                            <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}>
                                {specialties.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">Phone</label>
                            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765..." />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="input-label">Bio</label>
                        <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell pet owners about yourself..." />
                    </div>
                </div>

                {/* Clinic */}
                <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Clinic details</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="input-label">Clinic name</label>
                            <input value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">City</label>
                            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="input-label">Address</label>
                        <input value={form.clinic_address} onChange={(e) => setForm({ ...form, clinic_address: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="input-label">State/Region</label>
                            <input value={form.state_region} onChange={(e) => setForm({ ...form, state_region: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">Postal code</label>
                            <input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">Country</label>
                            <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn-primary !w-auto gap-2 px-6" disabled={updateMut.isPending}>
                    <Save size={16} /> {updateMut.isPending ? 'Saving…' : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}

export default VetProfilePage
