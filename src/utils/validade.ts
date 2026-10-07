import { differenceInCalendarDays, parseISO } from 'date-fns'

export const DIAS_ALERTA_VENCIMENTO = 90
export type StatusValidade = 'VENCIDO' | 'PROXIMO' | 'REGULAR'

export function classificarValidade(dataValidade: string, agora = new Date()): StatusValidade {
  const dias = differenceInCalendarDays(parseISO(dataValidade), agora)
  if (dias < 0) return 'VENCIDO'
  if (dias <= DIAS_ALERTA_VENCIMENTO) return 'PROXIMO'
  return 'REGULAR'
}

export function exigeAtencaoValidade(dataValidade: string, agora = new Date()): boolean {
  return classificarValidade(dataValidade, agora) !== 'REGULAR'
}
