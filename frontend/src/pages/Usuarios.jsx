import { useEffect, useState } from 'react'
import { Plus, X, UserCheck, UserX, Mail, Phone, Shield } from 'lucide-react'
import api from '../api'

const PERFIL_CORES = {
  admin: 'bg-blue-100 text-blue-800',
  guia: 'bg-green-100 text-green-800',
  parceiro: 'bg-orange-100 text-orange-800',
  cliente: 'bg-gray-100 text-gray-700',
}

const PERFIL_LABELS = {
  admin: 'Administrador',
  guia: 'Guia de Turismo',
  parceiro: 'Parceiro Operacional',
  cliente: 'Cliente',
}

function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-lg" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>{titulo}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [modalNovo, setModalNovo] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [modoEditar, setModoEditar] = useState(false)
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '', email: '', password: '', perfil: 'guia', telefone: '' })
  const [formEditar, setFormEditar] = useState({})
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => { carregarUsuarios() }, [])

  function carregarUsuarios() {
    api.get('/usuarios/').then(res => setUsuarios(res.data))
  }

  function exibirSucesso(msg) {
    setSucesso(msg)
    setTimeout(() => setSucesso(''), 3000)
  }

  function abrirUsuario(u) {
    setUsuarioSelecionado(u)
    setFormEditar({ first_name: u.first_name, last_name: u.last_name, email: u.email, telefone: u.telefone, perfil: u.perfil })
    setModoEditar(false)
    setErro('')
  }

  async function handleNovo(e) {
    e.preventDefault()
    setErro('')
    try {
      await api.post('/usuarios/', form)
      setModalNovo(false)
      setForm({ username: '', first_name: '', last_name: '', email: '', password: '', perfil: 'guia', telefone: '' })
      exibirSucesso('Usuário criado com sucesso.')
      carregarUsuarios()
    } catch { setErro('Não foi possível criar o usuário.') }
  }

  async function handleEditar(e) {
    e.preventDefault()
    setErro('')
    try {
      await api.patch(`/usuarios/${usuarioSelecionado.id}/`, formEditar)
      setModoEditar(false)
      exibirSucesso('Usuário atualizado com sucesso.')
      carregarUsuarios()
      setUsuarioSelecionado({ ...usuarioSelecionado, ...formEditar })
    } catch { setErro('Não foi possível atualizar o usuário.') }
  }

  async function toggleStatus(u) {
    try {
      await api.patch(`/usuarios/${u.id}/`, { status: !u.status })
      exibirSucesso(u.status ? 'Usuário desativado.' : 'Usuário ativado.')
      carregarUsuarios()
      setUsuarioSelecionado({ ...u, status: !u.status })
    } catch { setErro('Não foi possível atualizar o status.') }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
            Gestão de Usuários
          </h2>
          <p className="text-sm text-gray-500 mt-1">{usuarios.length} usuários cadastrados</p>
        </div>
        <button onClick={() => { setModalNovo(true); setErro('') }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
          style={{ background: '#a53c00' }}>
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      {sucesso && <p className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg mb-4">{sucesso}</p>}
      {erro && !usuarioSelecionado && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{erro}</p>}

      {/* MOBILE: cartões (um por usuário) */}
      <div className="md:hidden space-y-3">
        {usuarios.map(u => (
          <div key={u.id} onClick={() => abrirUsuario(u)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer active:bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: '#000441' }}>
                {(u.first_name?.[0] || u.username[0]).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{u.first_name} {u.last_name}</p>
                <p className="text-xs text-gray-400 truncate">@{u.username}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-gray-400">E-mail</span>
                <span className="text-gray-600 truncate text-right">{u.email || '—'}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400">Perfil</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${PERFIL_CORES[u.perfil]}`}>
                  {PERFIL_LABELS[u.perfil] || u.perfil}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400">Status</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${u.status ? 'text-green-600' : 'text-red-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${u.status ? 'bg-green-500' : 'bg-red-400'}`} />
                  {u.status ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {usuarios.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">Nenhum usuário encontrado.</p>
        )}
      </div>

      {/* DESKTOP: tabela */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">E-mail</th>
              <th className="px-6 py-3 text-left">Perfil</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usuarios.map(u => (
              <tr key={u.id}
                onClick={() => abrirUsuario(u)}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                style={{ background: usuarioSelecionado?.id === u.id ? '#f0f4ff' : '' }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
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
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${PERFIL_CORES[u.perfil]}`}>
                    {PERFIL_LABELS[u.perfil] || u.perfil}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-medium w-fit ${u.status ? 'text-green-600' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${u.status ? 'bg-green-500' : 'bg-red-400'}`} />
                    {u.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
</div>
      </div>

      {/* Painel lateral do usuário selecionado */}
      {usuarioSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setUsuarioSelecionado(null)}>
          <div className="bg-white h-full w-full max-w-md shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Header do painel */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-base" style={{ color: '#000441' }}>
                {modoEditar ? 'Editar Usuário' : 'Detalhes do Usuário'}
              </h3>
              <button onClick={() => setUsuarioSelecionado(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Avatar e nome */}
              {!modoEditar && (
                <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-100">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3"
                    style={{ background: '#000441' }}>
                    {(usuarioSelecionado.first_name?.[0] || usuarioSelecionado.username[0]).toUpperCase()}
                  </div>
                  <p className="text-lg font-bold text-gray-800">{usuarioSelecionado.first_name} {usuarioSelecionado.last_name}</p>
                  <p className="text-sm text-gray-400 mb-2">@{usuarioSelecionado.username}</p>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${PERFIL_CORES[usuarioSelecionado.perfil]}`}>
                    {PERFIL_LABELS[usuarioSelecionado.perfil]}
                  </span>
                </div>
              )}

              {/* Modo visualização */}
              {!modoEditar && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <span>{usuarioSelecionado.email || 'E-mail não informado'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                    <span>{usuarioSelecionado.telefone || 'Telefone não informado'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield size={16} className="text-gray-400 flex-shrink-0" />
                    <span className={`flex items-center gap-1.5 font-medium ${usuarioSelecionado.status ? 'text-green-600' : 'text-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${usuarioSelecionado.status ? 'bg-green-500' : 'bg-red-400'}`} />
                      {usuarioSelecionado.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              )}

              {/* Modo edição */}
              {modoEditar && (
                <form onSubmit={handleEditar} className="space-y-4 mb-4">
                  {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}
                  {[
                    { label: 'Nome', key: 'first_name', placeholder: 'Primeiro nome' },
                    { label: 'Sobrenome', key: 'last_name', placeholder: 'Sobrenome' },
                    { label: 'Email', key: 'email', placeholder: 'email@exemplo.com', type: 'email' },
                    { label: 'Telefone', key: 'telefone', placeholder: '(75) 99999-9999' },
                  ].map(({ label, key, placeholder, type = 'text' }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1.5 text-gray-600">{label}</label>
                      <input type={type}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                        placeholder={placeholder} value={formEditar[key] || ''}
                        onChange={e => setFormEditar({ ...formEditar, [key]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-600">Perfil</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
                      value={formEditar.perfil} onChange={e => setFormEditar({ ...formEditar, perfil: e.target.value })}>
                      <option value="admin">Administrador</option>
                      <option value="guia">Guia de Turismo</option>
                      <option value="parceiro">Parceiro Operacional</option>
                      <option value="cliente">Cliente</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit"
                      className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                      style={{ background: '#a53c00' }}>
                      Salvar Alterações
                    </button>
                    <button type="button" onClick={() => setModoEditar(false)}
                      className="flex-1 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Botões de ação */}
              {!modoEditar && (
                <div className="flex flex-col gap-3">
                  <button onClick={() => setModoEditar(true)}
                    className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                    style={{ background: '#000441' }}>
                    Editar Informações
                  </button>
                  <button onClick={() => toggleStatus(usuarioSelecionado)}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-all active:scale-95 cursor-pointer"
                    style={{
                      borderColor: usuarioSelecionado.status ? '#fca5a5' : '#86efac',
                      color: usuarioSelecionado.status ? '#dc2626' : '#16a34a',
                      background: usuarioSelecionado.status ? '#fff5f5' : '#f0fdf4'
                    }}>
                    {usuarioSelecionado.status ? <span className="flex items-center justify-center gap-2"><UserX size={15} /> Desativar Usuário</span> : <span className="flex items-center justify-center gap-2"><UserCheck size={15} /> Ativar Usuário</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Usuário */}
      {modalNovo && (
        <Modal titulo="Novo Usuário" onClose={() => setModalNovo(false)}>
          {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{erro}</p>}
          <form onSubmit={handleNovo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Username</label>
                <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                  placeholder="nome.usuario" value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              {[
                { label: 'Nome', key: 'first_name', placeholder: 'Primeiro nome' },
                { label: 'Sobrenome', key: 'last_name', placeholder: 'Sobrenome' },
                { label: 'Email', key: 'email', placeholder: 'email@exemplo.com', type: 'email' },
                { label: 'Telefone', key: 'telefone', placeholder: '(75) 99999-9999' },
                { label: 'Senha', key: 'password', placeholder: '••••••••', type: 'password' },
              ].map(({ label, key, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600">{label}</label>
                  <input type={type}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                    placeholder={placeholder} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={['username', 'password'].includes(key)} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Perfil</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
                  value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })}>
                  <option value="admin">Administrador</option>
                  <option value="guia">Guia de Turismo</option>
                  <option value="parceiro">Parceiro Operacional</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                style={{ background: '#a53c00' }}>
                Salvar
              </button>
              <button type="button" onClick={() => setModalNovo(false)}
                className="flex-1 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}