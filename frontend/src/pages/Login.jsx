import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { LIMITES, emailValido } from '../utils/validacao'
import MedidorSenha from '../components/MedidorSenha'

const HOME_POR_PERFIL = {
  admin: '/dashboard',
  guia: '/reservas',
  parceiro: '/validacao',
  cliente: '/passeios',
}

function perfilDoToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])).perfil
  } catch {
    return 'cliente'
  }
}

export default function Login() {
  const [aba, setAba] = useState('entrar')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await api.post('/token/', { username, password })
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      const perfil = perfilDoToken(res.data.access)
      navigate(HOME_POR_PERFIL[perfil] || '/passeios')
    } catch (err) {
      const msg = err.response?.data
      if (msg && JSON.stringify(msg).toLowerCase().includes('inativo')) {
        setErro('Usuário inativo. Contate o administrador.')
      } else {
        setErro('Usuário ou senha inválidos.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCriarConta(e) {
    e.preventDefault()
    setErro('')
    if (nome.trim().length < 2) { setErro('Informe seu nome completo.'); return }
    if (username.trim().length < 3) { setErro('O usuário deve ter ao menos 3 caracteres.'); return }
    if (!emailValido(email)) { setErro('Informe um e-mail válido.'); return }
    if (password.length < 6) { setErro('A senha deve ter ao menos 6 caracteres.'); return }
    setLoading(true)
    try {
      await api.post('/usuarios/registrar/', {
        username, first_name: nome, email, password
      })
      setSucesso('Conta criada! Faça login.')
      setAba('entrar')
    } catch (err) {
      const dados = err.response?.data
      if (dados && typeof dados === 'object') {
        setErro(Object.values(dados).flat().join(' '))
      } else {
        setErro('Não foi possível criar a conta.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-end p-12 relative"
        style={{
          background: 'linear-gradient(to bottom, #000441cc, #000441ee), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200) center/cover no-repeat'
        }}
      >
        <div className="relative z-10">
          <img src="/logo.svg" alt="Bússola PA" className="w-24 h-24 mb-6" />
          <h1 className="text-white text-4xl font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Explore o Inesquecível!
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            O seu guia definitivo para as aventuras mais autênticas de Paulo Afonso e região. Navegue com precisão e segurança.
          </p>
        </div>
        <p className="relative z-10 text-white/40 text-xs mt-12 uppercase tracking-widest">Bússola PA</p>
      </div>

      {/* Lado direito */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 bg-white">
        <div className="max-w-sm w-full mx-auto">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo.svg" alt="Bússola PA" className="w-16 h-16 mb-3 lg:hidden" />
            <h2 className="text-3xl font-bold text-center" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
              Bússola PA
            </h2>
          </div>

          {/* Abas */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => { setAba('entrar'); setErro(''); setSucesso('') }}
              className="flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors"
              style={{ borderColor: aba === 'entrar' ? '#a53c00' : 'transparent', color: aba === 'entrar' ? '#a53c00' : '#9ca3af' }}
            >
              Entrar
            </button>
            <button
              onClick={() => { setAba('criar'); setErro(''); setSucesso('') }}
              className="flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors"
              style={{ borderColor: aba === 'criar' ? '#a53c00' : 'transparent', color: aba === 'criar' ? '#a53c00' : '#9ca3af' }}
            >
              Criar Conta
            </button>
          </div>

          {sucesso && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-4">{sucesso}</p>}
          {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{erro}</p>}

          {/* Aba Entrar */}
          {aba === 'entrar' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#454652' }}>Usuário</label>
                <input
                  className="w-full px-4 py-3 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#c6c5d4' }}
                  placeholder="Seu usuário"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium" style={{ color: '#454652' }}>Senha</label>
                </div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border rounded-lg text-sm outline-none pr-10"
                    style={{ borderColor: '#c6c5d4' }}
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setMostrarSenha(!mostrarSenha)}>
                    {mostrarSenha ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm"
                style={{ background: '#a53c00', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Aba Criar Conta */}
          {aba === 'criar' && (
            <form onSubmit={handleCriarConta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#454652' }}>Nome</label>
                <input
                  className="w-full px-4 py-3 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#c6c5d4' }}
                  placeholder="Seu nome completo"
                  value={nome}
                  maxLength={LIMITES.nome}
                  onChange={e => setNome(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#454652' }}>Usuário</label>
                <input
                  className="w-full px-4 py-3 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#c6c5d4' }}
                  placeholder="Nome de usuário"
                  value={username}
                  maxLength={LIMITES.username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#454652' }}>Email</label>
                <input
                  className="w-full px-4 py-3 border rounded-lg text-sm outline-none"
                  style={{ borderColor: '#c6c5d4' }}
                  placeholder="seu@email.com"
                  type="text"
                  value={email}
                  maxLength={LIMITES.email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#454652' }}>Senha</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border rounded-lg text-sm outline-none pr-10"
                    style={{ borderColor: '#c6c5d4' }}
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    maxLength={LIMITES.senha}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setMostrarSenha(!mostrarSenha)}>
                    {mostrarSenha ? '🙈' : '👁'}
                  </button>
                </div>
                <MedidorSenha senha={password} />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm"
                style={{ background: '#a53c00', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Criando...' : 'Criar Conta'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-8">© 2026 Bússola PA. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}