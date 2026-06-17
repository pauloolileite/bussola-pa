import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, Filter, Plus, X, MapPin } from 'lucide-react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { dialogSx, inputSx } from '../utils/muiTheme'
import { useAuth } from '../hooks/useAuth'
import api from '../api'

const CATEGORIA_LABELS = {
  catamara: 'Catamarã',
  lancha: 'Lancha',
  voadeira: 'Voadeira',
  ecoturismo: 'Ecoturismo',
  aventura: 'Aventura',
}

const CATEGORIA_CORES = {
  catamara: 'bg-blue-100 text-blue-800',
  lancha: 'bg-cyan-100 text-cyan-800',
  voadeira: 'bg-teal-100 text-teal-800',
  ecoturismo: 'bg-green-100 text-green-800',
  aventura: 'bg-orange-100 text-orange-800',
}

function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
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

export default function Passeios() {
  const { isAdmin, isCliente } = useAuth()
  const navigate = useNavigate()
  const [aba, setAba] = useState('passeios')
  const [passeios, setPasseios] = useState([])
  const [pontos, setPontos] = useState([])
  const [categoria, setCategoria] = useState('')
  const [modalPasseio, setModalPasseio] = useState(false)
  const [passeioEditando, setPasseioEditando] = useState(null)
  const [modalPonto, setModalPonto] = useState(false)
  const [modalSolicitar, setModalSolicitar] = useState(false)
  const [passeioSolicitado, setPasseioSolicitado] = useState(null)
  const [formSolicitar, setFormSolicitar] = useState({ quantidade_turistas: 1, observacoes: '' })
  const [dataSolicitar, setDataSolicitar] = useState(null)
  const [horarioSolicitar, setHorarioSolicitar] = useState(null)
  const [loadingSolicitar, setLoadingSolicitar] = useState(false)
  const [formPasseio, setFormPasseio] = useState({ nome: '', descricao: '', categoria: 'catamara', tipo_valor: 'fixo', valor: '', ponto_turistico: '' })
  const [formPonto, setFormPonto] = useState({ nome: '', descricao: '', localizacao: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => { carregarDados() }, [categoria])

  function carregarDados() {
    api.get('/passeios/', { params: categoria ? { categoria } : {} }).then(res => setPasseios(res.data))
    api.get('/pontos-turisticos/').then(res => setPontos(res.data))
  }

  function exibirSucesso(msg) {
    setSucesso(msg)
    setTimeout(() => setSucesso(''), 3000)
  }

  function abrirSolicitacao(passeio) {
    setPasseioSolicitado(passeio)
    setFormSolicitar({ quantidade_turistas: 1, observacoes: '' })
    setDataSolicitar(null)
    setHorarioSolicitar(null)
    setErro('')
    setModalSolicitar(true)
  }

  async function enviarSolicitacao(e) {
    e.preventDefault()
    setErro('')
    if (!dataSolicitar || !horarioSolicitar) { setErro('Escolha a data e o horário.'); return }
    setLoadingSolicitar(true)
    try {
      await api.post('/reservas/solicitar/', {
        passeio: passeioSolicitado.id,
        data_reserva: dataSolicitar.format('YYYY-MM-DD'),
        horario_reserva: horarioSolicitar.format('HH:mm:ss'),
        quantidade_turistas: formSolicitar.quantidade_turistas,
        observacoes: formSolicitar.observacoes,
      })
      setModalSolicitar(false)
      exibirSucesso('Solicitação enviada! Acompanhe em "Minhas Reservas".')
    } catch (err) {
      const dados = err.response?.data
      if (dados?.erro) setErro(dados.erro)
      else if (dados && typeof dados === 'object') setErro(Object.values(dados).flat().join(' '))
      else setErro('Não foi possível enviar a solicitação.')
    } finally {
      setLoadingSolicitar(false)
    }
  }

  function abrirNovoPasseio() {
    setPasseioEditando(null)
    setFormPasseio({ nome: '', descricao: '', categoria: 'catamara', tipo_valor: 'fixo', valor: '', ponto_turistico: '', status: true })
    setErro('')
    setModalPasseio(true)
  }

  function abrirEdicaoPasseio(p) {
    setPasseioEditando(p)
    setFormPasseio({
      nome: p.nome || '',
      descricao: p.descricao || '',
      categoria: p.categoria || 'catamara',
      tipo_valor: p.tipo_valor || 'fixo',
      valor: p.valor != null ? p.valor : '',
      ponto_turistico: p.ponto_turistico || '',
      status: p.status,
    })
    setErro('')
    setModalPasseio(true)
  }

  async function salvarPasseio(e) {
    e.preventDefault()
    setErro('')
    try {
      const payload = { ...formPasseio }
      if (payload.tipo_valor === 'consultar') payload.valor = null
      if (!payload.ponto_turistico) delete payload.ponto_turistico
      if (passeioEditando) {
        await api.patch(`/passeios/${passeioEditando.id}/`, payload)
        exibirSucesso('Passeio atualizado com sucesso.')
      } else {
        await api.post('/passeios/', payload)
        exibirSucesso('Passeio cadastrado com sucesso.')
      }
      setModalPasseio(false)
      setPasseioEditando(null)
      setFormPasseio({ nome: '', descricao: '', categoria: 'catamara', tipo_valor: 'fixo', valor: '', ponto_turistico: '', status: true })
      carregarDados()
    } catch {
      setErro(passeioEditando ? 'Não foi possível atualizar o passeio.' : 'Não foi possível cadastrar o passeio.')
    }
  }

  async function salvarPonto(e) {
    e.preventDefault()
    setErro('')
    try {
      await api.post('/pontos-turisticos/', formPonto)
      setModalPonto(false)
      setFormPonto({ nome: '', descricao: '', localizacao: '' })
      exibirSucesso('Ponto turístico cadastrado com sucesso.')
      carregarDados()
    } catch { setErro('Não foi possível cadastrar o ponto turístico.') }
  }

  async function togglePonto(id, statusAtual) {
    try {
      await api.patch(`/pontos-turisticos/${id}/`, { status: !statusAtual })
      carregarDados()
    } catch { setErro('Não foi possível atualizar o status.') }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
            {aba === 'passeios' ? 'Passeios Disponíveis' : 'Pontos Turísticos'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Paulo Afonso, Bahia</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {aba === 'passeios' && (
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-gray-400 flex-shrink-0" />
              <select className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer bg-white"
                value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Todas as categorias</option>
                {Object.entries(CATEGORIA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          )}
          {isAdmin && (
            <button
              onClick={() => aba === 'passeios' ? abrirNovoPasseio() : setModalPonto(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
              style={{ background: '#a53c00' }}
            >
              <Plus size={16} />
              {aba === 'passeios' ? 'Novo Passeio' : 'Novo Ponto'}
            </button>
          )}
        </div>
      </div>

      {sucesso && <p className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg mb-4">{sucesso}</p>}
      {erro && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{erro}</p>}

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: 'passeios', label: 'Passeios', icone: Compass },
          { key: 'pontos', label: 'Pontos Turísticos', icone: MapPin },
        ].map(({ key, label, icone: Icone }) => (
          <button key={key} onClick={() => setAba(key)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            style={{ borderColor: aba === key ? '#a53c00' : 'transparent', color: aba === key ? '#a53c00' : '#9ca3af' }}>
            <Icone size={15} />{label}
          </button>
        ))}
      </div>

      {aba === 'passeios' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {passeios.map(p => (
            <div key={p.id}
              onClick={isAdmin ? () => abrirEdicaoPasseio(p) : undefined}
              className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow ${isAdmin ? 'cursor-pointer' : ''}`}>
              <div className="h-36 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #000441, #1a2a6c)' }}>
                <Compass size={40} className="text-white/40" />
                {isAdmin && !p.status && (
                  <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800/80 text-white">Inativo</span>
                )}
                {isAdmin && (
                  <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full bg-white/90 text-gray-600">Editar</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORIA_CORES[p.categoria]}`}>
                    {CATEGORIA_LABELS[p.categoria] || p.categoria}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.tipo_valor === 'fixo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {p.tipo_valor === 'fixo' ? `R$ ${parseFloat(p.valor).toFixed(2)}` : 'A Consultar'}
                  </span>
                </div>
                <h3 className="font-semibold text-base mb-1" style={{ color: '#000441' }}>{p.nome}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.descricao}</p>
                {p.ponto_turistico_nome && <p className="text-xs text-gray-400 mb-3">📍 {p.ponto_turistico_nome}</p>}
                {isCliente && (
                  <button onClick={(e) => { e.stopPropagation(); abrirSolicitacao(p) }}
                    className="w-full py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer" style={{ background: '#a53c00' }}>
                    Solicitar Passeio
                  </button>
                )}
              </div>
            </div>
          ))}
          {passeios.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Compass size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhum passeio encontrado.</p>
            </div>
          )}
        </div>
      )}

      {aba === 'pontos' && (
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
                {p.descricao && <p className="text-sm text-gray-500 mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.descricao}</p>}
                {p.localizacao && <p className="text-xs text-gray-400 mb-3">📍 {p.localizacao}</p>}
                {isAdmin && (
                  <button onClick={() => togglePonto(p.id, p.status)}
                    className="w-full py-2 rounded-lg text-sm font-medium border transition-all active:scale-95 cursor-pointer hover:opacity-80"
                    style={{ borderColor: p.status ? '#fca5a5' : '#86efac', color: p.status ? '#dc2626' : '#16a34a' }}>
                    {p.status ? 'Desativar' : 'Ativar'}
                  </button>
                )}
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
      )}

      {modalPasseio && (
        <Modal titulo={passeioEditando ? 'Editar Passeio' : 'Novo Passeio'} onClose={() => { setModalPasseio(false); setPasseioEditando(null); setErro('') }}>
          <form onSubmit={salvarPasseio} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Nome</label>
              <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="Nome do passeio" value={formPasseio.nome}
                onChange={e => setFormPasseio({ ...formPasseio, nome: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Descrição</label>
              <textarea className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none"
                rows={3} placeholder="Descreva o passeio..." value={formPasseio.descricao}
                onChange={e => setFormPasseio({ ...formPasseio, descricao: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Categoria</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
                  value={formPasseio.categoria} onChange={e => setFormPasseio({ ...formPasseio, categoria: e.target.value })}>
                  {Object.entries(CATEGORIA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Tipo de Valor</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
                  value={formPasseio.tipo_valor} onChange={e => setFormPasseio({ ...formPasseio, tipo_valor: e.target.value })}>
                  <option value="fixo">Valor Fixo</option>
                  <option value="consultar">A Consultar</option>
                </select>
              </div>
            </div>
            {formPasseio.tipo_valor === 'fixo' && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Valor (R$)</label>
                <input type="number" min="0" step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                  placeholder="0,00" value={formPasseio.valor}
                  onChange={e => setFormPasseio({ ...formPasseio, valor: e.target.value })} required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Ponto Turístico</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
                value={formPasseio.ponto_turistico} onChange={e => setFormPasseio({ ...formPasseio, ponto_turistico: e.target.value })}>
                <option value="">Nenhum</option>
                {pontos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            {passeioEditando && (
              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Passeio disponível</p>
                  <p className="text-xs text-gray-400">Desative para ocultar das solicitações</p>
                </div>
                <button type="button"
                  onClick={() => setFormPasseio({ ...formPasseio, status: !formPasseio.status })}
                  className="relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
                  style={{ background: formPasseio.status ? '#16a34a' : '#d1d5db' }}>
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                    style={{ transform: formPasseio.status ? 'translateX(24px)' : 'translateX(0)' }} />
                </button>
              </div>
            )}
            {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer" style={{ background: '#a53c00' }}>Salvar</button>
              <button type="button" onClick={() => { setModalPasseio(false); setErro('') }} className="flex-1 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {modalPonto && (
        <Modal titulo="Novo Ponto Turístico" onClose={() => { setModalPonto(false); setErro('') }}>
          <form onSubmit={salvarPonto} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Nome</label>
              <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="Nome do local" value={formPonto.nome}
                onChange={e => setFormPonto({ ...formPonto, nome: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Descrição</label>
              <textarea className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none"
                rows={3} placeholder="Descreva o local..." value={formPonto.descricao}
                onChange={e => setFormPonto({ ...formPonto, descricao: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Localização</label>
              <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="Endereço ou coordenadas GPS" value={formPonto.localizacao}
                onChange={e => setFormPonto({ ...formPonto, localizacao: e.target.value })} />
            </div>
            {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer" style={{ background: '#a53c00' }}>Salvar</button>
              <button type="button" onClick={() => { setModalPonto(false); setErro('') }} className="flex-1 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>

      {/* Modal: solicitar passeio (cliente) */}
      {modalSolicitar && passeioSolicitado && (
        <Modal titulo={`Solicitar: ${passeioSolicitado.nome}`} onClose={() => setModalSolicitar(false)}>
          <form onSubmit={enviarSolicitacao} className="space-y-4">
            {erro && (
              <p className="text-sm px-3 py-2 rounded-lg bg-red-50 text-red-700">{erro}</p>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Data do Passeio</label>
              <MobileDatePicker value={dataSolicitar} onChange={setDataSolicitar} format="DD/MM/YYYY" disablePast
                slotProps={{ textField: { sx: inputSx, fullWidth: true }, dialog: { sx: dialogSx } }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Horário</label>
              <MobileTimePicker value={horarioSolicitar} onChange={setHorarioSolicitar} ampm={false} views={['hours', 'minutes']}
                slotProps={{ textField: { sx: inputSx, fullWidth: true }, dialog: { sx: dialogSx } }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Quantidade de Turistas</label>
              <input type="number" min={1} max={100}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none"
                value={formSolicitar.quantidade_turistas}
                onChange={e => setFormSolicitar({ ...formSolicitar, quantidade_turistas: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Observações (opcional)</label>
              <textarea rows={3} maxLength={1000}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none"
                placeholder="Alguma informação para o guia?"
                value={formSolicitar.observacoes}
                onChange={e => setFormSolicitar({ ...formSolicitar, observacoes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loadingSolicitar}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold active:scale-95 hover:opacity-90 cursor-pointer"
                style={{ background: '#a53c00', opacity: loadingSolicitar ? 0.7 : 1 }}>
                {loadingSolicitar ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
              <button type="button" onClick={() => setModalSolicitar(false)}
                className="flex-1 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 cursor-pointer">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </LocalizationProvider>
  )
}