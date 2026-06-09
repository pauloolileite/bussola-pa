import { useEffect, useState } from 'react'
import { MapPin, Plus, X, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../api'

export default function PontosTuristicos() {
  const [pontos, setPontos] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '', localizacao: '', status: true })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    carregarPontos()
  }, [])

  function carregarPontos() {
    api.get('/pontos-turisticos/').then(res => setPontos(res.data))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      await api.post('/pontos-turisticos/', form)
      setMostrarModal(false)
      setForm({ nome: '', descricao: '', localizacao: '', status: true })
      setSucesso('Ponto turístico cadastrado com sucesso.')
      setTimeout(() => setSucesso(''), 3000)
      carregarPontos()
    } catch {
      setErro('Não foi possível cadastrar o ponto turístico.')
    }
  }

  async function toggleStatus(id, statusAtual) {
    try {
      await api.patch(`/pontos-turisticos/${id}/`, { status: !statusAtual })
      carregarPontos()
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
            Pontos Turísticos
          </h2>
          <p className="text-sm text-gray-500 mt-1">{pontos.length} pontos cadastrados</p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
          style={{ background: '#a53c00' }}
        >
          <Plus size={16} />
          Novo Ponto
        </button>
      </div>

      {sucesso && <p className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg mb-4">{sucesso}</p>}
      {erro && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{erro}</p>}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pontos.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-28 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000441, #1a2a6c)' }}>
              <MapPin size={36} className="text-white/40" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-base" style={{ color: '#000441' }}>{p.nome}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {p.status ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {p.descricao && <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-2">{p.descricao}</p>}
              {p.localizacao && <p className="text-xs text-gray-400 mb-3">📍 {p.localizacao}</p>}
              <button
                onClick={() => toggleStatus(p.id, p.status)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all active:scale-95 cursor-pointer hover:opacity-80"
                style={{ borderColor: p.status ? '#fca5a5' : '#86efac', color: p.status ? '#dc2626' : '#16a34a' }}
              >
                {p.status ? <><ToggleRight size={15} /> Desativar</> : <><ToggleLeft size={15} /> Ativar</>}
              </button>
            </div>
          </div>
        ))}
        {pontos.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center">
            <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Nenhum ponto turístico cadastrado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-lg" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
                Novo Ponto Turístico
              </h3>
              <button
                onClick={() => { setMostrarModal(false); setErro('') }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{erro}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600">Nome</label>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                    placeholder="Nome do ponto turístico"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600">Descrição</label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors resize-none"
                    rows={3}
                    placeholder="Descreva o ponto turístico..."
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600">Localização</label>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                    placeholder="Endereço ou coordenadas GPS"
                    value={form.localizacao}
                    onChange={e => setForm({ ...form, localizacao: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                    style={{ background: '#a53c00' }}
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMostrarModal(false); setErro('') }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}