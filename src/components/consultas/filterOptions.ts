import { DIAS_ALERTA_VENCIMENTO } from '@/utils/validade'

export const opcoesValidade = [
  { value: 'TODAS', label: 'Todas as validades' },
  { value: 'VENCIDO', label: 'Vencidos' },
  { value: 'PROXIMO', label: `Próximos (até ${DIAS_ALERTA_VENCIMENTO} dias)` },
  { value: 'REGULAR', label: 'Regulares' },
]
