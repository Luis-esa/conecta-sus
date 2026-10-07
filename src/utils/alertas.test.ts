import assert from 'node:assert/strict'
import test from 'node:test'
import { addDays, format } from 'date-fns'
import { criarDadosIniciais } from '../data/seed.ts'
import { criarMockApi } from '../services/mockApi.ts'
import type { Armazenamento } from '../services/persistencia.ts'
import { criarAppStore } from '../stores/appStore.ts'
import { filtrarAlertasDoUsuario, gerarAlertas } from './alertas.ts'

class Memoria implements Armazenamento {
  dados = new Map<string, string>()
  getItem(chave: string) { return this.dados.get(chave) ?? null }
  setItem(chave: string, valor: string) { this.dados.set(chave, valor) }
  removeItem(chave: string) { this.dados.delete(chave) }
}

test('classifica crítico e baixo sem duplicar, e aplica janela de 90 dias por lote com saldo', () => {
  const agora = new Date(2026, 9, 6, 12)
  const dados = criarDadosIniciais(agora)
  const lote = dados.lotes.find((item) => item.id === 1)!
  lote.quantidade = 31
  lote.dataValidade = format(addDays(agora, 90), 'yyyy-MM-dd')
  const outro = dados.lotes.find((item) => item.id === 21)!
  outro.quantidade = 0
  outro.dataValidade = format(addDays(agora, -1), 'yyyy-MM-dd')
  const alertas = gerarAlertas(dados, agora)
  const estoque = alertas.filter((item) => item.unidadeId === 1 && item.medicamentoId === 1 && item.tipo !== 'VENCIMENTO')
  assert.equal(estoque.length, 1)
  assert.equal(estoque[0].tipo, 'ESTOQUE_BAIXO')
  assert.ok(alertas.some((item) => item.tipo === 'VENCIMENTO' && item.loteId === 1 && item.severidade === 'ATENCAO'))
  assert.ok(!alertas.some((item) => item.tipo === 'VENCIMENTO' && item.loteId === 21))
  lote.quantidade = 30
  lote.dataValidade = format(addDays(agora, -1), 'yyyy-MM-dd')
  const criticos = gerarAlertas(dados, agora)
  assert.equal(criticos.find((item) => item.unidadeId === 1 && item.medicamentoId === 1 && item.tipo !== 'VENCIMENTO')?.tipo, 'ESTOQUE_CRITICO')
  assert.equal(criticos.find((item) => item.loteId === 1 && item.tipo === 'VENCIMENTO')?.severidade, 'CRITICA')
  lote.dataValidade = format(addDays(agora, 91), 'yyyy-MM-dd')
  assert.ok(!gerarAlertas(dados, agora).some((item) => item.loteId === 1 && item.tipo === 'VENCIMENTO'))
})

test('alertas mudam automaticamente após entrada, saída e transferência; UBS vê só sua unidade', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const store = criarAppStore(api)
  await store.getState().inicializar()
  const alertaCritico = () => store.getState().alertas?.some((item) => item.tipo === 'ESTOQUE_CRITICO' && item.unidadeId === 5 && item.medicamentoId === 1)
  assert.equal(alertaCritico(), true)
  const loteDestino = store.getState().lotes.find((item) => item.id === 22)!
  const data = format(new Date(), 'yyyy-MM-dd')
  assert.equal(await store.getState().registrarEntrada({ medicamentoId: 1, unidadeId: 5, loteId: 22, numeroLote: loteDestino.numero, quantidade: 100, dataValidade: loteDestino.dataValidade, origem: 'Almoxarifado', data, usuarioId: 2 }), true)
  assert.equal(alertaCritico(), false)
  assert.equal(await store.getState().registrarSaida({ medicamentoId: 1, unidadeId: 5, loteId: 22, quantidade: 100, destinoMotivo: 'Dispensação', data, usuarioId: 2 }), true)
  assert.equal(alertaCritico(), true)
  assert.equal(await store.getState().registrarTransferencia({ origemId: 1, destinoId: 5, medicamentoId: 1, loteId: 1, quantidade: 100, usuarioId: 2 }), true)
  assert.equal(alertaCritico(), false)
  const usuarios = await api.getUsuarios()
  const ubs = usuarios.find((item) => item.id === 3)!
  const municipais = store.getState().alertas ?? []
  assert.ok(filtrarAlertasDoUsuario(municipais, ubs).every((item) => item.unidadeId === 1))
  assert.equal(filtrarAlertasDoUsuario(municipais, usuarios.find((item) => item.id === 2)!).length, municipais.length)
  const recarregado = criarAppStore(criarMockApi(() => storage))
  await recarregado.getState().inicializar()
  assert.deepEqual(recarregado.getState().alertas, store.getState().alertas)
})
