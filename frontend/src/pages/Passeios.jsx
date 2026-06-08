import { useEffect, useState } from 'react'
import api from '../api'

export default function Passeios() {
  const [passeios, setPasseios] = useState([])
  const [categoria, setCategoria] = useState('')

  useEffect(() => {
    api.get('/passeios/', { params: categoria ? { categoria } : {} })
      .then(res => setPasseios(res.data))
  }, [categoria])

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Passeios Disponíveis</h2>

      <select style={styles.filtro} onChange={e => setCategoria(e.target.value)}>
        <option value="">Todas as categorias</option>
        <option value="catamara">Catamarã</option>
        <option value="lancha">Lancha</option>
        <option value="voadeira">Voadeira</option>
        <option value="ecoturismo">Ecoturismo</option>
        <option value="aventura">Aventura</option>
      </select>

      <div style={styles.grid}>
        {passeios.map(p => (
          <div key={p.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.categoria}>{p.categoria}</span>
              <span style={p.tipo_valor === 'fixo' ? styles.precoFixo : styles.precoConsultar}>
                {p.tipo_valor === 'fixo' ? `R$ ${p.valor}` : 'A Consultar'}
              </span>
            </div>
            <h3 style={styles.nome}>{p.nome}</h3>
            <p style={styles.descricao}>{p.descricao}</p>
            {p.ponto_turistico_nome && (
              <p style={styles.ponto}>📍 {p.ponto_turistico_nome}</p>
            )}
          </div>
        ))}
        {passeios.length === 0 && (
          <p style={styles.vazio}>Nenhum passeio encontrado.</p>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  titulo: { color: '#000441', fontFamily: 'Montserrat, sans-serif', marginBottom: '1rem' },
  filtro: { padding: '8px 12px', borderRadius: '4px', border: '1px solid #c6c5d4', marginBottom: '1.5rem', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  card: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '8px', padding: '1.25rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  categoria: { fontSize: '12px', background: '#e6eff8', color: '#000441', padding: '2px 8px', borderRadius: '999px' },
  precoFixo: { fontSize: '13px', background: '#eaf3de', color: '#3b6d11', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' },
  precoConsultar: { fontSize: '13px', background: '#f1efe8', color: '#5f5e5a', padding: '2px 8px', borderRadius: '4px' },
  nome: { color: '#141d23', fontSize: '16px', margin: '8px 0 4px' },
  descricao: { color: '#454652', fontSize: '14px', lineHeight: '1.5' },
  ponto: { color: '#454652', fontSize: '13px', marginTop: '8px' },
  vazio: { color: '#767683', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' },
}