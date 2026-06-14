// Camada de serviço de autenticação. Toda a comunicação de login/registro/logout
// passa por aqui usando o client `api` (uma única configuração de HTTP).
import api from '../api'
import { setTokens, clearSession } from '../lib/session'

export async function login(username, password) {
  const { data } = await api.post('/token/', { username, password })
  setTokens(data)
  return data
}

export async function registrarCliente({ username, nome, email, password }) {
  // FIXME(P0 #3): hoje o endpoint /usuarios/ exige IsAdmin, então este cadastro
  // público retorna 403. O endpoint próprio de registro de cliente entra na
  // trilha de Segurança. Mantido apontando para o mesmo lugar para não alterar
  // comportamento neste passo de limpeza.
  return api.post('/usuarios/', {
    username,
    first_name: nome,
    email,
    password,
    perfil: 'cliente',
  })
}

export function logout() {
  clearSession()
}
