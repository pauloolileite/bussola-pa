import { useEffect, useState } from 'react'
import { Plus, X, UserCheck, UserX } from 'lucide-react'
import api from '../api'

const PERFIL_CORES = {
  admin: 'bg-blue-100 text-blue-800',
  guia: 'bg-green-100 text-green-800',
  parceiro: 'bg-orange-100 text-orange-800',
  cliente: 'bg-gray-100 text-gray-700',
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '', email: '', password: '', perfil: 'guia', telefone: '' })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    api.get('/usuarios/').then(res => setUsuarios(res.data))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      const res = await api.post('/usuarios/', form)
      setUsuarios(prev => [...prev, res.data])
      setForm({ username: '', first_name: '', last_name: '', email: '', password: '', perfil: 'guia', telefone: '' })
      setMostrarForm(false)
      setSucesso('Usuário criado com sucesso.')
      setTimeout(() => setSucesso(''), 3000)
    } catch {
      setErro('Não foi possível criar o usuário.')
    }
  }

  async function toggleStatus(id, statusAtual) {
    try {
      const res = await api.patch(`/usuarios/${id}/`, { status: !statusAtual })
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: res.data.status } : u))
    } catch {
      setErro('Não foi possível atualizar o status.')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
            Gestão de Usuários
          </h2>
          <p className="text-sm text-gray-500 mt-1">{usuarios.length} usuários cadastrados</p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
          style={{ background: '#a53c00' }}
        >
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      {sucesso && <p className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg mb-4">{sucesso}</p>}
      {erro && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{erro}</p>}

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base" style={{ color: '#000441' }}>Novo Usuário</h3>
            <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Username', key: 'username', placeholder: 'nome.usuario' },
                { label: 'Nome', key: 'first_name', placeholder: 'Primeiro nome' },
                { label: 'Sobrenome', key: 'last_name', placeholder: 'Sobrenome' },
                { label: 'Email', key: 'email', placeholder: 'email@exemplo.com', type: 'email' },
                { label: 'Senha', key: 'password', placeholder: '••••••••', type: 'password' },
                { label: 'Telefone', key: 'telefone', placeholder: '(75) 99999-9999' },
              ].map(({ label, key, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 text-gray-600">{label}</label>
                  <input
                    type={type}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={['username', 'password'].includes(key)}
                  />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-600">Perfil</label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
                value={form.perfil}
                onChange={e => setForm({ ...form, perfil: e.target.value })}
              >
                <option value="admin">Administrador</option>
                <option value="guia">Guia de Turismo</option>
                <option value="parceiro">Parceiro Operacional</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                style={{ background: '#a53c00' }}
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">E-mail</th>
              <th className="px-6 py-3 text-left">Telefone</th>
              <th className="px-6 py-3 text-left">Perfil</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: '#000441' }}>
                      {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.email || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.telefone || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${PERFIL_CORES[u.perfil]}`}>
                    {u.perfil}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 text-xs font-medium ${u.status ? 'text-green-600' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${u.status ? 'bg-green-500' : 'bg-red-400'}`} />
                    {u.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleStatus(u.id, u.status)}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg border transition-all active:scale-95 cursor-pointer hover:opacity-80"
                    style={{ borderColor: u.status ? '#fca5a5' : '#86efac', color: u.status ? '#dc2626' : '#16a34a' }}
                  >
                    {u.status ? <><UserX size={12} /> Desativar</> : <><UserCheck size={12} /> Ativar</>}
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}