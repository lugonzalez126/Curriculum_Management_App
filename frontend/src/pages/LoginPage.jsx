import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full" style={{ maxWidth: '380px' }}>
        <h1 className="text-2xl font-bold text-stone-900 text-center mb-8">
          Welcome back
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="text-sm text-danger-text bg-danger-bg px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm bg-stone-50 text-stone-700 rounded-lg outline-none transition-colors placeholder:text-stone-300 focus:bg-white"
            style={{ border: '0.5px solid #E7E5E4' }}
            onFocus={(e) => (e.target.style.borderColor = '#A8A29E')}
            onBlur={(e) => (e.target.style.borderColor = '#E7E5E4')}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm bg-stone-50 text-stone-700 rounded-lg outline-none transition-colors placeholder:text-stone-300 focus:bg-white"
            style={{ border: '0.5px solid #E7E5E4' }}
            onFocus={(e) => (e.target.style.borderColor = '#A8A29E')}
            onBlur={(e) => (e.target.style.borderColor = '#E7E5E4')}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-stone-50 bg-stone-900 rounded-lg transition-transform active:scale-[0.98] hover:bg-stone-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-stone-500 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}