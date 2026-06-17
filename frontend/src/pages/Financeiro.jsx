import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Clock, Download } from 'lucide-react'
import api from '../api'

const STATUS_CORES = {
  pendente: 'bg-orange-100 text-orange-800',
  pago: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default function Financeiro() {
  const [registros, setRegistros] = useState([])
  const [totais, setTotais] = useState({ total: 0, guia: 0, pendente: 0 })

  useEffect(() => {
    api.get('/financeiro/').then(res => {
      const dados = res.data
      setRegistros(dados)
      const total = dados.reduce((acc, f) => acc + parseFloat(f.valor_total || 0), 0)
      const guia = dados.reduce((acc, f) => acc + parseFloat(f.valor_guia || 0), 0)
      const pendente = dados.filter(f => f.status_pagamento === 'pendente').length
      setTotais({ total, guia, pendente })
    })
  }, [])

  const cards = [
    { label: 'Total em Passeios', valor: `R$ ${totais.total.toFixed(2)}`, icone: DollarSign, cor: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Sua Comissão', valor: `R$ ${totais.guia.toFixed(2)}`, icone: TrendingUp, cor: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pagamentos Pendentes', valor: totais.pendente, icone: Clock, cor: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-1" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
        Meu Financeiro
      </h2>
      <p className="text-sm text-gray-500 mb-8">Acompanhe seus ganhos e comissões</p>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, valor, icone: Icone, cor, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icone size={18} className={cor} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
              {valor}
            </p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-base" style={{ color: '#000441' }}>Histórico de Ganhos</h3>
          {/*<button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer active:scale-95">
            <Download size={14} />
            Exportar
          </button>*/}
        </div>
        {/* MOBILE: cartões */}
        <div className="md:hidden p-4 space-y-3">
          {registros.map(f => (
            <div key={f.id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: '#000441' }}>#TR-{f.reserva}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CORES[f.status_pagamento]}`}>
                  {f.status_pagamento.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-2"><span className="text-gray-400">Total do Passeio</span><span className="text-gray-700">R$ {parseFloat(f.valor_total).toFixed(2)}</span></div>
                <div className="flex justify-between gap-2"><span className="text-gray-400">Sua Comissão</span><span className="font-semibold" style={{ color: '#000441' }}>R$ {parseFloat(f.valor_guia).toFixed(2)}</span></div>
              </div>
            </div>
          ))}
          {registros.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">Nenhum registro financeiro.</p>
          )}
        </div>

        {/* DESKTOP: tabela */}
        <div className="hidden md:block overflow-x-auto">
<table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Reserva</th>
              <th className="px-6 py-3 text-left">Total do Passeio</th>
              <th className="px-6 py-3 text-left">Sua Comissão</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {registros.map(f => (
              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold" style={{ color: '#000441' }}>#TR-{f.reserva}</td>
                <td className="px-6 py-4 text-sm text-gray-700">R$ {parseFloat(f.valor_total).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm font-semibold" style={{ color: '#000441' }}>
                  R$ {parseFloat(f.valor_guia).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CORES[f.status_pagamento]}`}>
                    {f.status_pagamento.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-xs font-medium underline cursor-pointer hover:opacity-70 transition-opacity" style={{ color: '#ffffffff' }}>
                    Ver Recibo
                  </button>
                </td>
              </tr>
            ))}
            {registros.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                  Nenhum registro financeiro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
</div>
      </div>
    </div>
  )
}