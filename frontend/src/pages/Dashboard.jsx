import { useEffect, useState } from 'react'
import api from '../api'

const STATUS_CORES = {
  solicitada: { bg: '#e6eff8', cor: '#000441' },
  confirmada: { bg: '#eaf3de', cor: '#3b6d11' },
  em_andamento: { bg: '#faeeda', cor: '#854f0b' },
  concluida: { bg: '#e1f5ee', cor: '#0f6e56' },
  cancelada: { bg: '#fcebeb', cor: '#a32d2d' },
}

export default function Dashboard() {
  const [reservas, setReservas] = useState([])
  const [metricas, setMetricas] = useState({ ativas: 0, guias: 0, ocorrencias: 0, receita: 0 })

  useEffect(() => {
    api.get('/reservas/').then(res => {
      const todas = res.data
      setReservas(todas.slice(0, 5))
      const ativas = todas.filter(r => ['solicitada', 'confirmada', 'em_andamento'].includes(r.status)).length
      setMetricas(m => ({ ...m, ativas }))
    })
  }, [])

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Painel de Controle</h2>
      <p style={styles.subtitulo}>Visão consolidada para administração central - Paulo Afonso, Bahia.</p>

      <div style={styles.cards}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Reservas Ativas</span>
          <span style={styles.cardValor}>{metricas.ativas}</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Guias em Campo</span>
          <span style={styles.cardValor}>—</span>
        </div>
        <div style={{ ...styles.card, border: '1.5px solid #a53c00' }}>
          <span style={styles.cardLabel}>Ocorrências Abertas</span>
          <span style={{ ...styles.cardValor, color: '#a53c00' }}>—</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Receita do Dia</span>
          <span style={styles.cardValor}>—</span>
        </div>
      </div>

      <div style={styles.tabelaBox}>
        <div style={styles.tabelaHeader}>
          <h3 style={styles.tabelaTitulo}>Últimas Solicitações de Reservas</h3>
        </div>
        <table style={styles.tabela}>
          <thead>
            <tr>
              {['ID', 'Cliente', 'Passeio', 'Guia Responsável', 'Status'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r.id} style={styles.tr}>
                <td style={styles.td}><strong>#BPA-{r.id}</strong></td>
                <td style={styles.td}>{r.cliente}</td>
                <td style={styles.td}>{r.passeio}</td>
                <td style={styles.td}>{r.guia_responsavel}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: STATUS_CORES[r.status]?.bg, color: STATUS_CORES[r.status]?.cor }}>
                    {r.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {reservas.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#767683' }}>Nenhuma reserva cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  titulo: { color: '#000441', fontFamily: 'Montserrat, sans-serif', fontSize: '24px', marginBottom: '4px' },
  subtitulo: { color: '#454652', fontSize: '14px', marginBottom: '2rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardLabel: { color: '#454652', fontSize: '13px' },
  cardValor: { color: '#000441', fontSize: '28px', fontWeight: '700', fontFamily: 'Montserrat, sans-serif' },
  tabelaBox: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '10px', padding: '1.5rem' },
  tabelaHeader: { marginBottom: '1rem' },
  tabelaTitulo: { color: '#000441', fontSize: '16px', fontWeight: '600' },
  tabela: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f6faff', color: '#000441', padding: '10px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #e0e9f2' },
  tr: { borderBottom: '1px solid #f0f4f8' },
  td: { padding: '12px 14px', fontSize: '14px', color: '#141d23' },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' },
}