
export const LIMITES = {
  nome: 200,
  username: 150,
  email: 254,
  telefone: 20,
  senha: 64,
  descricao: 1000,
  localizacao: 300,
  observacoes: 1000,
}

export function emailValido(email) {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function formatarTelefone(valor) {
  const d = (valor || '').replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function telefoneValido(valor) {
  if (!valor) return true // opcional
  const d = valor.replace(/\D/g, '')
  return d.length === 10 || d.length === 11
}

export function forcaSenha(senha) {
  let pontos = 0
  if (senha.length >= 6) pontos++
  if (senha.length >= 10) pontos++
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++
  if (/\d/.test(senha)) pontos++
  if (/[^A-Za-z0-9]/.test(senha)) pontos++
  const nivel = Math.min(pontos, 4)
  const tabela = [
    { texto: 'Muito fraca', cor: '#dc2626' },
    { texto: 'Fraca', cor: '#ea580c' },
    { texto: 'Razoável', cor: '#d97706' },
    { texto: 'Boa', cor: '#16a34a' },
    { texto: 'Forte', cor: '#15803d' },
  ]
  return { nivel, ...tabela[nivel] }
}
