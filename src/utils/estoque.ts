import type { Estoque, Lote } from '../types/index.ts'

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
