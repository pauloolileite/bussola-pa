import { useMemo } from 'react'

function parseToken() {
  try {
    const token = localStorage.getItem('access')
    if (!token) return null
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function useAuth() {
  const payload = useMemo(() => parseToken(), [])

  return {
    perfil: payload?.perfil || 'cliente',
    nome: payload?.nome || '',
    isAdmin: payload?.perfil === 'admin',
    isGuia: payload?.perfil === 'guia',
    isParceiro: payload?.perfil === 'parceiro',
    isCliente: payload?.perfil === 'cliente',
    isAuthenticated: !!payload,
  }
}