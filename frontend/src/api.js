import axios from 'axios'
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
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Em 401, tenta renovar o token uma única vez antes de deslogar.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = getRefreshToken()
        if (!refresh) throw new Error('Sem refresh token')

        const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh })
        setAccessToken(res.data.access)
        original.headers.Authorization = `Bearer ${res.data.access}`
        return api(original)
      } catch {
        clearSession()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
