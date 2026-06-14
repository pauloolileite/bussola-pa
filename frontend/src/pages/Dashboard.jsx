import { useEffect, useState } from 'react'
<<<<<<< HEAD
import { CalendarCheck, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react'
import api from '../api'
import { STATUS_CORES } from '../lib/reservaStatus'
=======
import { CalendarCheck, Users, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react'
import api from '../api'

const STATUS_CORES = {
  solicitada: 'bg-blue-100 text-blue-800',
  confirmada: 'bg-green-100 text-green-800',
  em_andamento: 'bg-orange-100 text-orange-800',
  concluida: 'bg-teal-100 text-teal-800',
  cancelada: 'bg-red-100 text-red-800',
}
>>>>>>> 56f09569d6ed5c14d91c4d1c3a27b94043c9c2b0

export default function Dashboard() {
  const [reservas, setReservas] = useState([])
  const [metricas, setMetricas] = useState({ ativas: 0, concluidas: 0, ocorrencias: 0, receita: 0 })

  useEffect(() => {
    api.get('/reservas/').then(res => {
      const todas = res.data
      setReservas(todas.slice(0, 5))
      const ativas = todas.filter(r => ['solicitada', 'confirmada', 'em_andamento'].includes(r.status)).length
      const concluidas = todas.filter(r => r.status === 'concluida').length
      setMetricas(m => ({ ...m, ativas, concluidas }))
    })
    api.get('/ocorrencias/').then(res => {
      const abertas = res.data.filter(o => o.status === 'aberta').length
      setMetricas(m => ({ ...m, ocorrencias: abertas }))
    })
  }, [])

  const cards = [
    { label: 'Reservas Ativas', valor: metricas.ativas, icone: CalendarCheck, cor: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Concluídas', valor: metricas.concluidas, icone: TrendingUp, cor: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ocorrências Abertas', valor: metricas.ocorrencias, icone: AlertTriangle, cor: 'text-red-600', bg: 'bg-red-50', destaque: metricas.ocorrencias > 0 },
    { label: 'Receita do Dia', valor: '—', icone: DollarSign, cor: 'text-teal-600', bg: 'bg-teal-50' },
  ]

  return (
    <div className="pagina max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-1" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
        Painel de Controle
      </h2>
      <p className="text-sm text-gray-500 mb-8">Visão consolidada para administração central - Paulo Afonso, Bahia.</p>

      {/* Cards */}
      <div className="grid-metricas grid-metricas-4 mb-6">
        {cards.map(({ label, valor, icone: Icone, cor, bg, destaque }) => (
          <div
            key={label}
            className={`bg-white rounded-xl p-5 border ${destaque ? 'border-red-400' : 'border-gray-100'} shadow-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icone size={18} className={cor} />
              </div>
              {destaque && (
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">CRÍTICO</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
              {valor}
            </p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden tabela-scroll">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-base" style={{ color: '#000441' }}>Últimas Solicitações de Reservas</h3>
          <a href="/reservas" className="text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ background: '#a53c00' }}>
            Ver Todas
          </a>
        </div>
        <div className="overflow-x-auto"><table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Cliente</th>
              <th className="px-6 py-3 text-left">Passeio</th>
              <th className="px-6 py-3 text-left">Guia</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservas.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold" style={{ color: '#000441' }}>#BPA-{r.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{r.cliente_nome || r.cliente}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{r.passeio_nome || r.passeio}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{r.guia_nome || r.guia_responsavel}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CORES[r.status]}`}>
                    {r.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {reservas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                  Nenhuma reserva cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  )
}