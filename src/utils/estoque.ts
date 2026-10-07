import type { Estoque, Lote, StatusEstoque } from '../types/index.ts'

export const FRACAO_ESTOQUE_CRITICO = 0.3

export function classificarEstoque(quantidade: number, minimo: number): StatusEstoque {
  if (quantidade <= minimo * FRACAO_ESTOQUE_CRITICO) return 'CRITICO'
  if (quantidade <= minimo) return 'BAIXO'
  return 'NORMAL'
}

/** A soma dos lotes é a única fonte de verdade para o saldo. */
export function agregarEstoque(lotes: readonly Lote[]): Estoque[] {
  const saldos = new Map<string, Estoque>()
  for (const lote of lotes) {
    const chave = `${lote.medicamentoId}:${lote.unidadeId}`
    const saldo = saldos.get(chave) ?? {
      medicamentoId: lote.medicamentoId,
      unidadeId: lote.unidadeId,
      quantidade: 0,
    }
    saldo.quantidade += lote.quantidade
    saldos.set(chave, saldo)
  }
  return [...saldos.values()].sort((a, b) => a.unidadeId - b.unidadeId || a.medicamentoId - b.medicamentoId)
}
