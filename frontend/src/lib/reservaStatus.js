// Mapas de status de reserva, centralizados para não duplicar entre telas.
// A regra de transição autoritativa é do backend (TRANSICOES_VALIDAS);
// aqui é apenas o espelho usado pela UI.

export const STATUS_CORES = {
  solicitada: 'bg-blue-100 text-blue-800',
  confirmada: 'bg-green-100 text-green-800',
  em_andamento: 'bg-orange-100 text-orange-800',
  concluida: 'bg-teal-100 text-teal-800',
  cancelada: 'bg-red-100 text-red-800',
}

export const TRANSICOES = {
  solicitada: ['confirmada', 'cancelada'],
  confirmada: ['em_andamento', 'cancelada'],
  em_andamento: ['concluida', 'cancelada'],
  concluida: [],
  cancelada: [],
}

export const LABELS_TRANSICAO = {
  confirmada: 'Confirmar',
  em_andamento: 'Iniciar',
  concluida: 'Concluir',
  cancelada: 'Cancelar',
}

export const formatarStatus = (status) => (status || '').replace('_', ' ')
