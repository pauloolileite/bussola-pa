import { useEffect, useState } from 'react'
import { Plus, QrCode, X, CalendarCheck, Pencil, AlertTriangle } from 'lucide-react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { dialogSx, inputSx, COR_PRIMARIA, COR_SECUNDARIA, CORES } from '../utils/muiTheme'
import api from '../api'
import QRCodeReserva from '../components/QRCodeReserva'

const STATUS_CORES = {
  solicitada: 'bg-blue-100 text-blue-800',
  confirmada: 'bg-green-100 text-green-800',
  em_andamento: 'bg-orange-100 text-orange-800',
  concluida: 'bg-teal-100 text-teal-800',
  cancelada: 'bg-red-100 text-red-800',
}

const TRANSICOES = {
  solicitada: ['confirmada', 'cancelada'],
  confirmada: ['em_andamento', 'cancelada'],
  em_andamento: ['concluida', 'cancelada'],
  concluida: [],
  cancelada: [],
}

const LABELS_TRANSICAO = {
  confirmada: 'Confirmar',
  em_andamento: 'Iniciar',
  concluida: 'Concluir',
  cancelada: 'Cancelar',
}

export default function Reservas() {
  const [reservas, setReservas] = useState([])
  const [reservaSelecionada, setReservaSelecionada] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [clientes, setClientes] = useState([])
  const [passeios, setPasseios] = useState([])
  const [guias, setGuias] = useState([])
  const [form, setForm] = useState({
    cliente: '', passeio: '', guia_responsavel: '',
    quantidade_turistas: 1, observacoes: ''
  })
  const [formEditar, setFormEditar] = useState({
    cliente: '', passeio: '', guia_responsavel: '',
    quantidade_turistas: 1, observacoes: ''
  })
  const [dataReserva, setDataReserva] = useState(null)
  const [horarioReserva, setHorarioReserva] = useState(null)
  const [dataEditar, setDataEditar] = useState(null)
  const [horarioEditar, setHorarioEditar] = useState(null)
  const [modalCliente, setModalCliente] = useState(false)
  const [formCliente, setFormCliente] = useState({ nome: '', telefone: '', email: '' })
  const [erro, setErro] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarReservas()
    api.get('/clientes/').then(res => setClientes(res.data))
    api.get('/passeios/').then(res => setPasseios(res.data))
    api.get('/usuarios/').then(res => setGuias(res.data.filter(u => ['guia', 'admin'].includes(u.perfil))))
  }, [])

  function carregarReservas() {
    api.get('/reservas/').then(res => setReservas(res.data))
  }

  function abrirEditar() {
  setFormEditar({
    cliente: reservaSelecionada.cliente,
    passeio: reservaSelecionada.passeio,
    guia_responsavel: reservaSelecionada.guia_responsavel,
    quantidade_turistas: reservaSelecionada.quantidade_turistas,
    observacoes: reservaSelecionada.observacoes || '',
  })
  setDataEditar(dayjs(reservaSelecionada.data_reserva))
  setHorarioEditar(dayjs(`2000-01-01T${reservaSelecionada.horario_reserva}`))
  setErroForm('')
  setMostrarEditar(true)
  }

  function confirmarEditar() {
    setMostrarConfirmacao(false)
    setFormEditar({
      cliente: reservaSelecionada.cliente,
      passeio: reservaSelecionada.passeio,
      guia_responsavel: reservaSelecionada.guia_responsavel,
      quantidade_turistas: reservaSelecionada.quantidade_turistas,
      observacoes: reservaSelecionada.observacoes || '',
    })
    setDataEditar(dayjs(reservaSelecionada.data_reserva))
    setHorarioEditar(dayjs(`2000-01-01T${reservaSelecionada.horario_reserva}`))
    setErroForm('')
    setMostrarEditar(true)
  }

  async function atualizarStatus(id, novoStatus) {
    try {
      const res = await api.patch(`/reservas/${id}/status/`, { status: novoStatus })
      setReservas(prev => prev.map(r => r.id === id ? res.data : r))
      if (reservaSelecionada?.id === id) setReservaSelecionada(res.data)
    } catch {
      setErro('Não foi possível atualizar o status.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErroForm('')
    if (!dataReserva || !horarioReserva) { setErroForm('Preencha a data e o horário.'); return }
    setLoading(true)
    try {
      const data_reserva = dataReserva.format('YYYY-MM-DD')
      const horario_reserva = horarioReserva.format('HH:mm:ss')
      await api.post('/reservas/', { ...form, data_reserva, horario_reserva })
      setMostrarModal(false)
      setForm({ cliente: '', passeio: '', guia_responsavel: '', quantidade_turistas: 1, observacoes: '' })
      setDataReserva(null)
      setHorarioReserva(null)
      carregarReservas()
    } catch (err) {
      const msg = err.response?.data
      setErroForm(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Erro ao cadastrar reserva.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEditar(e) {
  e.preventDefault()
  setMostrarConfirmacao(true)
}

async function confirmarEditar() {
  setMostrarConfirmacao(false)
  setErroForm('')
  if (!dataEditar || !horarioEditar) { setErroForm('Preencha a data e o horário.'); return }
  setLoading(true)
  try {
    const data_reserva = dataEditar.format('YYYY-MM-DD')
    const horario_reserva = horarioEditar.format('HH:mm:ss')
    const res = await api.patch(`/reservas/${reservaSelecionada.id}/`, {
      ...formEditar, data_reserva, horario_reserva
    })
    setReservas(prev => prev.map(r => r.id === reservaSelecionada.id ? res.data : r))
    setReservaSelecionada(res.data)
    setMostrarEditar(false)
  } catch (err) {
    const msg = err.response?.data
    setErroForm(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Erro ao editar reserva.')
  } finally {
    setLoading(false)
  }
}

  async function salvarCliente(e) {
    e.preventDefault()
    try {
      const res = await api.post('/clientes/', formCliente)
      setClientes(prev => [...prev, res.data])
      setForm(f => ({ ...f, cliente: res.data.id }))
      setModalCliente(false)
      setFormCliente({ nome: '', telefone: '', email: '' })
    } catch {
      setErroForm('Não foi possível cadastrar o cliente.')
    }
  }

  function FormReserva({ formData, setFormData, data, setData, horario, setHorario, onSubmit, onCancel }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        {erroForm && (
          <p className="text-sm px-3 py-2 rounded-lg" style={{ color: CORES.perigo, background: CORES.perigoBg }}>
            {erroForm}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-600">Cliente</label>
            <div className="flex gap-2">
              <select className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
                value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} required>
                <option value="">Selecione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <button type="button" onClick={() => setModalCliente(true)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all active:scale-95 hover:opacity-90 cursor-pointer flex-shrink-0"
                style={{ background: CORES.sucesso }}>
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-600">Passeio</label>
            <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
              value={formData.passeio} onChange={e => setFormData({ ...formData, passeio: e.target.value })} required>
              <option value="">Selecione...</option>
              {passeios.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-600">Guia Responsável</label>
            <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
              value={formData.guia_responsavel} onChange={e => setFormData({ ...formData, guia_responsavel: e.target.value })} required>
              <option value="">Selecione...</option>
              {guias.map(g => (
                <option key={g.id} value={g.id}>
                  {g.first_name && g.last_name ? `${g.first_name} ${g.last_name}` : g.username}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-600">Quantidade de Turistas</label>
            <input type="number" min={1}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none"
              value={formData.quantidade_turistas}
              onChange={e => setFormData({ ...formData, quantidade_turistas: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-600">Data da Reserva</label>
            <MobileDatePicker value={data} onChange={setData} format="DD/MM/YYYY" disablePast
              slotProps={{ textField: { sx: inputSx }, dialog: { sx: dialogSx } }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-600">Horário</label>
            <MobileTimePicker value={horario} onChange={setHorario} ampm={false} views={['hours', 'minutes']}
              slotProps={{ textField: { sx: inputSx }, dialog: { sx: dialogSx } }} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-600">Observações</label>
          <textarea className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none"
            rows={3} placeholder="Informações adicionais..."
            value={formData.observacoes} onChange={e => setFormData({ ...formData, observacoes: e.target.value })} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
            style={{ background: CORES.sucesso, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: COR_PRIMARIA, fontFamily: 'Montserrat, sans-serif' }}>
              Minhas Reservas
            </h2>
            <p className="text-sm text-gray-500 mt-1">{reservas.length} reservas encontradas</p>
          </div>
          <button onClick={() => setMostrarModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
            style={{ background: COR_SECUNDARIA }}>
            <Plus size={16} /> Nova Reserva
          </button>
        </div>

        {erro && (
          <p className="text-sm px-3 py-2 rounded-lg mb-4" style={{ color: CORES.perigo, background: CORES.perigoBg }}>
            {erro}
          </p>
        )}

        <div className="flex gap-6 items-start">
          {/* Tabela */}
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto"><table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Passeio</th>
                  <th className="px-5 py-3 text-left">Data</th>
                  <th className="px-5 py-3 text-left">Turistas</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservas.map(r => (
                  <tr key={r.id} onClick={() => setReservaSelecionada(r)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{ background: reservaSelecionada?.id === r.id ? '#f0f4ff' : '' }}>
                    <td className="px-5 py-4 text-sm font-bold" style={{ color: COR_PRIMARIA }}>#BPA-{r.id}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{r.passeio_nome || r.passeio}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{r.data_reserva}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{r.quantidade_turistas}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CORES[r.status]}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {TRANSICOES[r.status]?.map(s => (
                          <button key={s}
                            onClick={e => { e.stopPropagation(); atualizarStatus(r.id, s) }}
                            className="text-xs px-2 py-1 rounded font-medium transition-all active:scale-95 hover:opacity-80 cursor-pointer text-white"
                            style={{
                              background:
                                s === 'cancelada' ? CORES.perigo :
                                s === 'concluida' ? CORES.sucesso :
                                s === 'confirmada' ? CORES.info :
                                COR_SECUNDARIA
                            }}>
                            {LABELS_TRANSICAO[s]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {reservas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                      Nenhuma reserva encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table></div>
          </div>

          {/* Painel QR code */}
          {reservaSelecionada && (
            <div className="w-64 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <QrCode size={16} style={{ color: COR_PRIMARIA }} />
                  <h3 className="font-semibold text-sm" style={{ color: COR_PRIMARIA }}>QR Code</h3>
                </div>
                <button onClick={abrirEditar}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all active:scale-95 cursor-pointer text-white"
                  style={{ background: CORES.info }}>
                  <Pencil size={12} /> Editar
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">#BPA-{reservaSelecionada.id}</p>
              <div className="flex justify-center mb-4">
                <QRCodeReserva codigo={reservaSelecionada.codigo_qr} tamanho={160} />
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed mb-4">
                Apresente na guarita para validar a entrada.
              </p>
              <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Passeio</span>
                  <span className="font-medium text-right max-w-[120px] truncate">{reservaSelecionada.passeio_nome || reservaSelecionada.passeio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data</span>
                  <span className="font-medium">{reservaSelecionada.data_reserva}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Horário</span>
                  <span className="font-medium">{reservaSelecionada.horario_reserva}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Turistas</span>
                  <span className="font-medium">{reservaSelecionada.quantidade_turistas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CORES[reservaSelecionada.status]}`}>
                    {reservaSelecionada.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmação edição */}
      {mostrarConfirmacao && (
        <div className="fixed inset-0 z-70 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: CORES.atencaoBg }}>
                <AlertTriangle size={28} style={{ color: CORES.atencao }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: COR_PRIMARIA }}>Editar Reserva?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Você está prestes a editar a reserva <strong>#BPA-{reservaSelecionada?.id}</strong>. Alterações nos dados podem impactar o passeio agendado. Deseja continuar?
              </p>
              <div className="flex gap-3">
                <button onClick={confirmarEditar}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                  style={{ background: CORES.atencao }}>
                  Sim, editar
                </button>
                <button onClick={() => setMostrarConfirmacao(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar reserva */}
      {mostrarEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Pencil size={18} style={{ color: CORES.info }} />
                <h3 className="font-bold text-lg" style={{ color: COR_PRIMARIA, fontFamily: 'Montserrat, sans-serif' }}>
                  Editar Reserva #BPA-{reservaSelecionada?.id}
                </h3>
              </div>
              <button onClick={() => setMostrarEditar(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <FormReserva
                formData={formEditar}
                setFormData={setFormEditar}
                data={dataEditar}
                setData={setDataEditar}
                horario={horarioEditar}
                setHorario={setHorarioEditar}
                onSubmit={handleEditar}
                onCancel={() => setMostrarEditar(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal nova reserva */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} style={{ color: COR_SECUNDARIA }} />
                <h3 className="font-bold text-lg" style={{ color: COR_PRIMARIA, fontFamily: 'Montserrat, sans-serif' }}>
                  Nova Reserva
                </h3>
              </div>
              <button onClick={() => { setMostrarModal(false); setErroForm('') }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <FormReserva
                formData={form}
                setFormData={setForm}
                data={dataReserva}
                setData={setDataReserva}
                horario={horarioReserva}
                setHorario={setHorarioReserva}
                onSubmit={handleSubmit}
                onCancel={() => { setMostrarModal(false); setErroForm('') }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal novo cliente */}
      {modalCliente && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-abrircenter justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-base" style={{ color: COR_PRIMARIA }}>Novo Cliente</h3>
              <button onClick={() => setModalCliente(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={salvarCliente} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600">Nome</label>
                  <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                    placeholder="Nome completo" value={formCliente.nome}
                    onChange={e => setFormCliente({ ...formCliente, nome: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600">Telefone</label>
                  <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                    placeholder="(75) 99999-9999" value={formCliente.telefone}
                    onChange={e => setFormCliente({ ...formCliente, telefone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600">Email</label>
                  <input type="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                    placeholder="email@exemplo.com" value={formCliente.email}
                    onChange={e => setFormCliente({ ...formCliente, email: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                    style={{ background: CORES.sucesso, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button type="button" onClick={() => setModalCliente(false)}
                    className="flex-1 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </LocalizationProvider>
  )
}