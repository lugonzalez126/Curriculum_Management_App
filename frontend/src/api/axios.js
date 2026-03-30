import axios from 'axios'

const API_BASE = 'https://curriculummanagement.up.railway.app'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = window.__accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Don't intercept auth endpoints — let them fail normally
    const isAuthRoute = original.url?.startsWith('/auth/')
    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
        window.__accessToken = res.data.access_token
        original.headers.Authorization = `Bearer ${res.data.access_token}`
        return api(original)
      } catch {
        window.__accessToken = null
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api