import { useEffect, useState } from 'react'
import api from '../api'
import QRCodeReserva from '../components/QRCodeReserva'

const STATUS_CORES = {
  solicitada: { bg: '#e6eff8', cor: '#000441' },
  confirmada: { bg: '#eaf3de', cor: '#3b6d11' },
  em_andamento: { bg: '#faeeda', cor: '#854f0b' },
  concluida: { bg: '#e1f5ee', cor: '#0f6e56' },
  cancelada: { bg: '#fcebeb', cor: '#a32d2d' },
}

const TRANSICOES = {
  solicitada: ['confirmada', 'cancelada'],
  confirmada: ['em_andamento', 'cancelada'],
  em_andamento: ['concluida', 'cancelada'],
  concluida: [],
  cancelada: [],
}

export default function Reservas() {
  const [reservas, setReservas] = useState([])
  const [reservaSelecionada, setReservaSelecionada] = useState(null)
  const [erro, setErro] = useState('')

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
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ ...styles.titulo, marginBottom: 0 }}>Minhas Reservas</h2>
        <a href="/reservas/nova" style={styles.botaoNovo}>+ Nova Reserva</a>
      </div>
      {erro && <p style={styles.erro}>{erro}</p>}

      <div style={styles.layout}>
        <div style={styles.lista}>
          <table style={styles.tabela}>
            <thead>
              <tr>
                {['ID', 'Passeio', 'Data', 'Turistas', 'Status', 'Ações'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => (
                <tr
                  key={r.id}
                  style={{ ...styles.tr, background: reservaSelecionada?.id === r.id ? '#f0f4ff' : '' }}
                  onClick={() => setReservaSelecionada(r)}
                >
                  <td style={styles.td}><strong>#BPA-{r.id}</strong></td>
                  <td style={styles.td}>{r.passeio_nome || r.passeio}</td>
                  <td style={styles.td}>{r.data_reserva}</td>
                  <td style={styles.td}>{r.quantidade_turistas}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: STATUS_CORES[r.status]?.bg, color: STATUS_CORES[r.status]?.cor }}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {TRANSICOES[r.status]?.map(s => (
                      <button key={s} style={styles.botao} onClick={e => { e.stopPropagation(); atualizarStatus(r.id, s) }}>
                        {s}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
              {reservas.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#767683' }}>Nenhuma reserva encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {reservaSelecionada && (
          <div style={styles.detalhe}>
            <h3 style={styles.detalheTitulo}>QR Code da Reserva</h3>
            <p style={styles.detalheId}>#BPA-{reservaSelecionada.id}</p>
            <div style={styles.qrBox}>
              <QRCodeReserva codigo={reservaSelecionada.codigo_qr} tamanho={180} />
            </div>
            <p style={styles.qrInfo}>Apresente este QR code na guarita para validar a entrada do grupo.</p>
            <div style={styles.detalheInfo}>
              <p><strong>Passeio:</strong> {reservaSelecionada.passeio_nome || reservaSelecionada.passeio}</p>
              <p><strong>Data:</strong> {reservaSelecionada.data_reserva}</p>
              <p><strong>Horário:</strong> {reservaSelecionada.horario_reserva}</p>
              <p><strong>Turistas:</strong> {reservaSelecionada.quantidade_turistas}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  titulo: { color: '#000441', fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem' },
  erro: { color: '#a32d2d', background: '#fcebeb', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  layout: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  lista: { flex: 1, background: '#fff', border: '1px solid #e0e9f2', borderRadius: '10px', overflow: 'hidden' },
  tabela: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f6faff', color: '#000441', padding: '10px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #e0e9f2' },
  tr: { borderBottom: '1px solid #f0f4f8', cursor: 'pointer' },
  td: { padding: '10px 14px', fontSize: '13px', color: '#141d23' },
  badge: { padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '500' },
  botao: { marginRight: '4px', padding: '3px 8px', fontSize: '11px', background: '#a53c00', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  detalhe: { width: '240px', background: '#fff', border: '1px solid #e0e9f2', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', flexShrink: 0 },
  detalheTitulo: { color: '#000441', fontSize: '15px', marginBottom: '4px' },
  detalheId: { color: '#767683', fontSize: '13px', marginBottom: '1rem' },
  qrBox: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  qrInfo: { color: '#454652', fontSize: '12px', lineHeight: '1.5', marginBottom: '1rem' },
  detalheInfo: { textAlign: 'left', fontSize: '13px', color: '#454652', lineHeight: '1.8' },
  botaoNovo: { background: '#a53c00', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
}