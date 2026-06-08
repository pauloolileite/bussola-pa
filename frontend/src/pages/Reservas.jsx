import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, QrCode, ChevronRight } from 'lucide-react'
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
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/reservas/').then(res => setReservas(res.data))
  }, [])

  async function atualizarStatus(id, novoStatus) {
    try {
      const res = await api.patch(`/reservas/${id}/status/`, { status: novoStatus })
      setReservas(prev => prev.map(r => r.id === id ? res.data : r))
      if (reservaSelecionada?.id === id) setReservaSelecionada(res.data)
    } catch {
      setErro('Não foi possível atualizar o status.')
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
            Minhas Reservas
          </h2>
          <p className="text-sm text-gray-500 mt-1">{reservas.length} reservas encontradas</p>
        </div>
        <button
          onClick={() => navigate('/reservas/nova')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
          style={{ background: '#a53c00' }}
        >
          <Plus size={16} />
          Nova Reserva
        </button>
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{erro}</p>}

      <div className="flex gap-6 items-start">
        {/* Tabela */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
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
                <tr
                  key={r.id}
                  onClick={() => setReservaSelecionada(r)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  style={{ background: reservaSelecionada?.id === r.id ? '#f0f4ff' : '' }}
                >
                  <td className="px-5 py-4 text-sm font-bold" style={{ color: '#000441' }}>#BPA-{r.id}</td>
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
                        <button
                          key={s}
                          onClick={e => { e.stopPropagation(); atualizarStatus(r.id, s) }}
                          className={`text-xs px-2 py-1 rounded font-medium transition-all active:scale-95 hover:opacity-80 cursor-pointer ${s === 'cancelada' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'text-white'}`}
                          style={s !== 'cancelada' ? { background: '#a53c00' } : {}}
                        >
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
          </table>
        </div>

        {/* QR Code panel */}
        {reservaSelecionada && (
          <div className="w-56 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <QrCode size={16} style={{ color: '#000441' }} />
              <h3 className="font-semibold text-sm" style={{ color: '#000441' }}>QR Code</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">#BPA-{reservaSelecionada.id}</p>
            <div className="flex justify-center mb-4">
              <QRCodeReserva codigo={reservaSelecionada.codigo_qr} tamanho={160} />
            </div>
            <p className="text-xs text-gray-500 text-center leading-relaxed mb-4">
              Apresente na guarita para validar a entrada.
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Passeio</span>
                <span className="font-medium">{reservaSelecionada.passeio_nome || reservaSelecionada.passeio}</span>
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}