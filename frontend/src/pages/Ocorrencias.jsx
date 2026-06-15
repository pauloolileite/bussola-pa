import { useEffect, useState } from 'react'
import { Plus, AlertTriangle, Paperclip, X } from 'lucide-react'
import api from '../api'

const STATUS_CORES = {
  aberta: 'bg-red-100 text-red-800',
  em_analise: 'bg-orange-100 text-orange-800',
  resolvida: 'bg-green-100 text-green-800',
}

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([])
  const [form, setForm] = useState({ reserva: '', descricao: '' })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    api.get('/ocorrencias/').then(res => setOcorrencias(res.data))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      const res = await api.post('/ocorrencias/', form)
      setOcorrencias(prev => [res.data, ...prev])
      setForm({ reserva: '', descricao: '' })
      setMostrarForm(false)
      setSucesso('Ocorrência registrada com sucesso.')
      setTimeout(() => setSucesso(''), 3000)
    } catch {
      setErro('Não foi possível registrar a ocorrência.')
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
            Ocorrências
          </h2>
          <p className="text-sm text-gray-500 mt-1">{ocorrencias.length} registros</p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
          style={{ background: '#a53c00' }}
        >
          <Plus size={16} />
          Registrar Ocorrência
        </button>
      </div>

      {sucesso && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg mb-4">
          <span>{sucesso}</span>
        </div>
      )}

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base" style={{ color: '#000441' }}>Nova Ocorrência</h3>
            <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">ID da Reserva</label>
              <input
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="Ex: 1"
                value={form.reserva}
                onChange={e => setForm({ ...form, reserva: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Descrição</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors resize-none"
                rows={4}
                placeholder="Descreva a ocorrência detalhadamente..."
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                required
              />
            </div>
            {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}
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

      {/* Lista */}
      <div className="space-y-3">
        {ocorrencias.map(o => (
          <div key={o.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-orange-500" />
                <span className="font-semibold text-sm" style={{ color: '#000441' }}>
                  Ocorrência #{o.id} — Reserva #{o.reserva}
                </span>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CORES[o.status]}`}>
                {o.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{o.descricao}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {new Date(o.data_ocorrencia).toLocaleString('pt-BR')}
              </span>
              {o.anexo && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <Paperclip size={12} /> Anexo
                </span>
              )}
            </div>
          </div>
        ))}
        {ocorrencias.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <AlertTriangle size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Nenhuma ocorrência registrada.</p>
          </div>
        )}
      </div>
    </div>
  )
}