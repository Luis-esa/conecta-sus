import assert from 'node:assert/strict'
import test from 'node:test'
import { criarDadosIniciais } from '../data/seed.ts'
import { agregarEstoque, classificarEstoque } from './estoque.ts'
import { calcularDashboard } from './dashboard.ts'

const agora = new Date(2026, 9, 6, 12)
const seed = criarDadosIniciais(agora)
const dados = {
  unidades: seed.unidades,
  medicamentos: seed.medicamentos,
  lotes: seed.lotes,
  estoque: agregarEstoque(seed.lotes),
  movimentacoes: seed.movimentacoes,
}
const admin = seed.usuarios.find((item) => item.role === 'ADMIN')!
const gestor = seed.usuarios.find((item) => item.role === 'GESTOR')!
const ubs01 = seed.usuarios.find((item) => item.email === 'ubs01@conectasus.com')!
const ubs05 = seed.usuarios.find((item) => item.email === 'ubs05@conectasus.com')!

test('limites de estoque distinguem crítico, baixo e normal', () => {
  assert.equal(classificarEstoque(30, 100), 'CRITICO')
  assert.equal(classificarEstoque(31, 100), 'BAIXO')
  assert.equal(classificarEstoque(100, 100), 'BAIXO')
  assert.equal(classificarEstoque(101, 100), 'NORMAL')
})

test('dashboard municipal deriva indicadores, unidades, alertas, gráfico e histórico do seed', () => {
  const resumo = calcularDashboard(dados, admin, agora)
  assert.deepEqual(resumo.indicadores, { unidades: 5, medicamentos: 20, criticos: 2, baixos: 1, vencimentos: 1, possibilidadesRedistribuicao: 3 })
  assert.deepEqual(resumo.distribuicao.map((item) => item.quantidade), [19, 1, 2])
  assert.equal(resumo.unidades.find((item) => item.id === 3)?.status, 'CRITICO')
  assert.equal(resumo.unidades.find((item) => item.id === 4)?.vencimentos, 1)
  assert.equal(resumo.observacoes.length, 4)
  assert.deepEqual(resumo.movimentacoes.map((item) => item.id), [76, 72, 68, 64, 60])
  assert.deepEqual(calcularDashboard(dados, gestor, agora).indicadores, resumo.indicadores)
})

test('UBS vê somente sua unidade, seus lotes e suas movimentações', () => {
  const resumo = calcularDashboard(dados, ubs01, agora)
  assert.deepEqual(resumo.indicadores, { unidades: 1, medicamentos: 4, criticos: 0, baixos: 0, vencimentos: 0, possibilidadesRedistribuicao: null })
  assert.deepEqual(resumo.unidades.map((item) => item.nome), ['UBS 01'])
  assert.equal(resumo.observacoes.length, 0)
  assert.ok(resumo.movimentacoes.every((item) => {
    const movimento = dados.movimentacoes.find((original) => original.id === item.id)!
    return movimento.origemId === ubs01.unidadeId || movimento.destinoId === ubs01.unidadeId
  }))
  const outraUbs = calcularDashboard(dados, ubs05, agora)
  assert.equal(outraUbs.indicadores.criticos, 1)
  assert.deepEqual(outraUbs.unidades.map((item) => item.nome), ['UBS 05'])
  assert.ok(outraUbs.observacoes.every((item) => item.detalhe.includes('UBS 05')))
})

test('indicadores mudam com os lotes atuais e dados vazios não geram números fictícios', () => {
  const lotes = dados.lotes.map((lote) => {
    if (lote.id === 3) return { ...lote, quantidade: 200 }
    if (lote.id === 4) return { ...lote, dataValidade: '2027-12-31' }
    if (lote.id === 1) return { ...lote, quantidade: 100 }
    if (lote.id === 21) return { ...lote, quantidade: 0 }
    return lote
  })
  const alterado = calcularDashboard({ ...dados, lotes, estoque: agregarEstoque(lotes) }, admin, agora)
  assert.equal(alterado.indicadores.criticos, 1)
  assert.equal(alterado.indicadores.vencimentos, 0)
  assert.equal(alterado.indicadores.possibilidadesRedistribuicao, 0)

  const vazio = calcularDashboard({ unidades: [], medicamentos: [], lotes: [], estoque: [], movimentacoes: [] }, admin, agora)
  assert.deepEqual(vazio.indicadores, { unidades: 0, medicamentos: 0, criticos: 0, baixos: 0, vencimentos: 0, possibilidadesRedistribuicao: 0 })
  assert.equal(vazio.observacoes.length, 0)
  assert.equal(vazio.movimentacoes.length, 0)
})
