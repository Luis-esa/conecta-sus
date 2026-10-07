import assert from 'node:assert/strict'
import test from 'node:test'
import { criarDadosIniciais } from '../data/seed.ts'
import { criarHistorico, filtrarHistorico, type FiltrosHistorico } from './historico.ts'

const dados = criarDadosIniciais(new Date(2026, 9, 7, 12))
const admin = dados.usuarios[0]
const ubs01 = dados.usuarios.find((item) => item.unidadeId === 1)!
const filtros: FiltrosHistorico = { inicio: '', fim: '', medicamentoId: 'TODOS', unidadeId: 'TODAS', tipo: 'TODOS', usuarioId: 'TODOS' }

test('histórico aplica período, medicamento, unidade, tipo e usuário sobre operações existentes', () => {
  const linhas = criarHistorico(dados, admin)
  assert.equal(linhas.length, dados.movimentacoes.length)
  const filtradas = filtrarHistorico(linhas, { ...filtros, inicio: '2026-09-01', fim: '2026-09-30', medicamentoId: '1', unidadeId: '1', tipo: 'SAIDA', usuarioId: '3' })
  assert.equal(filtradas.length, 1)
  assert.equal(filtradas[0].movimentacao.loteId, 1)
  assert.equal(filtradas[0].usuario, ubs01.nome)
  assert.deepEqual(filtrarHistorico(linhas, { ...filtros, inicio: '2030-01-01' }), [])
})

test('UBS enxerga somente operações que envolvem sua unidade; transferência aparece uma vez', () => {
  const transferencia = { id: 100, tipo: 'TRANSFERENCIA' as const, medicamentoId: 1, loteId: 1, quantidade: 5, origemId: 1, destinoId: 2, usuarioId: 3, dataHora: '2026-10-07T12:00:00.000Z' }
  const movimentos = [...dados.movimentacoes, transferencia,
    { ...transferencia, id: 101, tipo: 'SAIDA' as const, destinoId: undefined, transferenciaId: 100 },
    { ...transferencia, id: 102, tipo: 'ENTRADA' as const, origemId: undefined, transferenciaId: 100 }]
  const linhas = criarHistorico({ ...dados, movimentacoes: movimentos }, ubs01)
  assert.ok(linhas.every((item) => item.movimentacao.origemId === 1 || item.movimentacao.destinoId === 1))
  assert.equal(linhas.filter((item) => item.movimentacao.id >= 100).length, 1)
  assert.equal(linhas.find((item) => item.movimentacao.id === 100)?.destino, 'UBS 02')
})
