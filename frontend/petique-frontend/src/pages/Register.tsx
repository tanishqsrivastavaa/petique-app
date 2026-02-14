import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { api } from '../lib/api'
import { toast } from 'sonner'
import { PawPrint, Stethoscope } from 'lucide-react'
import { useState } from 'react'

const baseSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const vetSchema = baseSchema.extend({
  specialty: z.string().catch('general_practice'),
  clinicName: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
})

type VetForm = z.infer<typeof vetSchema>

const RegisterPage = () => {
  const navigate = useNavigate()
  const [isVet, setIsVet] = useState(false)

  const form = useForm<VetForm>({
    resolver: zodResolver(vetSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      specialty: 'general_practice',
      clinicName: '',
      phone: '',
      city: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: VetForm) => {
      if (isVet) {
        const payload = {
          full_name: data.fullName,
          email: data.email,
          password: data.password,
          specialty: data.specialty,
          clinic_name: data.clinicName,
          phone: data.phone,
          city: data.city,
        }
        const response = await api.post('/vets/register', payload)
        return response.data
      } else {
        const payload = { full_name: data.fullName, email: data.email, password: data.password }
        const response = await api.post('/users/register', payload)
        return response.data
      }
    },
    onSuccess: () => {
      toast.success('Account created! Please sign in.')
      navigate('/login')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail ?? 'Registration failed'
      toast.error(message)
    },
  })

  const onSubmit = (values: VetForm) => mutate(values)

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

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card max-w-md w-full space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500">
            <PawPrint size={24} className="text-white" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            Petique
          </p>
          <h1 className="text-2xl font-bold text-ink">Create your account</h1>
          <p className="text-sm text-ink/60">Join Petique to manage your pets and bookings.</p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-2 rounded-xl bg-fog p-1">
          <button
            type="button"
            onClick={() => setIsVet(false)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${!isVet ? 'bg-white text-brand-700 shadow-sm' : 'text-ink/50'
              }`}
          >
            <PawPrint size={16} />
            Pet Owner
          </button>
          <button
            type="button"
            onClick={() => setIsVet(true)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${isVet ? 'bg-white text-brand-700 shadow-sm' : 'text-ink/50'
              }`}
          >
            <Stethoscope size={16} />
            Veterinarian
          </button>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="input-label" htmlFor="fullName">Full name</label>
            <input id="fullName" placeholder="Dr. Jane Smith" {...form.register('fullName')} />
            {form.formState.errors.fullName && (
              <p className="text-sm text-danger">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="input-label" htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-sm text-danger">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="input-label" htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-sm text-danger">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Vet-specific fields */}
          {isVet && (
            <div className="space-y-4 rounded-xl border border-brand-200 bg-brand-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Professional details
              </p>
              <div className="space-y-1">
                <label className="input-label" htmlFor="specialty">Specialty</label>
                <select id="specialty" {...form.register('specialty')}>
                  {specialties.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="input-label" htmlFor="clinicName">Clinic name</label>
                <input id="clinicName" placeholder="PawCare Clinic" {...form.register('clinicName')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="input-label" htmlFor="phone">Phone</label>
                  <input id="phone" placeholder="+91 98765..." {...form.register('phone')} />
                </div>
                <div className="space-y-1">
                  <label className="input-label" htmlFor="city">City</label>
                  <input id="city" placeholder="Mumbai" {...form.register('city')} />
                </div>
              </div>
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={isPending}>
            {isPending ? 'Creating account…' : isVet ? 'Register as Veterinarian' : 'Register as Pet Owner'}
          </button>
        </form>

        <p className="text-sm text-center text-ink/60">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
