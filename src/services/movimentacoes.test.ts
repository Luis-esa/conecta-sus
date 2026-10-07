import assert from 'node:assert/strict'
import test from 'node:test'
import { criarAppStore } from '../stores/appStore.ts'
import { agregarEstoque } from '../utils/estoque.ts'
import { calcularDashboard } from '../utils/dashboard.ts'
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

const data = '2026-10-06'

test('entrada existente aumenta lote/estoque, cria histórico, atualiza store e persiste no refresh', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const store = criarAppStore(api)
  await store.getState().inicializar()
  const loteAntes = store.getState().lotes.find((item) => item.id === 1)!
  const estoqueAntes = agregarEstoque(store.getState().lotes).find((item) => item.medicamentoId === 1 && item.unidadeId === 1)!.quantidade
  const movimentosAntes = store.getState().movimentacoes.length

  assert.equal(await store.getState().registrarEntrada({ medicamentoId: 1, unidadeId: 1, loteId: 1, numeroLote: loteAntes.numero, quantidade: 50, dataValidade: loteAntes.dataValidade, origem: 'Almoxarifado municipal', data, observacao: 'Reposição', usuarioId: 2 }), true)
  assert.equal(store.getState().operacaoErro, null)
  assert.equal(store.getState().lotes.find((item) => item.id === 1)?.quantidade, loteAntes.quantidade + 50)
  assert.equal(agregarEstoque(store.getState().lotes).find((item) => item.medicamentoId === 1 && item.unidadeId === 1)?.quantidade, estoqueAntes + 50)
  assert.equal(store.getState().movimentacoes.length, movimentosAntes + 1)
  assert.equal(store.getState().movimentacoes.at(-1)?.tipo, 'ENTRADA')
  assert.equal(store.getState().movimentacoes.at(-1)?.loteId, 1)
  assert.match(store.getState().movimentacoes.at(-1)?.motivo ?? '', /Almoxarifado municipal/)

  const recarregado = criarMockApi(() => storage)
  assert.equal((await recarregado.getLotes()).find((item) => item.id === 1)?.quantidade, loteAntes.quantidade + 50)
  assert.equal((await recarregado.getMovimentacoes()).length, movimentosAntes + 1)
  const painel = calcularDashboard({ ...store.getState(), estoque: agregarEstoque(store.getState().lotes) }, (await recarregado.getUsuarios()).find((item) => item.id === 2)!, new Date(2026, 9, 6))
  assert.equal(painel.movimentacoes[0]?.tipo, 'ENTRADA')
})

test('saída válida reduz lote/estoque, cria histórico e persiste; excesso e quantidades não positivas não alteram dados', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  await api.inicializarDados()
  const loteAntes = (await api.getLotes()).find((item) => item.id === 3)!
  const movimentosAntes = (await api.getMovimentacoes()).length
  const saida = { medicamentoId: 3, unidadeId: 3, loteId: 3, quantidade: 5, destinoMotivo: 'Dispensação ao paciente', data, observacao: 'Receita conferida', usuarioId: 5 }
  await api.registrarSaida(saida)
  assert.equal((await api.getLotes()).find((item) => item.id === 3)?.quantidade, loteAntes.quantidade - 5)
  assert.equal((await api.getEstoque()).find((item) => item.medicamentoId === 3 && item.unidadeId === 3)?.quantidade, loteAntes.quantidade - 5)
  assert.equal((await api.getMovimentacoes()).length, movimentosAntes + 1)
  assert.equal((await api.getMovimentacoes()).at(-1)?.tipo, 'SAIDA')
  const antesFalhas = [storage.getItem(CHAVES_DADOS.lotes), storage.getItem(CHAVES_DADOS.movimentacoes)]
  await assert.rejects(api.registrarSaida({ ...saida, quantidade: loteAntes.quantidade }), /maior que o estoque disponível/)
  await assert.rejects(api.registrarSaida({ ...saida, quantidade: 0 }), /maior que zero/)
  await assert.rejects(api.registrarSaida({ ...saida, quantidade: -1 }), /maior que zero/)
  assert.deepEqual([storage.getItem(CHAVES_DADOS.lotes), storage.getItem(CHAVES_DADOS.movimentacoes)], antesFalhas)
  assert.equal((await criarMockApi(() => storage).getMovimentacoes()).length, movimentosAntes + 1)
})

test('entrada cria lote novo e impede lote duplicado, referência inválida ou unidade fora do perfil UBS', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  await api.inicializarDados()
  const entrada = { medicamentoId: 2, unidadeId: 1, numeroLote: 'NOVO-001', quantidade: 25, dataValidade: '2027-12-31', origem: 'Almoxarifado', data, usuarioId: 3 }
  const antes = (await api.getLotes()).length
  await api.registrarEntrada(entrada)
  assert.equal((await api.getLotes()).length, antes + 1)
  assert.equal((await api.getLotes()).at(-1)?.numero, 'NOVO-001')
  await assert.rejects(api.registrarEntrada(entrada), /já existe/)
  await assert.rejects(api.registrarEntrada({ ...entrada, unidadeId: 2 }), /sem permissão/)
  await assert.rejects(api.registrarEntrada({ ...entrada, loteId: 999 }), /Lote incompatível/)
})

test('falha na gravação do histórico restaura lotes e não publica sucesso no store', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const store = criarAppStore(api)
  await store.getState().inicializar()
  const lote = store.getState().lotes.find((item) => item.id === 1)!
  const antes = [storage.getItem(CHAVES_DADOS.lotes), storage.getItem(CHAVES_DADOS.movimentacoes)]
  storage.falharUmaVezEm = CHAVES_DADOS.movimentacoes
  assert.equal(await store.getState().registrarEntrada({ medicamentoId: 1, unidadeId: 1, loteId: 1, numeroLote: lote.numero, quantidade: 10, dataValidade: lote.dataValidade, origem: 'Teste', data, usuarioId: 2 }), false)
  assert.match(store.getState().operacaoErro ?? '', /salvar a movimentação/)
  assert.deepEqual([storage.getItem(CHAVES_DADOS.lotes), storage.getItem(CHAVES_DADOS.movimentacoes)], antes)
  assert.equal(store.getState().lotes.find((item) => item.id === 1)?.quantidade, lote.quantidade)
})
