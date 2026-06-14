import axios from 'axios'
<<<<<<< HEAD
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearSession,
} from './lib/session'

// Base da API vem do ambiente (Vite). Fallback para dev local.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({ baseURL: API_BASE_URL })

// Anexa o token de acesso em toda requisição.
api.interceptors.request.use((config) => {
  const token = getAccessToken()
=======

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
>>>>>>> 56f09569d6ed5c14d91c4d1c3a27b94043c9c2b0
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

<<<<<<< HEAD
// Em 401, tenta renovar o token uma única vez antes de deslogar.
=======
>>>>>>> 56f09569d6ed5c14d91c4d1c3a27b94043c9c2b0
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
<<<<<<< HEAD
        const refresh = getRefreshToken()
        if (!refresh) throw new Error('Sem refresh token')

        const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh })
        setAccessToken(res.data.access)
        original.headers.Authorization = `Bearer ${res.data.access}`
        return api(original)
      } catch {
        clearSession()
=======
        const refresh = localStorage.getItem('refresh')
        if (!refresh) throw new Error('Sem refresh token')

        const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh })
        localStorage.setItem('access', res.data.access)
        original.headers.Authorization = `Bearer ${res.data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
>>>>>>> 56f09569d6ed5c14d91c4d1c3a27b94043c9c2b0
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

<<<<<<< HEAD
export default api
=======
export default api
>>>>>>> 56f09569d6ed5c14d91c4d1c3a27b94043c9c2b0
