import { format, startOfMonth, subMonths } from 'date-fns'
import type { Estoque, Movimentacao } from '../types/index.ts'

export const MESES_HISTORICO_CONSUMO = 3

export interface AnaliseConsumo {
  medicamentoId: number
  unidadeId: number
  estoqueAtual: number
  consumoMedioMensal: number | null
  mesesDeEstoque: number | null
  situacao: 'SUFICIENTE' | 'SEM_HISTORICO' | 'SEM_CONSUMO'
}

/** Usa três meses calendários completos; débitos de transferências não são consumo. */
export function analisarConsumo(dados: {
  estoque: readonly Estoque[]
  movimentacoes: readonly Movimentacao[]
}, agora = new Date()): AnaliseConsumo[] {
  const meses = Array.from({ length: MESES_HISTORICO_CONSUMO }, (_, indice) =>
    format(subMonths(startOfMonth(agora), indice + 1), 'yyyy-MM'))
  const mesesValidos = new Set(meses)
  const saidas = new Map<string, Map<string, number>>()
  for (const item of dados.movimentacoes) {
    if (item.tipo !== 'SAIDA' || item.transferenciaId !== undefined || item.origemId === undefined) continue
    const mes = item.dataHora.slice(0, 7)
    if (!mesesValidos.has(mes)) continue
    const chave = `${item.medicamentoId}:${item.origemId}`
    const porMes = saidas.get(chave) ?? new Map<string, number>()
    porMes.set(mes, (porMes.get(mes) ?? 0) + item.quantidade)
    saidas.set(chave, porMes)
  }
  return dados.estoque.map((saldo) => {
    const porMes = saidas.get(`${saldo.medicamentoId}:${saldo.unidadeId}`)
    const mesesComSaida = meses.filter((mes) => (porMes?.get(mes) ?? 0) > 0).length
    if (mesesComSaida === 0) return { ...saldo, estoqueAtual: saldo.quantidade, consumoMedioMensal: null, mesesDeEstoque: null, situacao: 'SEM_CONSUMO' as const }
    if (mesesComSaida < MESES_HISTORICO_CONSUMO) return { ...saldo, estoqueAtual: saldo.quantidade, consumoMedioMensal: null, mesesDeEstoque: null, situacao: 'SEM_HISTORICO' as const }
    const media = meses.reduce((total, mes) => total + (porMes?.get(mes) ?? 0), 0) / MESES_HISTORICO_CONSUMO
    return { ...saldo, estoqueAtual: saldo.quantidade, consumoMedioMensal: media, mesesDeEstoque: media > 0 ? saldo.quantidade / media : null, situacao: 'SUFICIENTE' as const }
  })
}
