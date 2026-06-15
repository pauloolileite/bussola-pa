import { useEffect, useState } from 'react'
import { BarChart2, Download, CalendarCheck, DollarSign, TrendingUp, Filter } from 'lucide-react'
import { COR_PRIMARIA, COR_SECUNDARIA } from '../utils/muiTheme'
import api from '../api'

const STATUS_LABEL = {
  solicitada: 'Solicitadas',
  confirmada: 'Confirmadas',
  em_andamento: 'Em andamento',
  concluida: 'Concluídas',
  cancelada: 'Canceladas',
}

const STATUS_CORES = {
  solicitada: 'bg-blue-100 text-blue-800',
  confirmada: 'bg-green-100 text-green-800',
  em_andamento: 'bg-orange-100 text-orange-800',
  concluida: 'bg-teal-100 text-teal-800',
  cancelada: 'bg-red-100 text-red-800',
}

export default function Relatorios() {
  const [dados, setDados] = useState(null)
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  function carregar() {
    setLoading(true)
    setErro('')
    const params = {}
    if (inicio) params.inicio = inicio
    if (fim) params.fim = fim
    api.get('/reservas/relatorio/', { params })
      .then(res => setDados(res.data))
      .catch(() => setErro('Não foi possível carregar o relatório.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  function exportarCSV() {
    if (!dados) return
    const linhas = []
    linhas.push(['Relatório Gerencial - Bússola PA'])
    if (inicio || fim) {
      linhas.push([`Período: ${inicio || 'início'} até ${fim || 'hoje'}`])
    }
    linhas.push([])
    linhas.push(['Indicador', 'Valor'])
    linhas.push(['Total de reservas', dados.total_reservas])
    linhas.push(['Receita total (R$)', dados.receita_total.toFixed(2)])
    linhas.push(['Ticket médio (R$)', dados.ticket_medio.toFixed(2)])
    linhas.push([])
    linhas.push(['Reservas por status', ''])
    Object.entries(dados.por_status).forEach(([status, qtd]) => {
      linhas.push([STATUS_LABEL[status] || status, qtd])
    })
    linhas.push([])
    linhas.push(['Passeios mais reservados', 'Quantidade'])
    dados.top_passeios.forEach(p => linhas.push([p.passeio, p.quantidade]))

    // Monta o CSV. ; como separador e BOM para o Excel ler acentos.
    const csv = linhas.map(l => l.map(c => `"${String(c ?? '')}"`).join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-bussola-pa-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cards = dados ? [
    { label: 'Total de Reservas', valor: dados.total_reservas, icone: CalendarCheck, cor: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Receita Total', valor: `R$ ${dados.receita_total.toFixed(2)}`, icone: DollarSign, cor: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Ticket Médio', valor: `R$ ${dados.ticket_medio.toFixed(2)}`, icone: TrendingUp, cor: 'text-green-600', bg: 'bg-green-50' },
  ] : []

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 size={22} style={{ color: COR_PRIMARIA }} />
            <h2 className="text-2xl font-bold" style={{ color: COR_PRIMARIA, fontFamily: 'Montserrat, sans-serif' }}>
              Relatórios Gerenciais
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Indicadores das atividades turísticas</p>
        </div>
        <button onClick={exportarCSV} disabled={!dados}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
          style={{ background: COR_SECUNDARIA, opacity: dados ? 1 : 0.5 }}>
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Filtro por período */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">Data início</label>
            <input type="date" value={inicio} onChange={e => setInicio(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">Data fim</label>
            <input type="date" value={fim} onChange={e => setFim(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
          </div>
          <button onClick={carregar}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all active:scale-95 hover:opacity-90 cursor-pointer"
            style={{ background: COR_PRIMARIA }}>
            <Filter size={14} /> Aplicar
          </button>
          {(inicio || fim) && (
            <button onClick={() => { setInicio(''); setFim(''); setTimeout(carregar, 0) }}
              className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer">
              Limpar
            </button>
          )}
        </div>
      </div>

      {erro && (
        <p className="text-sm px-3 py-2 rounded-lg mb-4 bg-red-50 text-red-700">{erro}</p>
      )}

      {loading && <p className="text-sm text-gray-400">Carregando...</p>}

      {dados && !loading && (
        <>
          {/* Cards de indicadores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {cards.map(({ label, valor, icone: Icone, cor, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icone size={18} className={cor} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold" style={{ color: COR_PRIMARIA, fontFamily: 'Montserrat, sans-serif' }}>
                  {valor}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reservas por status */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-base" style={{ color: COR_PRIMARIA }}>Reservas por Status</h3>
              </div>
              <div className="p-5 space-y-3">
                {Object.keys(STATUS_LABEL).map(status => {
                  const qtd = dados.por_status[status] || 0
                  const pct = dados.total_reservas ? (qtd / dados.total_reservas) * 100 : 0
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CORES[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                        <span className="text-sm font-bold text-gray-700">{qtd}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COR_SECUNDARIA }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top passeios */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-base" style={{ color: COR_PRIMARIA }}>Passeios Mais Reservados</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Passeio</th>
                    <th className="px-6 py-3 text-right">Reservas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dados.top_passeios.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-700">{p.passeio}</td>
                      <td className="px-6 py-3 text-sm font-bold text-right" style={{ color: COR_PRIMARIA }}>{p.quantidade}</td>
                    </tr>
                  ))}
                  {dados.top_passeios.length === 0 && (
                    <tr><td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-400">Sem dados no período.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
