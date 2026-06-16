import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, AlertTriangle, Search, Camera, CameraOff } from 'lucide-react'
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

    if (reserva.status !== 'confirmada') {
      setErro('Reserva não está apta para validação. O guia precisa confirmar a reserva antes.')
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
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#e6eff8' }}>
          <ShieldCheck size={28} style={{ color: '#000441' }} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: '#000441', fontFamily: 'Montserrat, sans-serif' }}>
          Validação de Passeio
        </h2>
        <p className="text-sm text-gray-500 mt-1">Escaneie o QR code ou insira o código manualmente</p>
      </div>

      {/* Scanner */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
        <button
          onClick={escaneando ? pararScanner : iniciarScanner}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
          style={{ background: escaneando ? '#dc2626' : '#000441' }}
        >
          {escaneando ? <><CameraOff size={16} /> Parar Scanner</> : <><Camera size={16} /> Escanear QR Code</>}
        </button>
        <div id="qr-reader" style={{ width: '100%', marginTop: escaneando ? '1rem' : '0' }} />
      </div>

      {/* Busca manual */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wider">ou informe manualmente</p>
        <form onSubmit={handleBuscarManual} className="flex gap-2">
          <input
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
            placeholder="Cole o código UUID da reserva..."
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            required
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
            style={{ background: '#000441' }}
          >
            <Search size={16} />
          </button>
        </form>
      </div>

      {erro && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg mb-4">
          <AlertTriangle size={15} />
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg mb-4">
          <ShieldCheck size={15} />
          {sucesso}
        </div>
      )}

      {/* Card da reserva */}
      {reserva && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="flex items-center gap-1 text-xs font-bold text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              RESERVA {reserva.status.toUpperCase()}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">
              #BPA-{reserva.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Guia Responsável</p>
              <p className="text-base font-bold" style={{ color: '#000441' }}>{reserva.guia_nome || reserva.guia_responsavel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total de Turistas</p>
              <p className="text-base font-bold" style={{ color: '#000441' }}>{reserva.quantidade_turistas} pessoas</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Destino / Passeio</p>
            <p className="text-sm font-semibold" style={{ color: '#000441' }}>
              📍 {reserva.passeio_nome || reserva.passeio}
            </p>
          </div>

          <div className="mb-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Data e Horário</p>
            <p className="text-sm font-semibold" style={{ color: '#000441' }}>
              {reserva.data_reserva} às {reserva.horario_reserva}
            </p>
          </div>

          {reserva.status === 'em_andamento' || reserva.status === 'concluida' ? (
            <div className="w-full py-3 bg-green-50 text-green-700 rounded-lg text-sm font-bold text-center">
              ✓ Passeio já validado
            </div>
          ) : reserva.status === 'confirmada' ? (
            <button
              onClick={validarEntrada}
              disabled={loading}
              className="w-full py-3 rounded-lg text-white text-sm font-bold tracking-wider transition-all active:scale-95 hover:opacity-90 cursor-pointer"
              style={{ background: '#16a34a', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Validando...' : '✓ VALIDAR ENTRADA'}
            </button>
          ) : (
            <div className="w-full py-3 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold text-center px-3">
              Aguardando confirmação do guia. Só é possível validar reservas confirmadas.
            </div>
          )}
        </div>
      )}
    </div>
  )
}