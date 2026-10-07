import assert from 'node:assert/strict'
import test from 'node:test'
import { criarDadosIniciais } from '../data/seed.ts'
import { analisarConsumo } from './consumo.ts'
import { criarConsultas } from './consultas.ts'
import { agregarEstoque } from './estoque.ts'
import { criarHistorico } from './historico.ts'
import { movimentosPorMes, resumirRelatorios } from './relatorios.ts'

test('indicadores e séries dos relatórios conciliam com estoque e movimentações operacionais', () => {
  const dados = criarDadosIniciais(new Date(2026, 9, 7, 12))
  const estoque = agregarEstoque(dados.lotes)
  const consultas = criarConsultas({ ...dados, estoque }, dados.usuarios[0], new Date(2026, 9, 7, 12))
  const historico = criarHistorico(dados, dados.usuarios[0])
  const resumo = resumirRelatorios({ estoque: consultas.estoque, lotes: consultas.lotes, movimentacoes: historico, consumo: analisarConsumo({ estoque, movimentacoes: dados.movimentacoes }, new Date(2026, 9, 7, 12)) })
  assert.equal(resumo.saldoTotal, dados.lotes.reduce((total, lote) => total + lote.quantidade, 0))
  assert.equal(resumo.entradas + resumo.saidas + resumo.transferencias, historico.length)
  assert.equal(resumo.quantidadeSaida, historico.filter((item) => item.movimentacao.tipo === 'SAIDA').reduce((total, item) => total + item.movimentacao.quantidade, 0))
  assert.equal(movimentosPorMes(historico).reduce((total, mes) => total + mes.saidas, 0), resumo.quantidadeSaida)
})
