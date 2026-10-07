import assert from 'node:assert/strict'
import test from 'node:test'
import { analisarConsumo } from './consumo.ts'
import type { Movimentacao } from '../types/index.ts'

const agora = new Date(2026, 9, 7, 12)
const estoque = [{ medicamentoId: 1, unidadeId: 1, quantidade: 90 }]
const saida = (id: number, dataHora: string, quantidade = 10, transferenciaId?: number): Movimentacao =>
  ({ id, tipo: 'SAIDA', medicamentoId: 1, origemId: 1, quantidade, usuarioId: 1, dataHora, transferenciaId })

test('consumo médio usa três meses completos e ignora saída de transferência', () => {
  const movimentacoes = [saida(1, '2026-07-12T12:00:00.000Z'), saida(2, '2026-08-12T12:00:00.000Z', 20), saida(3, '2026-09-12T12:00:00.000Z', 30), saida(4, '2026-09-13T12:00:00.000Z', 100, 99), saida(5, '2026-10-01T12:00:00.000Z', 100)]
  const [analise] = analisarConsumo({ estoque, movimentacoes }, agora)
  assert.equal(analise.consumoMedioMensal, 20)
  assert.equal(analise.mesesDeEstoque, 4.5)
  assert.equal(analise.situacao, 'SUFICIENTE')
})

test('consumo zero e histórico insuficiente não dividem por zero', () => {
  const [zero] = analisarConsumo({ estoque, movimentacoes: [] }, agora)
  assert.equal(zero.situacao, 'SEM_CONSUMO')
  assert.equal(zero.mesesDeEstoque, null)
  const [curto] = analisarConsumo({ estoque, movimentacoes: [saida(1, '2026-09-12T12:00:00.000Z')] }, agora)
  assert.equal(curto.situacao, 'SEM_HISTORICO')
  assert.equal(curto.consumoMedioMensal, null)
})
