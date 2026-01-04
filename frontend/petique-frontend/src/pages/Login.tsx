import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { api } from '../lib/api'
import { setToken } from '../lib/auth'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const DEMO_CREDENTIALS = {
  email: 'test123@gmail.com',
  password: 'password123',
}

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEMO_CREDENTIALS,
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
        toast.success('Welcome back')
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
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            Petique
          </p>
          <h1 className="text-2xl font-bold text-ink">Sign in to continue</h1>
          <p className="text-sm text-slate-600">Manage your pets and bookings in one place.</p>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="input-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <button className="btn-primary" type="submit" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => form.reset(DEMO_CREDENTIALS)}
              disabled={isPending}
            >
              Use demo credentials
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-slate-600">
          No account yet?{' '}
          <Link to="/register" className="text-brand-700 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage

