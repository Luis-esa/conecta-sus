import assert from 'node:assert/strict'
import test from 'node:test'
import { criarAuthApi } from './authApi.ts'
import { criarMockApi } from './mockApi.ts'
import type { Armazenamento } from './persistencia.ts'
import { criarAppStore } from '../stores/appStore.ts'

class Memoria implements Armazenamento {
  dados = new Map<string, string>()
  getItem(chave: string) { return this.dados.get(chave) ?? null }
  setItem(chave: string, valor: string) { this.dados.set(chave, valor) }
  removeItem(chave: string) { this.dados.delete(chave) }
}

test('admin cadastra, edita e inativa medicamento sem perder lotes e histórico', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const store = criarAppStore(api)
  await store.getState().inicializar()
  const movimentosAntes = store.getState().movimentacoes
  const lotesAntes = store.getState().lotes
  const cadastro = { nome: 'Teste 10 mg', principioAtivo: 'Teste', concentracao: '10 mg', formaFarmaceutica: 'Comprimido', unidadeMedida: 'Comprimido', codigo: 'NOVO001', estoqueMinimo: 10, estoqueMaximo: 50, ativo: true }
  assert.equal(await store.getState().salvarMedicamento(1, cadastro), true)
  const novo = store.getState().medicamentos.at(-1)!
  assert.equal(novo.id, 21)
  assert.equal(await store.getState().salvarMedicamento(1, { ...cadastro, nome: 'Teste 20 mg', ativo: false }, novo.id), true)
  assert.equal(store.getState().medicamentos.at(-1)?.ativo, false)
  assert.equal(store.getState().medicamentos.at(-1)?.nome, 'Teste 20 mg')
  assert.deepEqual(store.getState().lotes, lotesAntes)
  assert.deepEqual(store.getState().movimentacoes, movimentosAntes)
  assert.equal((await criarMockApi(() => storage).getMedicamentos()).at(-1)?.ativo, false)
  await assert.rejects(api.salvarMedicamento(2, cadastro), /Somente um administrador/)
  await assert.rejects(api.salvarMedicamento(1, { ...cadastro, codigo: 'MED001' }), /Código de medicamento/)
  await assert.rejects(api.salvarMedicamento(1, { ...cadastro, estoqueMaximo: 1 }), /máximo/)
})

test('unidades mantêm código único e vínculo UBS válido ao inativar', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const cadastro = { nome: 'UBS Nova', codigo: 'UBSNOVA', endereco: 'Rua A', status: 'ATIVA' as const }
  const dados = await api.salvarUnidade(1, cadastro)
  const nova = dados.unidades.at(-1)!
  assert.equal(nova.id, 6)
  assert.equal((await api.salvarUnidade(1, { ...cadastro, nome: 'UBS Atualizada' }, nova.id)).unidades.at(-1)?.nome, 'UBS Atualizada')
  await assert.rejects(api.salvarUnidade(1, { ...cadastro, codigo: 'UBS01' }), /Código de unidade/)
  await assert.rejects(api.salvarUnidade(1, { ...dados.unidades[0], status: 'INATIVA' }, 1), /usuários UBS vinculados/)
  assert.equal((await api.salvarUnidade(1, { ...cadastro, status: 'INATIVA' }, nova.id)).unidades.at(-1)?.status, 'INATIVA')
  assert.equal((await criarMockApi(() => storage).getUnidades()).at(-1)?.status, 'INATIVA')
})

test('admin gerencia usuário e perfil; sessão de inativo é rejeitada', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const cadastro = { nome: 'Responsável Novo', email: 'novo@conectasus.com', role: 'UBS' as const, unidadeId: 1, ativo: true }
  const novo = (await api.salvarUsuario(1, cadastro)).usuarios.at(-1)!
  const auth = criarAuthApi(api, () => storage)
  assert.equal((await auth.login(cadastro.email, '123456')).id, novo.id)
  const editado = (await api.salvarUsuario(1, { ...cadastro, role: 'GESTOR', unidadeId: undefined, ativo: false }, novo.id)).usuarios.at(-1)!
  assert.equal(editado.role, 'GESTOR')
  assert.equal(editado.unidadeId, undefined)
  assert.equal(await auth.restaurarSessao(), null)
  await assert.rejects(auth.login(cadastro.email, '123456'), /inválidos/)
  await assert.rejects(api.salvarUsuario(2, cadastro), /Somente um administrador/)
  await assert.rejects(api.salvarUsuario(1, { ...cadastro, email: 'ADMIN@conectasus.com' }), /E-mail já cadastrado/)
  await assert.rejects(api.salvarUsuario(1, { ...cadastro, email: 'outro@conectasus.com', unidadeId: 999 }), /unidade ativa/)
  await assert.rejects(api.salvarUsuario(1, { ...cadastro, email: 'outro@conectasus.com', unidadeId: undefined }), /Vincule uma unidade/)
  await assert.rejects(api.salvarUsuario(1, { ...cadastro, email: 'admin@conectasus.com', role: 'GESTOR', ativo: false }, 1), /próprio acesso/)
})

test('validade de lote pode ser corrigida sem alterar saldo ou movimentações', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const antes = await api.getDadosAplicacao()
  const alterado = await api.corrigirValidadeLote(1, 1, '2028-12-31')
  assert.equal(alterado.lotes.find((item) => item.id === 1)?.dataValidade, '2028-12-31')
  assert.deepEqual(alterado.lotes.map((item) => item.quantidade), antes.lotes.map((item) => item.quantidade))
  assert.deepEqual(alterado.movimentacoes, antes.movimentacoes)
  assert.equal((await criarMockApi(() => storage).getLotes()).find((item) => item.id === 1)?.dataValidade, '2028-12-31')
  await assert.rejects(api.corrigirValidadeLote(2, 1, '2028-12-31'), /Somente um administrador/)
  await assert.rejects(api.corrigirValidadeLote(1, 1, '2020-01-01'), /anterior à entrada/)
  await assert.rejects(api.corrigirValidadeLote(1, 999, '2028-12-31'), /não encontrado/)
})
