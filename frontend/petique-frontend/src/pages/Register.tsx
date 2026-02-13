import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { api } from '../lib/api'
import { setToken } from '../lib/auth'
import { toast } from 'sonner'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

const RegisterPage = () => {
  const navigate = useNavigate()

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const payload = { full_name: data.fullName, email: data.email, password: data.password }
      const response = await api.post('/users/register', payload)
      return response.data
    },
    onSuccess: (data) => {
      const token = data?.access_token ?? data?.token
      if (token) {
        setToken(token)
        toast.success('Account created')
        navigate('/dashboard', { replace: true })
      } else {
        toast.success('Account created, please sign in')
        navigate('/login')
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail ?? 'Unable to register'
      toast.error(message)
    },
  })

  const onSubmit = (values: RegisterForm) => mutate(values)

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card max-w-md w-full space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            Petique
          </p>
          <h1 className="text-2xl font-bold text-ink">Create your account</h1>
          <p className="text-sm text-slate-600">Book visits and manage your pets easily.</p>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="input-label" htmlFor="fullName">
              Full name
            </label>
            <input id="fullName" placeholder="Taylor Vetlover" {...form.register('fullName')} />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="input-label" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" placeholder="you@example.com" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <input id="password" type="password" placeholder="••••••••" {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="input-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button className="btn-primary" type="submit" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Create account'}
          </button>
          <Link to="/login" className="btn-secondary">
            Back to sign in
          </Link>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage

