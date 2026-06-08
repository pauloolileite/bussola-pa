import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, ArrowLeft } from 'lucide-react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import 'dayjs/locale/pt-br'
import api from '../api'

const COR_PRIMARIA = '#000441'
const COR_SECUNDARIA = '#a53c00'

const dialogSx = {
  '& .MuiPickersToolbar-root': {
    background: COR_PRIMARIA,
    color: '#fff',
  },
  '& .MuiPickersToolbar-title': { color: '#fff' },
  '& .MuiTypography-overline': { color: 'rgba(255,255,255,0.7)' },
  '& .MuiPickersToolbar-content .MuiTypography-root': { color: '#fff' },
  '& .MuiDatePickerToolbar-title': { color: '#fff' },
  '& .MuiTimePickerToolbar-ampmSelection .MuiTimePickerToolbar-ampmLabel': { color: '#fff' },
  '& .Mui-selected.MuiTypography-root': { color: '#fff' },
  // Relógio
  '& .MuiClock-pin': { background: COR_SECUNDARIA },
  '& .MuiClockPointer-root': { background: COR_SECUNDARIA },
  '& .MuiClockPointer-thumb': { background: COR_SECUNDARIA, borderColor: COR_SECUNDARIA },
  '& .MuiClockNumber-root.Mui-selected': { background: COR_SECUNDARIA },
  // Calendário
  '& .MuiPickersDay-root.Mui-selected': { background: COR_SECUNDARIA, '&:hover': { background: COR_SECUNDARIA } },
  '& .MuiPickersDay-root:not(.Mui-selected)': { '&:hover': { background: 'rgba(165,60,0,0.1)' } },
  '& .MuiPickersYear-yearButton.Mui-selected': { background: COR_SECUNDARIA },
  '& .MuiPickersMonth-monthButton.Mui-selected': { background: COR_SECUNDARIA },
  // Botões
  '& .MuiButton-root': { color: COR_SECUNDARIA, fontWeight: '600' },
  '& .MuiTabs-indicator': { background: COR_SECUNDARIA },
  // Seleção de hora digital
  '& .MuiMultiSectionDigitalClockSection-item.Mui-selected': {
    background: COR_SECUNDARIA,
    color: '#fff',
    borderRadius: '8px',
  },
}

const inputSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    '& fieldset': { borderColor: '#e5e7eb' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#60a5fa', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { display: 'none' },
  '& .MuiInputBase-input': { padding: '12px 16px', cursor: 'pointer' },
}

export default function NovaReserva() {
  const [clientes, setClientes] = useState([])
  const [passeios, setPasseios] = useState([])
  const [guias, setGuias] = useState([])
  const [form, setForm] = useState({
    cliente: '', passeio: '', guia_responsavel: '',
    quantidade_turistas: 1, observacoes: ''
  })
  const [dataReserva, setDataReserva] = useState(null)
  const [horarioReserva, setHorarioReserva] = useState(null)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/clientes/').then(res => setClientes(res.data))
    api.get('/passeios/').then(res => setPasseios(res.data))
    api.get('/usuarios/').then(res => setGuias(res.data.filter(u => ['guia', 'admin'].includes(u.perfil))))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!dataReserva || !horarioReserva) {
      setErro('Preencha a data e o horário da reserva.')
      return
    }
    setLoading(true)
    try {
      const data_reserva = dataReserva.format('YYYY-MM-DD')
      const horario_reserva = horarioReserva.format('HH:mm:ss')
      await api.post('/reservas/', { ...form, data_reserva, horario_reserva })
      navigate('/reservas')
    } catch (err) {
      const msg = err.response?.data
      setErro(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Erro ao cadastrar reserva.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/reservas')}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
              Nova Reserva
            </h2>
            <p className="text-sm text-gray-500">Preencha os dados para criar uma reserva</p>
          </div>
        </div>

        {erro && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{erro}</p>}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
            <CalendarCheck size={18} style={{ color: COR_SECUNDARIA }} />
            <h3 className="font-semibold text-base" style={{ color: COR_PRIMARIA }}>Informações da Reserva</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-5 mb-5">

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Cliente</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors cursor-pointer"
                  value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} required>
                  <option value="">Selecione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Passeio</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors cursor-pointer"
                  value={form.passeio} onChange={e => setForm({ ...form, passeio: e.target.value })} required>
                  <option value="">Selecione...</option>
                  {passeios.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Guia Responsável</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors cursor-pointer"
                  value={form.guia_responsavel} onChange={e => setForm({ ...form, guia_responsavel: e.target.value })} required>
                  <option value="">Selecione...</option>
                  {guias.map(g => <option key={g.id} value={g.id}>{g.first_name} {g.last_name} (@{g.username})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Quantidade de Turistas</label>
                <input type="number" min={1}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                  value={form.quantidade_turistas}
                  onChange={e => setForm({ ...form, quantidade_turistas: e.target.value })} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Data da Reserva</label>
                <MobileDatePicker
                  value={dataReserva}
                  onChange={setDataReserva}
                  format="DD/MM/YYYY"
                  disablePast
                  slotProps={{
                    textField: { sx: inputSx, placeholder: 'Selecione a data' },
                    dialog: { sx: dialogSx },
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">Horário</label>
                <MobileTimePicker
                  value={horarioReserva}
                  onChange={setHorarioReserva}
                  ampm={false}
                  views={['hours', 'minutes']}
                  slotProps={{
                    textField: { sx: inputSx, placeholder: 'Selecione o horário' },
                    dialog: { sx: dialogSx },
                  }}
                />
              </div>

            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1.5 text-gray-600">Observações</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors resize-none"
                rows={3}
                placeholder="Informações adicionais sobre a reserva..."
                value={form.observacoes}
                onChange={e => setForm({ ...form, observacoes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                style={{ background: COR_SECUNDARIA, opacity: loading ? 0.7 : 1 }}
              >
                <CalendarCheck size={15} />
                {loading ? 'Salvando...' : 'Salvar Reserva'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/reservas')}
                className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  )
}