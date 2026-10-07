import assert from 'node:assert/strict'
import test from 'node:test'
import { criarDadosIniciais } from '../data/seed.ts'
import { filtrarDadosDaUnidade } from '../utils/escopo.ts'
import { agregarEstoque } from '../utils/estoque.ts'
import { podeAcessar } from '../routes/permissoes.ts'
import { criarAuthStore } from '../stores/authStore.ts'
import { CHAVE_SESSAO, criarAuthApi } from './authApi.ts'
import type { Armazenamento } from './persistencia.ts'

class Memoria implements Armazenamento {
  dados = new Map<string, string>()
  getItem(chave: string) { return this.dados.get(chave) ?? null }
  setItem(chave: string, valor: string) { this.dados.set(chave, valor) }
  removeItem(chave: string) { this.dados.delete(chave) }
}

const dados = criarDadosIniciais(new Date(2026, 9, 6))
const usuariosApi = { getUsuarios: async () => dados.usuarios }

test('ADMIN, GESTOR e UBS entram, restauram sessão e saem', async () => {
  for (const [email, role] of [
    ['admin@conectasus.com', 'ADMIN'],
    ['gestor@conectasus.com', 'GESTOR'],
    ['ubs01@conectasus.com', 'UBS'],
  ] as const) {
    const storage = new Memoria()
    const api = criarAuthApi(usuariosApi, () => storage)
    const store = criarAuthStore(api)
    await store.getState().inicializar()
    assert.equal(store.getState().isAuthenticated, false)
    assert.equal(await store.getState().login(email, '123456'), true)
    assert.equal(store.getState().usuarioAtual?.role, role)
    if (role === 'UBS') assert.equal(store.getState().usuarioAtual?.unidadeId, 1)
    assert.deepEqual(JSON.parse(storage.getItem(CHAVE_SESSAO)!), { usuarioId: store.getState().usuarioAtual?.id })

    const aposRefresh = criarAuthStore(criarAuthApi(usuariosApi, () => storage))
    await aposRefresh.getState().inicializar()
    assert.equal(aposRefresh.getState().usuarioAtual?.email, email)
    assert.equal(aposRefresh.getState().isAuthenticated, true)
    assert.equal(aposRefresh.getState().logout(), true)
    assert.equal(storage.getItem(CHAVE_SESSAO), null)
    assert.equal(aposRefresh.getState().isAuthenticated, false)
  }
})

test('rejeita credenciais inválidas e elimina sessão sem usuário ativo', async () => {
  const storage = new Memoria()
  const api = criarAuthApi(usuariosApi, () => storage)
  const store = criarAuthStore(api)
  assert.equal(await store.getState().login('admin@conectasus.com', 'incorreta'), false)
  assert.match(store.getState().erro ?? '', /inválidos/)
  assert.equal(storage.getItem(CHAVE_SESSAO), null)
  storage.setItem(CHAVE_SESSAO, JSON.stringify({ usuarioId: 999 }))
  await store.getState().inicializar()
  assert.equal(store.getState().isAuthenticated, false)
  assert.equal(storage.getItem(CHAVE_SESSAO), null)
})

test('perfis delimitam menu e rotas; dados da UBS ficam na própria unidade', () => {
  const admin = dados.usuarios.find((item) => item.role === 'ADMIN')!
  const gestor = dados.usuarios.find((item) => item.role === 'GESTOR')!
  const ubs = dados.usuarios.find((item) => item.email === 'ubs01@conectasus.com')!
  assert.equal(podeAcessar(admin, '/usuarios'), true)
  assert.equal(podeAcessar(gestor, '/usuarios'), false)
  assert.equal(podeAcessar(gestor, '/relatorios'), true)
  assert.equal(podeAcessar(ubs, '/relatorios'), false)
  assert.equal(podeAcessar(ubs, '/historico'), true)
  assert.equal(podeAcessar({ ...ubs, unidadeId: undefined }, '/estoque'), false)

  const visiveis = filtrarDadosDaUnidade(ubs, {
    unidades: dados.unidades,
    lotes: dados.lotes,
    estoque: agregarEstoque(dados.lotes),
    movimentacoes: dados.movimentacoes,
  })
  assert.deepEqual(visiveis.unidades.map((item) => item.id), [ubs.unidadeId])
  assert.ok(visiveis.lotes.length > 0)
  assert.ok(visiveis.lotes.every((item) => item.unidadeId === ubs.unidadeId))
  assert.ok(visiveis.estoque.every((item) => item.unidadeId === ubs.unidadeId))
  assert.ok(visiveis.movimentacoes.every((item) => item.origemId === ubs.unidadeId || item.destinoId === ubs.unidadeId))
})
