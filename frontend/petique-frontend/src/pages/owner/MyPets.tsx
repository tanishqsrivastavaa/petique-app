import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useState } from 'react'
import { toast } from 'sonner'
import { PawPrint, Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'

type Pet = {
    id: string
    name: string
    species: string
    breed: string | null
    date_of_birth: string | null
    sex: string | null
    notes: string | null
}

const speciesEmoji: Record<string, string> = {
    Dog: '🐕', Cat: '🐈', Bird: '🐦', Fish: '🐟', Rabbit: '🐇', Hamster: '🐹',
    Reptile: '🦎', Horse: '🐴', Guinea_Pig: '🐹',
}

const MyPetsPage = () => {
    const queryClient = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<Pet | null>(null)
    const [form, setForm] = useState({ name: '', species: '', breed: '', sex: '', date_of_birth: '', notes: '' })

    const { data: pets = [], isLoading } = useQuery<Pet[]>({
        queryKey: ['pets'],
        queryFn: async () => (await api.get('/pets')).data,
    })

    const createMut = useMutation({
        mutationFn: (data: typeof form) => api.post('/pets/', data),
        onSuccess: () => {
            toast.success('Pet added!')
            queryClient.invalidateQueries({ queryKey: ['pets'] })
            closeModal()
        },
        onError: () => toast.error('Failed to add pet'),
    })

    const updateMut = useMutation({
        mutationFn: (data: { id: string; fields: Partial<typeof form> }) =>
            api.patch(`/pets/${data.id}`, data.fields),
        onSuccess: () => {
            toast.success('Pet updated!')
            queryClient.invalidateQueries({ queryKey: ['pets'] })
            closeModal()
        },
        onError: () => toast.error('Failed to update pet'),
    })

    const deleteMut = useMutation({
        mutationFn: (id: string) => api.delete(`/pets/${id}`),
        onSuccess: () => {
            toast.success('Pet removed')
            queryClient.invalidateQueries({ queryKey: ['pets'] })
        },
        onError: () => toast.error('Failed to delete pet'),
    })

    const openAdd = () => {
        setEditing(null)
        setForm({ name: '', species: '', breed: '', sex: '', date_of_birth: '', notes: '' })
        setModalOpen(true)
    }

    const openEdit = (pet: Pet) => {
        setEditing(pet)
        setForm({
            name: pet.name,
            species: pet.species,
            breed: pet.breed ?? '',
            sex: pet.sex ?? '',
            date_of_birth: pet.date_of_birth ?? '',
            notes: pet.notes ?? '',
        })
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditing(null)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editing) {
            updateMut.mutate({ id: editing.id, fields: form })
        } else {
            createMut.mutate(form)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-header">My Pets</h1>
                    <p className="page-sub">Manage your furry, feathery, or scaly friends.</p>
                </div>
                <button onClick={openAdd} className="btn-primary !w-auto gap-2 px-5">
                    <Plus size={16} /> Add Pet
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-ink/40">Loading...</div>
            ) : pets.length === 0 ? (
                <EmptyState
                    icon={PawPrint}
                    title="No pets yet"
                    description="Add your first furry friend to get started!"
                    action={
                        <button onClick={openAdd} className="btn-primary !w-auto px-6">
                            Add Your First Pet
                        </button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pets.map((pet) => (
                        <div key={pet.id} className="card p-6 space-y-3 group hover:border-brand-300 transition">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{speciesEmoji[pet.species] ?? '🐾'}</span>
                                    <div>
                                        <p className="font-bold text-ink">{pet.name}</p>
                                        <p className="text-sm text-ink/60">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => openEdit(pet)} className="btn-icon" title="Edit">
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => { if (confirm(`Remove ${pet.name}?`)) deleteMut.mutate(pet.id) }}
                                        className="btn-icon !text-danger !hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            {pet.sex && <p className="text-xs text-ink/50">Sex: {pet.sex}</p>}
                            {pet.date_of_birth && (
                                <p className="text-xs text-ink/50">
                                    Born: {new Date(pet.date_of_birth).toLocaleDateString()}
                                </p>
                            )}
                            {pet.notes && (
                                <p className="text-xs text-ink/50 line-clamp-2">{pet.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Pet' : 'Add New Pet'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="input-label">Name</label>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="input-label">Species</label>
                            <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} required>
                                <option value="">Select...</option>
                                {Object.keys(speciesEmoji).map((s) => (
                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">Breed</label>
                            <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="Golden Retriever" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="input-label">Sex</label>
                            <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                                <option value="">-</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="input-label">Date of birth</label>
                            <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="input-label">Notes</label>
                        <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Allergies, medication, etc." />
                    </div>
                    <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                        {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Pet'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

export default MyPetsPage
