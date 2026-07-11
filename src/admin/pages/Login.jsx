import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(location.state?.from?.pathname || '/admin', { replace: true })
    } catch (err) {
      setError(err.status === 429 ? err.message : 'Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center mb-4">
            <span className="text-dark font-bold text-[15px] tracking-tight">KP</span>
          </div>
          <h1 className="text-white text-[18px] font-semibold">Admin Sign In</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-border rounded-md
                           focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="you@example.com"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-[13px] border border-border rounded-md
                           focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full btn-accent justify-center py-2.5 text-[13px] disabled:opacity-70">
            {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
