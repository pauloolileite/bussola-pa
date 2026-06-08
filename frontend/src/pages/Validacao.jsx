import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../api'

export default function Validacao() {
  const [codigo, setCodigo] = useState('')
  const [reserva, setReserva] = useState(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)
  const [cameras, setCameras] = useState([])
  const [escaneando, setEscaneando] = useState(false)
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => setCameras(devices)).catch(() => {})
    return () => pararScanner()
  }, [])

  async function iniciarScanner() {
    if (!cameras.length) { setErro('Nenhuma câmera encontrada.'); return }
    const html5Qr = new Html5Qrcode('qr-reader')
    html5QrRef.current = html5Qr
    setEscaneando(true)
    setErro('')
    await html5Qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (texto) => {
        await pararScanner()
        setCodigo(texto)
        await buscarPorCodigo(texto)
      },
      () => {}
    )
  }

  async function pararScanner() {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop() } catch {}
      html5QrRef.current = null
    }
    setEscaneando(false)
  }

  async function buscarPorCodigo(cod) {
    setErro('')
    setReserva(null)
    setSucesso('')
    try {
      const res = await api.get(`/reservas/qr/${cod}/`)
      setReserva(res.data)
    } catch {
      setErro('Reserva não encontrada.')
    }
  }

  async function handleBuscarManual(e) {
    e.preventDefault()
    await buscarPorCodigo(codigo)
  }

  async function validarEntrada() {
    if (!reserva) return
    if (!['solicitada', 'confirmada'].includes(reserva.status)) {
      setErro('Reserva não está apta para validação.')
      return
    }
    setLoading(true)
    try {
      await api.patch(`/reservas/validar/${reserva.codigo_qr}/`, {})
      setSucesso('Entrada validada com sucesso!')
      setReserva({ ...reserva, status: 'em_andamento' })
    } catch {
      setErro('Não foi possível registrar a validação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Validação de Passeio</h2>
      <p style={styles.subtitulo}>Escaneie o QR code ou insira o código da reserva manualmente</p>

      <div style={styles.scanBox}>
        {!escaneando ? (
          <button style={styles.botaoScan} onClick={iniciarScanner}>
            📷 Escanear QR Code
          </button>
        ) : (
          <button style={styles.botaoParar} onClick={pararScanner}>
            ✕ Parar Scanner
          </button>
        )}
        <div id="qr-reader" ref={scannerRef} style={{ width: '100%', marginTop: escaneando ? '1rem' : '0' }} />
      </div>

      <div style={styles.separador}><span style={styles.separadorTexto}>ou informe manualmente</span></div>

      <form onSubmit={handleBuscarManual} style={styles.formBusca}>
        <input
          style={styles.inputBusca}
          placeholder="Cole o código UUID da reserva..."
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          required
        />
        <button style={styles.botaoBuscar} type="submit">Buscar</button>
      </form>

      {erro && <p style={styles.erro}>⚠ {erro}</p>}
      {sucesso && <p style={styles.sucesso}>✓ {sucesso}</p>}

      {reserva && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.reservaAtiva}>● RESERVA {reserva.status.toUpperCase()}</span>
            <span style={styles.reservaId}>#BPA-{reserva.id}</span>
          </div>
          <div style={styles.infoGrid}>
            <div>
              <span style={styles.label}>GUIA RESPONSÁVEL</span>
              <p style={styles.valor}>{reserva.guia_nome || reserva.guia_responsavel}</p>
            </div>
            <div>
              <span style={styles.label}>TOTAL DE TURISTAS</span>
              <p style={styles.valor}>{reserva.quantidade_turistas} pessoas</p>
            </div>
          </div>
          <div style={styles.destinoBox}>
            <span style={styles.label}>DESTINO / PASSEIO</span>
            <p style={styles.valor}>📍 {reserva.passeio_nome || reserva.passeio}</p>
          </div>
          <div style={styles.dataBox}>
            <span style={styles.label}>DATA E HORÁRIO</span>
            <p style={styles.valor}>{reserva.data_reserva} às {reserva.horario_reserva}</p>
          </div>
          {reserva.status === 'em_andamento' ? (
            <div style={styles.jaValidado}>✓ Passeio já validado</div>
          ) : (
            <button style={styles.botaoValidar} onClick={validarEntrada} disabled={loading}>
              {loading ? 'Validando...' : '✓ VALIDAR ENTRADA'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '600px', margin: '0 auto' },
  titulo: { color: '#000441', fontFamily: 'Montserrat, sans-serif', fontSize: '24px', textAlign: 'center', marginBottom: '8px' },
  subtitulo: { color: '#454652', fontSize: '14px', textAlign: 'center', marginBottom: '2rem' },
  scanBox: { marginBottom: '1rem' },
  botaoScan: { width: '100%', padding: '14px', background: '#000441', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  botaoParar: { width: '100%', padding: '14px', background: '#a32d2d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  separador: { display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' },
  separadorTexto: { color: '#767683', fontSize: '13px', whiteSpace: 'nowrap', padding: '0 8px', background: '#f6faff' },
  formBusca: { display: 'flex', gap: '8px', marginBottom: '1.5rem' },
  inputBusca: { flex: 1, padding: '12px 16px', border: '2px solid #000441', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  botaoBuscar: { background: '#000441', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  erro: { color: '#a32d2d', background: '#fcebeb', padding: '12px', borderRadius: '6px', marginBottom: '1rem' },
  sucesso: { color: '#3b6d11', background: '#eaf3de', padding: '12px', borderRadius: '6px', marginBottom: '1rem' },
  card: { background: '#fff', border: '1px solid #e0e9f2', borderRadius: '10px', padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  reservaAtiva: { color: '#3b6d11', fontWeight: '600', fontSize: '13px' },
  reservaId: { background: '#f0f4f8', color: '#454652', padding: '4px 10px', borderRadius: '4px', fontSize: '13px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  label: { color: '#767683', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  valor: { color: '#141d23', fontSize: '16px', fontWeight: '600', marginTop: '4px' },
  destinoBox: { background: '#f6faff', borderRadius: '6px', padding: '12px', marginBottom: '1rem' },
  dataBox: { marginBottom: '1.5rem' },
  botaoValidar: { width: '100%', padding: '14px', background: '#3b6d11', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px' },
  jaValidado: { width: '100%', padding: '14px', background: '#eaf3de', color: '#3b6d11', borderRadius: '6px', fontSize: '15px', fontWeight: '700', textAlign: 'center' },
}