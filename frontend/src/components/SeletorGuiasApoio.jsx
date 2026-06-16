import { X } from 'lucide-react'

export default function SeletorGuiasApoio({ guias, selecionados, onChange, idResponsavel }) {
  function nomeDoGuia(g) {
    return g.first_name && g.last_name ? `${g.first_name} ${g.last_name}` : g.username
  }
  
  const disponiveis = guias.filter(
    g => String(g.id) !== String(idResponsavel) && !selecionados.includes(String(g.id))
  )

  function adicionar(id) {
    if (!id) return
    onChange([...selecionados, String(id)])
  }

  function remover(id) {
    onChange(selecionados.filter(s => s !== String(id)))
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-gray-600">
        Guias de Apoio <span className="text-gray-400 font-normal">(opcional)</span>
      </label>

      <select
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer"
        value=""
        onChange={e => adicionar(e.target.value)}
      >
        <option value="">Adicionar guia de apoio...</option>
        {disponiveis.map(g => (
          <option key={g.id} value={g.id}>{nomeDoGuia(g)}</option>
        ))}
      </select>

      {selecionados.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selecionados.map(id => {
            const g = guias.find(x => String(x.id) === String(id))
            if (!g) return null
            return (
              <span
                key={id}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700"
              >
                {nomeDoGuia(g)}
                <button
                  type="button"
                  onClick={() => remover(id)}
                  className="hover:text-blue-900 cursor-pointer"
                  aria-label="Remover guia de apoio"
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
