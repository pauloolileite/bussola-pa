import { forcaSenha } from '../utils/validacao'
export default function MedidorSenha({ senha }) {
  if (!senha) return null
  const { nivel, texto, cor } = forcaSenha(senha)
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-1.5 flex-1 rounded-full"
            style={{ background: i < nivel ? cor : '#e5e7eb' }} />
        ))}
      </div>
      <p className="text-xs mt-1" style={{ color: cor }}>{texto}</p>
    </div>
  )
}
