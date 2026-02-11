import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import AuthInput from '../components/AuthInput'
import PasswordStrength from '../components/PasswordStrength'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { passwordRules } from '../hooks/usePasswordStrength'

const foodImage =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()
  const { pushToast } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validatePassword = (password: string) => {
    return (
      password.length >= passwordRules.minLength &&
      passwordRules.upper.test(password) &&
      passwordRules.lower.test(password) &&
      passwordRules.number.test(password) &&
      passwordRules.special.test(password)
    )
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.name.trim()) nextErrors.name = 'Full name is required.'
    if (!validateEmail(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (!validatePassword(form.password)) {
      nextErrors.password =
        'Password must be 8+ chars with uppercase, lowercase, number, and special character.'
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      await signUp(form.name, form.email, form.password)
      pushToast('Account created successfully!', 'success')
      navigate('/dashboard')
    } catch (error: any) {
      console.error(error)
      pushToast(error.message || 'Sign up failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      pushToast('Signed up with Google.', 'success')
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      pushToast('Google sign-up failed. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base px-6 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-[32px] bg-white/70 shadow-glass lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center px-8 py-12 lg:px-14"
        >
          <div className="space-y-4">
            <p className="label-pill w-fit">NutriVision AI</p>
            <h1 className="text-3xl font-semibold">Create your account</h1>
            <p className="text-sm text-slate-500">
              Secure access for faculty evaluators and health-tech professionals.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <AuthInput
              label="Full Name"
              name="name"
              value={form.name}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, name: value }))
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              error={errors.name}
            />
            <AuthInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, email: value }))
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              error={errors.email}
            />
            <AuthInput
              label="Password"
              name="password"
              value={form.password}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, password: value }))
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
              }}
              error={errors.password}
              showToggle
            />
            <div className="space-y-2">
              <PasswordStrength password={form.password} />
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div className={form.password.length >= passwordRules.minLength ? 'text-emerald-600 font-medium' : ''}>
                  • 8+ characters
                </div>
                <div className={passwordRules.upper.test(form.password) ? 'text-emerald-600 font-medium' : ''}>
                  • Uppercase letter
                </div>
                <div className={passwordRules.lower.test(form.password) ? 'text-emerald-600 font-medium' : ''}>
                  • Lowercase letter
                </div>
                <div className={passwordRules.number.test(form.password) ? 'text-emerald-600 font-medium' : ''}>
                  • Number
                </div>
                <div className={passwordRules.special.test(form.password) ? 'text-emerald-600 font-medium' : ''}>
                  • Special character
                </div>
              </div>
            </div>
            <AuthInput
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, confirmPassword: value }))
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              error={errors.confirmPassword}
              showToggle
            />
            <button className="button-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
            <button
              type="button"
              className="button-ghost w-full"
              onClick={handleGoogle}
              disabled={loading}
            >
              Sign up with Google
            </button>
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative hidden lg:block"
        >
          <img src={foodImage} alt="Healthy meal" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20" />
        </motion.div>
      </div>
    </div>
  )
}
