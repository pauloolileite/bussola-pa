import { useEffect, useState } from 'react'
import { Plus, AlertTriangle, Paperclip, X, CheckCircle, Search, Camera } from 'lucide-react'
import api from '../api'

const STATUS_CORES = {
  aberta: 'bg-red-100 text-red-800',
  em_analise: 'bg-orange-100 text-orange-800',
  resolvida: 'bg-green-100 text-green-800',
}

const STATUS_LABEL = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  resolvida: 'Resolvida',
}

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([])
  const [reservas, setReservas] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({ reserva: '', descricao: '' })
  const [foto, setFoto] = useState(null)
  const [previewFoto, setPreviewFoto] = useState(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [selecionada, setSelecionada] = useState(null)
  const [erroModal, setErroModal] = useState('')
  const [salvandoStatus, setSalvandoStatus] = useState(false)

  useEffect(() => {
    api.get('/ocorrencias/').then(res => setOcorrencias(res.data))
    api.get('/reservas/').then(res => setReservas(res.data)).catch(() => {})
  }, [])

  function exibirSucesso(msg) {
    setSucesso(msg)
    setTimeout(() => setSucesso(''), 3000)
  }

  function abrirForm() {
    setForm({ reserva: '', descricao: '' })
    setFoto(null)
    setPreviewFoto(null)
    setErro('')
    setMostrarForm(true)
  }

  function escolherFoto(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setFoto(arquivo)
    setPreviewFoto(URL.createObjectURL(arquivo))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!form.reserva) { setErro('Selecione a reserva relacionada.'); return }
    setSalvando(true)
    try {
      // FormData permite enviar a foto junto (multipart). O axios define o
      // cabeçalho correto automaticamente.
      const dados = new FormData()
      dados.append('reserva', form.reserva)
      dados.append('descricao', form.descricao)
      if (foto) dados.append('anexo', foto)

      const res = await api.post('/ocorrencias/', dados)
      setOcorrencias(prev => [res.data, ...prev])
      setMostrarForm(false)
      exibirSucesso('Ocorrência registrada com sucesso.')
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') setErro(Object.values(d).flat().join(' '))
      else setErro('Não foi possível registrar a ocorrência.')
    } finally {
      setSalvando(false)
    }
  }

  async function mudarStatus(novoStatus) {
    if (!selecionada) return
    setErroModal('')
    setSalvandoStatus(true)
    try {
      const res = await api.patch(`/ocorrencias/${selecionada.id}/`, { status: novoStatus })
      setOcorrencias(prev => prev.map(o => o.id === selecionada.id ? res.data : o))
      setSelecionada(res.data)
      exibirSucesso(novoStatus === 'resolvida' ? 'Ocorrência resolvida.' : 'Status atualizado.')
      if (novoStatus === 'resolvida') setSelecionada(null)
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') setErroModal(Object.values(d).flat().join(' '))
      else setErroModal('Não foi possível atualizar a ocorrência.')
    } finally {
      setSalvandoStatus(false)
    }
  }

  function rotuloReserva(r) {
    const passeio = r.passeio_nome || `Passeio ${r.passeio}`
    return `#BPA-${r.id} — ${passeio} (${r.data_reserva})`
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
            Ocorrências
          </h2>
          <p className="text-sm text-gray-500 mt-1">{ocorrencias.length} registros</p>
        </div>
        <button onClick={abrirForm}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
          style={{ background: '#a53c00' }}>
          <Plus size={16} /> Registrar Ocorrência
        </button>
      </div>

      {sucesso && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg mb-4">
          <CheckCircle size={16} /> <span>{sucesso}</span>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {ocorrencias.map(o => (
          <div key={o.id} onClick={() => { setSelecionada(o); setErroModal('') }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle size={15} className="text-orange-500 flex-shrink-0" />
                <span className="font-semibold text-sm truncate" style={{ color: '#000441' }}>
                  Ocorrência #{o.id} — Reserva #{o.reserva}
                </span>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_CORES[o.status]}`}>
                {STATUS_LABEL[o.status] || o.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {o.descricao}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{new Date(o.data_ocorrencia).toLocaleString('pt-BR')}</span>
              <span className="flex items-center gap-3">
                {o.anexo && (
                  <span className="flex items-center gap-1 text-xs text-blue-600"><Paperclip size={12} /> Anexo</span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-400"><Search size={12} /> Ver detalhes</span>
              </span>
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

      {/* Modal: registrar nova ocorrência */}
      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMostrarForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                <h3 className="font-bold text-base" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
                  Nova Ocorrência
                </h3>
              </div>
              <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Reserva relacionada</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
                  value={form.reserva}
                  onChange={e => setForm({ ...form, reserva: e.target.value })}
                  required>
                  <option value="">Selecione uma reserva...</option>
                  {reservas.map(r => (
                    <option key={r.id} value={r.id}>{rotuloReserva(r)}</option>
                  ))}
                </select>
                {reservas.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Você não tem reservas para vincular ocorrências.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Descrição</label>
                <textarea
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none"
                  rows={4}
                  maxLength={1000}
                  placeholder="Descreva a ocorrência detalhadamente..."
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  required
                />
              </div>

              {/* Foto (abre a câmera no celular via capture) */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Foto (opcional)</label>
                {previewFoto ? (
                  <div className="relative">
                    <img src={previewFoto} alt="Prévia" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={() => { setFoto(null); setPreviewFoto(null) }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 cursor-pointer hover:border-gray-400 transition-colors">
                    <Camera size={18} />
                    Tirar foto ou escolher imagem
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={escolherFoto} />
                  </label>
                )}
                <p className="text-xs text-gray-400 mt-1">JPG ou PNG, até 10 MB.</p>
              </div>

              {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={salvando}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold active:scale-95 hover:opacity-90 cursor-pointer"
                  style={{ background: '#a53c00', opacity: salvando ? 0.7 : 1 }}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={() => setMostrarForm(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 cursor-pointer">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: detalhes / resolução */}
      {selecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelecionada(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                <h3 className="font-bold text-base" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
                  Ocorrência #{selecionada.id}
                </h3>
              </div>
              <button onClick={() => setSelecionada(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Status atual</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CORES[selecionada.status]}`}>
                  {STATUS_LABEL[selecionada.status] || selecionada.status}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Reserva</span>
                <span className="text-sm text-gray-700">#BPA-{selecionada.reserva}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Descrição</span>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{selecionada.descricao}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Registrada em</span>
                <span className="text-sm text-gray-600">{new Date(selecionada.data_ocorrencia).toLocaleString('pt-BR')}</span>
              </div>
              {selecionada.anexo && (
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Foto anexada</span>
                  <a href={selecionada.anexo} target="_blank" rel="noreferrer">
                    <img src={selecionada.anexo} alt="Anexo" className="w-full max-h-48 object-cover rounded-lg border border-gray-200" />
                  </a>
                </div>
              )}

              {erroModal && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erroModal}</p>}

              {selecionada.status !== 'resolvida' ? (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                  {selecionada.status === 'aberta' && (
                    <button onClick={() => mudarStatus('em_analise')} disabled={salvandoStatus}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white active:scale-95 hover:opacity-90 cursor-pointer"
                      style={{ background: '#d97706', opacity: salvandoStatus ? 0.7 : 1 }}>
                      Marcar em análise
                    </button>
                  )}
                  <button onClick={() => mudarStatus('resolvida')} disabled={salvandoStatus}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold text-white active:scale-95 hover:opacity-90 cursor-pointer"
                    style={{ background: '#16a34a', opacity: salvandoStatus ? 0.7 : 1 }}>
                    <CheckCircle size={16} /> {salvandoStatus ? 'Salvando...' : 'Resolver ocorrência'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold">
                  <CheckCircle size={16} /> Ocorrência resolvida
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
