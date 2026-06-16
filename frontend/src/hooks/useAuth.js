import { useMemo } from 'react'

export function lerSessao() {
  try {
    const token = localStorage.getItem('access')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp vem em segundos; Date.now() em milissegundos.
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null // token expirado
    }
    return payload
  } catch {
    return null
  }
}

export function useAuth() {
  const payload = useMemo(() => lerSessao(), [])

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
