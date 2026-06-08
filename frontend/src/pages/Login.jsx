import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/', { username, password })
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      navigate('/dashboard')
    } catch {
      setErro('Usuário ou senha inválidos.')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Bússola PA</h1>
        <p style={styles.subtitulo}>Explore o Inexplorado</p>
        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            placeholder="Usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {erro && <p style={styles.erro}>{erro}</p>}
          <button style={styles.botao} type="submit">Entrar</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6faff' },
  card: { background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e0e9f2', width: '100%', maxWidth: '400px' },
  titulo: { color: '#000441', fontFamily: 'Montserrat, sans-serif', fontSize: '28px', marginBottom: '4px', textAlign: 'center' },
  subtitulo: { color: '#454652', fontSize: '14px', textAlign: 'center', marginBottom: '24px' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #c6c5d4', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
  botao: { width: '100%', padding: '12px', background: '#a53c00', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' },
  erro: { color: '#ba1a1a', fontSize: '13px', marginBottom: '8px' },
}