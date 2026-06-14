import { useMemo } from 'react'
<<<<<<< HEAD
import { decodeAccessToken } from '../lib/session'

export function useAuth() {
  const payload = useMemo(() => decodeAccessToken(), [])
=======

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
>>>>>>> 56f09569d6ed5c14d91c4d1c3a27b94043c9c2b0

  return {
    perfil: payload?.perfil || 'cliente',
    nome: payload?.nome || '',
    isAdmin: payload?.perfil === 'admin',
    isGuia: payload?.perfil === 'guia',
    isParceiro: payload?.perfil === 'parceiro',
    isCliente: payload?.perfil === 'cliente',
    isAuthenticated: !!payload,
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 56f09569d6ed5c14d91c4d1c3a27b94043c9c2b0
