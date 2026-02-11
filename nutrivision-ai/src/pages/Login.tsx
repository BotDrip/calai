import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthInput from '../components/AuthInput'

const foodImage =
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=80'

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const nextErrors: typeof errors = {}
    if (!email.includes('@')) nextErrors.email = 'Enter a valid email address.'
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      await signIn(email, password)
      pushToast('Welcome back to NutriVision AI!', 'success')
      navigate('/dashboard')
    } catch (error: any) {
      console.error(error)
      pushToast(error.message || 'Login failed. Please check your credentials.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      pushToast('Signed in with Google.', 'success')
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      pushToast('Google sign-in failed. Try again.', 'error')
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
            <h1 className="text-3xl font-semibold">Welcome back</h1>
            <p className="text-sm text-slate-500">
              Log in to access your nutrition insights and faculty dashboard.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <AuthInput
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              error={errors.email}
            />
            <AuthInput
              label="Password"
              name="password"
              value={password}
              onChange={(value) => {
                setPassword(value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              error={errors.password}
              showToggle
            />
            <div className="flex items-center justify-between text-sm">
              <button type="button" className="text-primary hover:underline">
                Forgot Password?
              </button>
              <Link to="/signup" className="text-slate-500 hover:text-primary">
                Create account
              </Link>
            </div>
            <button className="button-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              className="button-ghost w-full"
              onClick={handleGoogle}
              disabled={loading}
            >
              Login with Google
            </button>
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
