import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function NovaReserva() {
  const [clientes, setClientes] = useState([])
  const [passeios, setPasseios] = useState([])
  const [guias, setGuias] = useState([])
  const [form, setForm] = useState({
    cliente: '', passeio: '', guia_responsavel: '',
    data_reserva: '', horario_reserva: '', quantidade_turistas: 1, observacoes: ''
  })
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/clientes/').then(res => setClientes(res.data))
    api.get('/passeios/').then(res => setPasseios(res.data))
    api.get('/usuarios/').then(res => setGuias(res.data.filter(u => u.perfil === 'guia' || u.perfil === 'admin')))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      await api.post('/reservas/', form)
      navigate('/reservas')
    } catch (err) {
      const msg = err.response?.data
      setErro(typeof msg === 'object' ? JSON.stringify(msg) : 'Erro ao cadastrar reserva.')
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Nova Reserva</h2>

      {erro && <p style={styles.erro}>{erro}</p>}

      <div style={styles.formBox}>
        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Cliente</label>
              <select style={styles.input} value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} required>
                <option value="">Selecione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Passeio</label>
              <select style={styles.input} value={form.passeio} onChange={e => setForm({ ...form, passeio: e.target.value })} required>
                <option value="">Selecione...</option>
                {passeios.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Guia Responsável</label>
              <select style={styles.input} value={form.guia_responsavel} onChange={e => setForm({ ...form, guia_responsavel: e.target.value })} required>
                <option value="">Selecione...</option>
                {guias.map(g => <option key={g.id} value={g.id}>{g.first_name} {g.last_name} ({g.username})</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Data da Reserva</label>
              <input style={styles.input} type="date" value={form.data_reserva} onChange={e => setForm({ ...form, data_reserva: e.target.value })} required />
            </div>
            <div>
              <label style={styles.label}>Horário</label>
              <input style={styles.input} type="time" value={form.horario_reserva} onChange={e => setForm({ ...form, horario_reserva: e.target.value })} required />
            </div>
            <div>
              <label style={styles.label}>Quantidade de Turistas</label>
              <input style={styles.input} type="number" min="1" value={form.quantidade_turistas} onChange={e => setForm({ ...form, quantidade_turistas: e.target.value })} required />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={styles.label}>Observações</label>
            <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }} value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem' }}>
            <button style={styles.botaoSalvar} type="submit">Salvar Reserva</button>
            <button style={styles.botaoCancelar} type="button" onClick={() => navigate('/reservas')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  titulo: { color: '#000441', fontFamily: 'Montserrat, sans-serif', fontSize: '22px', marginBottom: '1.5rem' },
  erro: { color: '#a32d2d', background: '#fcebeb', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  formBox: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '10px', padding: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { display: 'block', color: '#454652', fontSize: '13px', marginBottom: '4px', fontWeight: '500' },
  input: { width: '100%', padding: '10px', border: '1px solid #c6c5d4', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  botaoSalvar: { background: '#a53c00', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  botaoCancelar: { background: '#fff', color: '#454652', border: '1px solid #c6c5d4', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
}