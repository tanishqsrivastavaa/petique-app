import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { api } from '../lib/api'
import { setToken, setRole } from '../lib/auth'
import { toast } from 'sonner'
import { PawPrint } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await api.post('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      const token = data?.access_token ?? data?.token
      if (token) {
        setToken(token)
        setRole(data.role ?? 'owner')
        toast.success('Welcome back!')
        const role = data.role ?? 'owner'
        const from =
          (location.state as { from?: Location })?.from?.pathname ||
          (role === 'vet' ? '/vet/dashboard' : '/dashboard')
        navigate(from, { replace: true })
      } else {
        toast.error('No token returned from server')
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail ?? 'Unable to login'
      toast.error(message)
    },
  })

  const onSubmit = (values: LoginForm) => mutate(values)

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
          <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
          <p className="text-sm text-ink/60">Sign in to manage your pets and bookings.</p>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="input-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-danger">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-danger">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button className="btn-primary" type="submit" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center text-ink/60">
          No account yet?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
