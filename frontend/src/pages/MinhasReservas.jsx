import { useEffect, useState } from 'react'
import { CalendarCheck, Compass } from 'lucide-react'
import { COR_PRIMARIA, COR_SECUNDARIA } from '../utils/muiTheme'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const STATUS_CORES = {
  solicitada: 'bg-blue-100 text-blue-800',
  confirmada: 'bg-green-100 text-green-800',
  em_andamento: 'bg-orange-100 text-orange-800',
  concluida: 'bg-teal-100 text-teal-800',
  cancelada: 'bg-red-100 text-red-800',
}

const STATUS_LABEL = {
  solicitada: 'Solicitada',
  confirmada: 'Confirmada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

export default function MinhasReservas() {
  const [reservas, setReservas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/reservas/')
      .then(res => setReservas(res.data))
      .catch(() => setErro('Não foi possível carregar suas reservas.'))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck size={22} style={{ color: COR_PRIMARIA }} />
            <h2 className="text-2xl font-bold" style={{ color: COR_PRIMARIA, fontFamily: 'Montserrat, sans-serif' }}>
              Minhas Reservas
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">{reservas.length} solicitação(ões)</p>
        </div>
        <button onClick={() => navigate('/passeios')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold active:scale-95 hover:opacity-90 cursor-pointer"
          style={{ background: COR_SECUNDARIA }}>
          <Compass size={16} /> Solicitar Passeio
        </button>
      </div>

      {erro && <p className="text-sm px-3 py-2 rounded-lg mb-4 bg-red-50 text-red-700">{erro}</p>}

      {carregando ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : reservas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Compass size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-4">Você ainda não tem reservas.</p>
          <button onClick={() => navigate('/passeios')}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold active:scale-95 hover:opacity-90 cursor-pointer"
            style={{ background: COR_SECUNDARIA }}>
            Ver passeios disponíveis
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reservas.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="text-sm font-bold" style={{ color: COR_PRIMARIA }}>#BPA-{r.id}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CORES[r.status]}`}>
                  {STATUS_LABEL[r.status] || r.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <div className="flex justify-between gap-2"><span className="text-gray-400">Passeio</span><span className="text-gray-700 truncate text-right">{r.passeio_nome || r.passeio}</span></div>
                <div className="flex justify-between gap-2"><span className="text-gray-400">Data</span><span className="text-gray-700">{r.data_reserva}</span></div>
                <div className="flex justify-between gap-2"><span className="text-gray-400">Horário</span><span className="text-gray-700">{r.horario_reserva}</span></div>
                <div className="flex justify-between gap-2"><span className="text-gray-400">Turistas</span><span className="text-gray-700">{r.quantidade_turistas}</span></div>
                <div className="flex justify-between gap-2"><span className="text-gray-400">Guia</span><span className="text-gray-700 truncate text-right">{r.guia_nome || 'Aguardando confirmação'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
