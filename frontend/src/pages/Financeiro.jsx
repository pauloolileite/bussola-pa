import { useEffect, useState } from 'react'
import api from '../api'

const STATUS_CORES = {
  pendente: { bg: '#faeeda', cor: '#854f0b' },
  pago: { bg: '#eaf3de', cor: '#3b6d11' },
  cancelado: { bg: '#fcebeb', cor: '#a32d2d' },
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

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Meu Financeiro</h2>

      <div style={styles.cards}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Total em Passeios</span>
          <span style={styles.cardValor}>R$ {totais.total.toFixed(2)}</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Sua Comissão</span>
          <span style={styles.cardValor}>R$ {totais.guia.toFixed(2)}</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Pagamentos Pendentes</span>
          <span style={{ ...styles.cardValor, color: '#854f0b' }}>{totais.pendente}</span>
        </div>
      </div>

      <div style={styles.tabelaBox}>
        <h3 style={styles.tabelaTitulo}>Histórico de Ganhos</h3>
        <table style={styles.tabela}>
          <thead>
            <tr>
              {['Reserva', 'Total do Passeio', 'Sua Comissão', 'Status', 'Ação'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registros.map(f => (
              <tr key={f.id} style={styles.tr}>
                <td style={styles.td}><strong>#TR-{f.reserva}</strong></td>
                <td style={styles.td}>R$ {parseFloat(f.valor_total).toFixed(2)}</td>
                <td style={styles.td}><strong>R$ {parseFloat(f.valor_guia).toFixed(2)}</strong></td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: STATUS_CORES[f.status_pagamento]?.bg, color: STATUS_CORES[f.status_pagamento]?.cor }}>
                    {f.status_pagamento.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={styles.link}>Ver Recibo</span>
                </td>
              </tr>
            ))}
            {registros.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#767683' }}>Nenhum registro financeiro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  titulo: { color: '#000441', fontFamily: 'Montserrat, sans-serif', fontSize: '22px', marginBottom: '1.5rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardLabel: { color: '#454652', fontSize: '13px' },
  cardValor: { color: '#000441', fontSize: '26px', fontWeight: '700', fontFamily: 'Montserrat, sans-serif' },
  tabelaBox: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '10px', padding: '1.5rem' },
  tabelaTitulo: { color: '#000441', fontSize: '16px', fontWeight: '600', marginBottom: '1rem' },
  tabela: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f6faff', color: '#000441', padding: '10px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #e0e9f2' },
  tr: { borderBottom: '1px solid #f0f4f8' },
  td: { padding: '12px 14px', fontSize: '14px', color: '#141d23' },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' },
  link: { color: '#000441', cursor: 'pointer', fontWeight: '500', fontSize: '13px', textDecoration: 'underline' },
}