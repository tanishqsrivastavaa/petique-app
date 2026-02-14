import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Link } from 'react-router-dom'
import { Stethoscope, MapPin } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'

type Vet = {
    id: string
    full_name: string
    specialty: string
    bio: string | null
    clinic_name: string | null
    city: string | null
}

const specialtyLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const BrowseVetsPage = () => {
    const { data: vets = [], isLoading } = useQuery<Vet[]>({
        queryKey: ['vets'],
        queryFn: async () => (await api.get('/vets')).data,
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-header">Browse Veterinarians</h1>
                <p className="page-sub">Find a vet for your pet and book an appointment.</p>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-ink/40">Loading...</div>
            ) : vets.length === 0 ? (
                <EmptyState
                    icon={Stethoscope}
                    title="No vets available"
                    description="Check back later — vets will appear here once they register."
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {vets.map((vet) => (
                        <Link
                            key={vet.id}
                            to={`/vets/${vet.id}`}
                            className="card p-6 space-y-3 hover:border-brand-300 transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                                    <Stethoscope size={20} className="text-brand-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-ink group-hover:text-brand-700 transition">{vet.full_name}</p>
                                    <span className="badge bg-brand-100 text-brand-800 text-xs">
                                        {specialtyLabel(vet.specialty)}
                                    </span>
                                </div>
                            </div>
                            {vet.clinic_name && (
                                <p className="text-sm text-ink/60">{vet.clinic_name}</p>
                            )}
                            {vet.city && (
                                <p className="flex items-center gap-1 text-xs text-ink/50">
                                    <MapPin size={12} /> {vet.city}
                                </p>
                            )}
                            {vet.bio && (
                                <p className="text-sm text-ink/60 line-clamp-2">{vet.bio}</p>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default BrowseVetsPage
