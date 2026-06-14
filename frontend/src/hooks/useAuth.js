import { useMemo } from 'react'
import { decodeAccessToken } from '../lib/session'

export function useAuth() {
  const payload = useMemo(() => decodeAccessToken(), [])

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
