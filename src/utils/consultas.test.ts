import assert from 'node:assert/strict'
import test from 'node:test'
import { addDays, format } from 'date-fns'
import { criarDadosIniciais } from '../data/seed.ts'
import { criarConsultas, filtrarEstoque, filtrarLotes, filtrarMedicamentos } from './consultas.ts'
import { agregarEstoque } from './estoque.ts'
import { classificarValidade, DIAS_ALERTA_VENCIMENTO } from './validade.ts'

const agora = new Date(2026, 9, 6, 12)
const seed = criarDadosIniciais(agora)
const dados = { unidades: seed.unidades, medicamentos: seed.medicamentos, lotes: seed.lotes, estoque: agregarEstoque(seed.lotes) }
const admin = seed.usuarios.find((item) => item.role === 'ADMIN')!
const ubs01 = seed.usuarios.find((item) => item.email === 'ubs01@conectasus.com')!
const todas = criarConsultas(dados, admin, agora)

test('consulta reconcilia lotes, saldos e validade por medicamento/unidade', () => {
  assert.equal(todas.estoque.length, 22)
  assert.equal(todas.lotes.length, 23)
  assert.equal(todas.medicamentos.length, 20)
  const paracetamol = todas.estoque.find((item) => item.medicamento.id === 1 && item.unidade.id === 1)!
  assert.equal(paracetamol.quantidade, 1000)
  assert.equal(paracetamol.lotes.reduce((soma, lote) => soma + lote.quantidade, 0), paracetamol.quantidade)
  assert.equal(paracetamol.lotes.length, 2)
  assert.equal(paracetamol.status, 'NORMAL')
  assert.equal(todas.estoque.find((item) => item.medicamento.id === 3)?.status, 'CRITICO')
  assert.equal(todas.estoque.find((item) => item.medicamento.id === 2)?.status, 'BAIXO')
})

test('pesquisa cobre nome, princípio ativo, código e lote; filtros combinam unidade, status e validade', () => {
  const base = { busca: '', unidadeId: 'TODAS', status: 'TODOS', validade: 'TODAS' }
  assert.equal(filtrarEstoque(todas.estoque, { ...base, busca: 'paracetamol' }).length, 3)
  assert.equal(filtrarEstoque(todas.estoque, { ...base, busca: 'acido folico' }).length, 1)
  assert.equal(filtrarEstoque(todas.estoque, { ...base, busca: 'MED003' }).length, 1)
  assert.equal(filtrarEstoque(todas.estoque, { ...base, busca: 'DEMO-001-B' }).length, 1)
  assert.equal(filtrarEstoque(todas.estoque, { ...base, unidadeId: '5', status: 'CRITICO' }).length, 1)
  assert.equal(filtrarEstoque(todas.estoque, { ...base, status: 'BAIXO' }).length, 1)
  assert.equal(filtrarEstoque(todas.estoque, { ...base, validade: 'PROXIMO' }).length, 1)
  assert.equal(filtrarEstoque(todas.estoque, { ...base, busca: 'inexistente' }).length, 0)
  assert.equal(filtrarLotes(todas.lotes, { busca: 'Paracetamol', unidadeId: '1', validade: 'TODAS' }).length, 2)
  assert.equal(filtrarLotes(todas.lotes, { busca: '', unidadeId: 'TODAS', validade: 'PROXIMO' }).length, 1)
  assert.equal(filtrarMedicamentos(todas.medicamentos, { busca: 'MED003', situacao: 'ATIVO' }).length, 1)
  assert.equal(filtrarMedicamentos(todas.medicamentos, { busca: '', situacao: 'INATIVO' }).length, 0)
})

test('perfil UBS recebe apenas registros e unidades do vínculo', () => {
  const consulta = criarConsultas(dados, ubs01, agora)
  assert.deepEqual(consulta.unidades.map((item) => item.id), [1])
  assert.equal(consulta.estoque.length, 4)
  assert.equal(consulta.lotes.length, 5)
  assert.equal(consulta.medicamentos.length, 4)
  assert.ok(consulta.estoque.every((item) => item.unidade.id === 1))
  assert.ok(consulta.lotes.every((item) => item.unidade.id === 1))
  assert.ok(consulta.medicamentos.every((item) => item.unidadesComLote.every((unidade) => unidade.id === 1)))
  assert.equal(filtrarEstoque(consulta.estoque, { busca: '', unidadeId: '5', status: 'TODOS', validade: 'TODAS' }).length, 0)
})

test('janela de validade é centralizada e distingue vencido, próximo e regular', () => {
  const data = (dias: number) => format(addDays(agora, dias), 'yyyy-MM-dd')
  assert.equal(classificarValidade(data(-1), agora), 'VENCIDO')
  assert.equal(classificarValidade(data(0), agora), 'PROXIMO')
  assert.equal(classificarValidade(data(DIAS_ALERTA_VENCIMENTO), agora), 'PROXIMO')
  assert.equal(classificarValidade(data(DIAS_ALERTA_VENCIMENTO + 1), agora), 'REGULAR')
})

test('edição de lote altera saldo e status sem tocar no catálogo', () => {
  const lotes = seed.lotes.map((lote) => lote.id === 3 ? { ...lote, quantidade: 200 } : lote)
  const alterado = criarConsultas({ ...dados, lotes, estoque: agregarEstoque(lotes) }, admin, agora)
  assert.equal(alterado.estoque.find((item) => item.medicamento.id === 3)?.quantidade, 200)
  assert.equal(alterado.estoque.find((item) => item.medicamento.id === 3)?.status, 'NORMAL')
  assert.equal(alterado.medicamentos.length, todas.medicamentos.length)
})
