// Fonte única de verdade da sessão do usuário.
// Centraliza as chaves de armazenamento e a leitura/escrita dos tokens,
// que antes estavam espalhadas em api.js, App.jsx, Sidebar.jsx, Login.jsx e useAuth.js.

const ACCESS_KEY = 'access'
const REFRESH_KEY = 'refresh'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function setAccessToken(access) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}

// Decodifica o payload do JWT de acesso (sem validar assinatura — só leitura de claims).
export function decodeAccessToken() {
  try {
    const token = getAccessToken()
    if (!token) return null
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}
