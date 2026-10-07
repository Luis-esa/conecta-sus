import assert from 'node:assert/strict'
import test from 'node:test'
import { criarAppStore } from '../stores/appStore.ts'
import { agregarEstoque } from '../utils/estoque.ts'
import { criarMockApi } from './mockApi.ts'
import { CHAVES_DADOS, type Armazenamento } from './persistencia.ts'

class Memoria implements Armazenamento {
  dados = new Map<string, string>()
  falharUmaVezEm: string | null = null
  getItem(chave: string) { return this.dados.get(chave) ?? null }
  setItem(chave: string, valor: string) {
    if (this.falharUmaVezEm === chave) { this.falharUmaVezEm = null; throw new Error('Falha simulada') }
    this.dados.set(chave, valor)
  }
  removeItem(chave: string) { this.dados.delete(chave) }
}

const pedido = { origemId: 1, destinoId: 5, medicamentoId: 1, loteId: 1, quantidade: 25, usuarioId: 3 }

test('transferência cria lote no destino, ajusta ambos os saldos e registra lançamentos vinculados após refresh', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const store = criarAppStore(api)
  await store.getState().inicializar()
  const origemAntes = store.getState().lotes.find((item) => item.id === 1)!
  const origemEstoqueAntes = agregarEstoque(store.getState().lotes).find((item) => item.unidadeId === 1 && item.medicamentoId === 1)!.quantidade
  const destinoEstoqueAntes = agregarEstoque(store.getState().lotes).find((item) => item.unidadeId === 5 && item.medicamentoId === 1)!.quantidade
  const movimentosAntes = store.getState().movimentacoes.length

  assert.equal(await store.getState().registrarTransferencia(pedido), true)
  const estado = store.getState()
  assert.equal(estado.operacaoErro, null)
  assert.equal(estado.lotes.find((item) => item.id === 1)?.quantidade, origemAntes.quantidade - 25)
  const loteDestino = estado.lotes.find((item) => item.unidadeId === 5 && item.medicamentoId === 1 && item.numero === origemAntes.numero)!
  assert.equal(loteDestino.quantidade, 25)
  assert.equal(loteDestino.dataValidade, origemAntes.dataValidade)
  const estoque = agregarEstoque(estado.lotes)
  assert.equal(estoque.find((item) => item.unidadeId === 1 && item.medicamentoId === 1)?.quantidade, origemEstoqueAntes - 25)
  assert.equal(estoque.find((item) => item.unidadeId === 5 && item.medicamentoId === 1)?.quantidade, destinoEstoqueAntes + 25)
  const registros = estado.movimentacoes.slice(movimentosAntes)
  assert.deepEqual(registros.map((item) => item.tipo), ['TRANSFERENCIA', 'SAIDA', 'ENTRADA'])
  assert.equal(registros[0].origemId, 1)
  assert.equal(registros[0].destinoId, 5)
  assert.equal(registros[0].usuarioId, 3)
  assert.equal(registros[0].medicamentoId, 1)
  assert.equal(registros[1].transferenciaId, registros[0].id)
  assert.equal(registros[2].transferenciaId, registros[0].id)
  assert.equal(registros[1].loteId, 1)
  assert.equal(registros[2].loteId, loteDestino.id)

  const novaSessao = criarMockApi(() => storage)
  assert.deepEqual(await novaSessao.getLotes(), estado.lotes)
  assert.deepEqual(await novaSessao.getMovimentacoes(), estado.movimentacoes)
})

test('segunda transferência consolida no lote correspondente do destino', async () => {
  const storage = new Memoria()
  const persistente = criarMockApi(() => storage)
  await persistente.registrarTransferencia(pedido)
  const quantidadeLotes = (await persistente.getLotes()).length
  await persistente.registrarTransferencia({ ...pedido, quantidade: 10 })
  const lotes = await persistente.getLotes()
  assert.equal(lotes.length, quantidadeLotes)
  assert.equal(lotes.find((item) => item.unidadeId === 5 && item.medicamentoId === 1 && item.numero === 'DEMO-001-A')?.quantidade, 35)
})

test('mesma unidade, saldo insuficiente, quantidades inválidas e lote incompatível preservam todos os dados', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  await api.inicializarDados()
  const antes = [storage.getItem(CHAVES_DADOS.lotes), storage.getItem(CHAVES_DADOS.movimentacoes)]
  await assert.rejects(api.registrarTransferencia({ ...pedido, destinoId: 1 }), /diferente da origem/)
  await assert.rejects(api.registrarTransferencia({ ...pedido, quantidade: 601 }), /maior que o estoque disponível/)
  await assert.rejects(api.registrarTransferencia({ ...pedido, quantidade: 0 }), /maior que zero/)
  await assert.rejects(api.registrarTransferencia({ ...pedido, quantidade: -5 }), /maior que zero/)
  await assert.rejects(api.registrarTransferencia({ ...pedido, loteId: 999 }), /Lote inexistente/)
  await assert.rejects(api.registrarTransferencia({ ...pedido, loteId: 22 }), /Lote inexistente/)
  await assert.rejects(api.registrarTransferencia({ ...pedido, origemId: 2 }), /sem permissão/)
  assert.deepEqual([storage.getItem(CHAVES_DADOS.lotes), storage.getItem(CHAVES_DADOS.movimentacoes)], antes)
})

test('falha na escrita do histórico reverte lote de origem e destino e não atualiza o store', async () => {
  const storage = new Memoria()
  const store = criarAppStore(criarMockApi(() => storage))
  await store.getState().inicializar()
  const antes = [storage.getItem(CHAVES_DADOS.lotes), storage.getItem(CHAVES_DADOS.movimentacoes)]
  const lotesAntes = store.getState().lotes
  storage.falharUmaVezEm = CHAVES_DADOS.movimentacoes
  assert.equal(await store.getState().registrarTransferencia(pedido), false)
  assert.match(store.getState().operacaoErro ?? '', /salvar a movimentação/)
  assert.deepEqual([storage.getItem(CHAVES_DADOS.lotes), storage.getItem(CHAVES_DADOS.movimentacoes)], antes)
  assert.equal(store.getState().lotes, lotesAntes)
})

test('base com transferência sem o lançamento de entrada é rejeitada na leitura', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  await api.registrarTransferencia(pedido)
  const movimentos = JSON.parse(storage.getItem(CHAVES_DADOS.movimentacoes)!) as { tipo: string }[]
  movimentos.pop()
  storage.setItem(CHAVES_DADOS.movimentacoes, JSON.stringify(movimentos))
  await assert.rejects(api.getDadosAplicacao(), /Dados locais inválidos/)
})
