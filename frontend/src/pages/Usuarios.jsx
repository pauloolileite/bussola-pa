import { useEffect, useState } from 'react'
import api from '../api'

const PERFIL_CORES = {
  admin: { bg: '#e6eff8', cor: '#000441' },
  guia: { bg: '#eaf3de', cor: '#3b6d11' },
  parceiro: { bg: '#faeeda', cor: '#854f0b' },
  cliente: { bg: '#f1efe8', cor: '#5f5e5a' },
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '', email: '', password: '', perfil: 'guia', telefone: '' })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    api.get('/usuarios/').then(res => setUsuarios(res.data))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      const res = await api.post('/usuarios/', form)
      setUsuarios(prev => [...prev, res.data])
      setForm({ username: '', first_name: '', last_name: '', email: '', password: '', perfil: 'guia', telefone: '' })
      setMostrarForm(false)
      setSucesso('Usuário criado com sucesso.')
    } catch (err) {
      setErro('Não foi possível criar o usuário.')
    }
  }

  async function toggleStatus(id, statusAtual) {
    try {
      const res = await api.patch(`/usuarios/${id}/`, { status: !statusAtual })
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: res.data.status } : u))
    } catch {
      setErro('Não foi possível atualizar o status.')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.titulo}>Gestão de Usuários</h2>
        <button style={styles.botaoNovo} onClick={() => setMostrarForm(!mostrarForm)}>+ Novo Usuário</button>
      </div>

      {sucesso && <p style={styles.sucesso}>{sucesso}</p>}
      {erro && <p style={styles.erro}>{erro}</p>}

      {mostrarForm && (
        <div style={styles.formBox}>
          <h3 style={styles.formTitulo}>Novo Usuário</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <input style={styles.input} placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              <input style={styles.input} placeholder="Nome" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              <input style={styles.input} placeholder="Sobrenome" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              <input style={styles.input} placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input style={styles.input} placeholder="Senha" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <input style={styles.input} placeholder="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
              <select style={styles.input} value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })}>
                <option value="admin">Administrador</option>
                <option value="guia">Guia de Turismo</option>
                <option value="parceiro">Parceiro Operacional</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button style={styles.botaoSalvar} type="submit">Salvar</button>
              <button style={styles.botaoCancelar} type="button" onClick={() => setMostrarForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.tabelaBox}>
        <table style={styles.tabela}>
          <thead>
            <tr>
              {['Nome', 'E-mail', 'Telefone', 'Perfil', 'Status', 'Ações'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{u.first_name} {u.last_name}</strong>
                  <br /><span style={{ color: '#767683', fontSize: '12px' }}>@{u.username}</span>
                </td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.telefone || '—'}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: PERFIL_CORES[u.perfil]?.bg, color: PERFIL_CORES[u.perfil]?.cor }}>
                    {u.perfil}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ color: u.status ? '#3b6d11' : '#a32d2d', fontWeight: '500', fontSize: '13px' }}>
                    {u.status ? '● Ativo' : '● Inativo'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button style={styles.botaoAcao} onClick={() => toggleStatus(u.id, u.status)}>
                    {u.status ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#767683' }}>Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  titulo: { color: '#000441', fontFamily: 'Montserrat, sans-serif', fontSize: '22px' },
  botaoNovo: { background: '#a53c00', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  sucesso: { color: '#3b6d11', background: '#eaf3de', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  erro: { color: '#a32d2d', background: '#fcebeb', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  formBox: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' },
  formTitulo: { color: '#000441', marginBottom: '1rem', fontSize: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: { width: '100%', padding: '10px', border: '1px solid #c6c5d4', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  botaoSalvar: { background: '#a53c00', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  botaoCancelar: { background: '#fff', color: '#454652', border: '1px solid #c6c5d4', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  tabelaBox: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '10px', overflow: 'hidden' },
  tabela: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f6faff', color: '#000441', padding: '10px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #e0e9f2' },
  tr: { borderBottom: '1px solid #f0f4f8' },
  td: { padding: '12px 14px', fontSize: '14px', color: '#141d23' },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' },
  botaoAcao: { background: 'transparent', color: '#000441', border: '1px solid #c6c5d4', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
}