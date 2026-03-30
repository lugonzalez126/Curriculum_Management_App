import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import api from '../api/axios'

const API_BASE = 'https://curriculummanagement.up.railway.app'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchMe() {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
        window.__accessToken = res.data.access_token
        await fetchMe()
      } catch {
        window.__accessToken = null
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    window.__accessToken = res.data.access_token
    await fetchMe()
  }

  async function register(data) {
    await api.post('/auth/register', data)
  }

  async function logout() {
    await api.post('/auth/logout')
    window.__accessToken = null
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}