import assert from 'node:assert/strict'
import test from 'node:test'
import { criarMockApi } from '../services/mockApi.ts'
import { CHAVES_DADOS, type Armazenamento } from '../services/persistencia.ts'
import { criarAppStore } from './appStore.ts'
import { selecionarEstoque } from './appSelectors.ts'

class Memoria implements Armazenamento {
  dados = new Map<string, string>()
  escritas = 0
  getItem(chave: string) { return this.dados.get(chave) ?? null }
  setItem(chave: string, valor: string) { this.escritas++; this.dados.set(chave, valor) }
  removeItem(chave: string) { this.dados.delete(chave) }
}

test('inicialização concorrente compartilha leitura, publica loading e não reinicializa após sucesso', async () => {
  const api = criarMockApi(() => new Memoria())
  let leituras = 0
  let liberar!: () => void
  const espera = new Promise<void>((resolve) => { liberar = resolve })
  const store = criarAppStore({
    async getDadosAplicacao() {
      leituras++
      await espera
      return api.getDadosAplicacao()
    },
  })
  const estados: boolean[] = []
  const cancelar = store.subscribe((state) => estados.push(state.carregando))
  const primeira = store.getState().inicializar()
  assert.equal(store.getState().carregando, true)
  assert.equal(store.getState().dadosCarregados, false)
  assert.equal(store.getState().inicializar(), primeira)
  assert.equal(store.getState().recarregar(), primeira)
  liberar()
  await primeira
  await store.getState().inicializar()
  assert.equal(leituras, 1)
  assert.equal(store.getState().dadosCarregados, true)
  assert.equal(store.getState().erro, null)
  assert.equal(store.getState().unidades.length, 5)
  assert.equal(store.getState().medicamentos.length, 20)
  assert.equal(store.getState().lotes.length, 23)
  assert.equal(store.getState().movimentacoes.length, 80)
  assert.ok(store.getState().alertas && store.getState().alertas!.length > 0)
  assert.equal(store.getState().sugestoes, null)
  assert.equal(estados[0], true)
  assert.equal(estados.at(-1), false)
  cancelar()
})

test('recarregar consulta o serviço; novo store preserva dados e datas persistidos', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const store = criarAppStore(api)
  await store.getState().inicializar()
  const lotes = await api.getLotes()
  lotes[0].quantidade += 10
  storage.setItem(CHAVES_DADOS.lotes, JSON.stringify(lotes))
  const registros = [...storage.dados]
  const escritas = storage.escritas
  await store.getState().recarregar()
  const novoStore = criarAppStore(criarMockApi(() => storage))
  await novoStore.getState().inicializar()
  assert.deepEqual(novoStore.getState().lotes, lotes)
  assert.deepEqual(store.getState().lotes, lotes)
  assert.deepEqual([...storage.dados], registros)
  assert.equal(storage.escritas, escritas)
  assert.equal(selecionarEstoque(novoStore.getState()).find((item) => item.medicamentoId === 1 && item.unidadeId === 1)?.quantidade, 1010)
})

test('falha inicial é representada e permite tentativa explícita sem apagar persistência', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  await api.inicializarDados()
  const original = storage.getItem(CHAVES_DADOS.lotes)!
  storage.setItem(CHAVES_DADOS.lotes, '{inválido')
  const store = criarAppStore(api)
  await store.getState().inicializar()
  assert.equal(store.getState().carregando, false)
  assert.equal(store.getState().dadosCarregados, false)
  assert.match(store.getState().erro!, /Não foi possível carregar/)
  assert.equal(storage.getItem(CHAVES_DADOS.lotes), '{inválido')
  storage.setItem(CHAVES_DADOS.lotes, original)
  await store.getState().recarregar()
  assert.equal(store.getState().dadosCarregados, true)
  assert.equal(store.getState().erro, null)
})

test('falha na atualização mantém último conjunto válido e selector de estoque estável', async () => {
  const storage = new Memoria()
  const store = criarAppStore(criarMockApi(() => storage))
  await store.getState().inicializar()
  const anterior = store.getState()
  const estoque = selecionarEstoque(anterior)
  assert.equal(estoque.length, 22)
  assert.equal(selecionarEstoque(anterior), estoque)
  storage.removeItem(CHAVES_DADOS.unidades)
  await store.getState().recarregar()
  assert.equal(store.getState().dadosCarregados, true)
  assert.ok(store.getState().erro)
  assert.equal(store.getState().carregando, false)
  assert.equal(store.getState().unidades, anterior.unidades)
  assert.equal(store.getState().lotes, anterior.lotes)
  assert.equal(selecionarEstoque(store.getState()), estoque)
})

test('base persistida vazia é carregada com sucesso e selector recalcula após nova leitura', async () => {
  const storage = new Memoria()
  const store = criarAppStore(criarMockApi(() => storage))
  await store.getState().inicializar()
  const anterior = selecionarEstoque(store.getState())
  for (const chave of Object.values(CHAVES_DADOS)) storage.setItem(chave, '[]')
  await store.getState().recarregar()
  assert.equal(store.getState().dadosCarregados, true)
  assert.deepEqual(selecionarEstoque(store.getState()), [])
  assert.deepEqual(store.getState().alertas, [])
  assert.notEqual(selecionarEstoque(store.getState()), anterior)
})
