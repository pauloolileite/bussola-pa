import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeReserva({ codigo, tamanho = 150 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current && codigo) {
      QRCode.toCanvas(canvasRef.current, codigo.toString(), {
        width: tamanho,
        margin: 2,
        color: { dark: '#000441', light: '#ffffff' }
      })
    }
  }, [codigo, tamanho])

  return <canvas ref={canvasRef} />
}