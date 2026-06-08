import { useEffect, useState } from 'react'
import api from '../api'

const STATUS_CORES = {
  aberta: { bg: '#fcebeb', cor: '#a32d2d' },
  em_analise: { bg: '#faeeda', cor: '#854f0b' },
  resolvida: { bg: '#eaf3de', cor: '#3b6d11' },
}

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([])
  const [form, setForm] = useState({ reserva: '', descricao: '' })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    api.get('/ocorrencias/').then(res => setOcorrencias(res.data))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      const res = await api.post('/ocorrencias/', form)
      setOcorrencias(prev => [res.data, ...prev])
      setForm({ reserva: '', descricao: '' })
      setMostrarForm(false)
      setSucesso('Ocorrência registrada com sucesso.')
    } catch {
      setErro('Não foi possível registrar a ocorrência.')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.titulo}>Ocorrências</h2>
        <button style={styles.botaoNovo} onClick={() => setMostrarForm(!mostrarForm)}>
          + Registrar Ocorrência
        </button>
      </div>

      {sucesso && <p style={styles.sucesso}>{sucesso}</p>}
      {erro && <p style={styles.erro}>{erro}</p>}

      {mostrarForm && (
        <div style={styles.formBox}>
          <h3 style={styles.formTitulo}>Nova Ocorrência</h3>
          <form onSubmit={handleSubmit}>
            <input
              style={styles.input}
              placeholder="ID da Reserva"
              value={form.reserva}
              onChange={e => setForm({ ...form, reserva: e.target.value })}
              required
            />
            <textarea
              style={{ ...styles.input, height: '100px', resize: 'vertical' }}
              placeholder="Descreva a ocorrência..."
              value={form.descricao}
              onChange={e => setForm({ ...form, descricao: e.target.value })}
              required
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={styles.botaoSalvar} type="submit">Salvar</button>
              <button style={styles.botaoCancelar} type="button" onClick={() => setMostrarForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.lista}>
        {ocorrencias.map(o => (
          <div key={o.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardId}>Ocorrência #{o.id} — Reserva #{o.reserva}</span>
              <span style={{ ...styles.badge, background: STATUS_CORES[o.status]?.bg, color: STATUS_CORES[o.status]?.cor }}>
                {o.status.replace('_', ' ')}
              </span>
            </div>
            <p style={styles.descricao}>{o.descricao}</p>
            <span style={styles.data}>{new Date(o.data_ocorrencia).toLocaleString('pt-BR')}</span>
          </div>
        ))}
        {ocorrencias.length === 0 && (
          <p style={styles.vazio}>Nenhuma ocorrência registrada.</p>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  titulo: { color: '#000441', fontFamily: 'Montserrat, sans-serif', fontSize: '22px' },
  botaoNovo: { background: '#a53c00', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  sucesso: { color: '#3b6d11', background: '#eaf3de', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  erro: { color: '#a32d2d', background: '#fcebeb', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  formBox: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' },
  formTitulo: { color: '#000441', marginBottom: '1rem', fontSize: '16px' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #c6c5d4', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  botaoSalvar: { background: '#a53c00', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  botaoCancelar: { background: '#fff', color: '#454652', border: '1px solid #c6c5d4', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  lista: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '8px', padding: '1.25rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardId: { color: '#000441', fontWeight: '600', fontSize: '14px' },
  badge: { padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' },
  descricao: { color: '#454652', fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' },
  data: { color: '#767683', fontSize: '12px' },
  vazio: { color: '#767683', textAlign: 'center', padding: '2rem' },
}