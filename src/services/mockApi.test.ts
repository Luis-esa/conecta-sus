import assert from 'node:assert/strict'
import test from 'node:test'
import { addDays, differenceInCalendarDays, parseISO } from 'date-fns'
import { criarDadosIniciais } from '../data/seed.ts'
import { agregarEstoque } from '../utils/estoque.ts'
import { dadosSchema } from './dadosSchema.ts'
import { criarMockApi } from './mockApi.ts'
import { carregarDados, CHAVES_DADOS, type Armazenamento } from './persistencia.ts'

class Memoria implements Armazenamento {
  dados = new Map<string, string>()
  escritas = 0
  getItem(chave: string) { return this.dados.get(chave) ?? null }
  setItem(chave: string, valor: string) { this.escritas++; this.dados.set(chave, valor) }
  removeItem(chave: string) { this.dados.delete(chave) }
}

const agora = new Date(2026, 9, 6, 12)

test('seed tipado: contagens, referências, datas e cenários de demonstração', () => {
  const dados = dadosSchema.parse(criarDadosIniciais(agora))
  assert.equal(dados.usuarios.length, 7)
  assert.equal(dados.unidades.length, 5)
  assert.equal(dados.medicamentos.length, 20)
  assert.equal(dados.lotes.length, 23)
  assert.equal(dados.movimentacoes.length, 80)
  const estoque = agregarEstoque(dados.lotes)
  assert.equal(estoque.length, 22)
  assert.equal(estoque.find((item) => item.medicamentoId === 1 && item.unidadeId === 1)?.quantidade, 1000)
  assert.equal(estoque.find((item) => item.medicamentoId === 1 && item.unidadeId === 5)?.quantidade, 20)
  assert.equal(estoque.find((item) => item.medicamentoId === 2)?.quantidade, 80)
  assert.equal(estoque.find((item) => item.medicamentoId === 3)?.quantidade, 20)
  assert.equal(estoque.find((item) => item.medicamentoId === 5)?.quantidade, 150)
  const proximoVencimento = dados.lotes.find((lote) => lote.medicamentoId === 4)!
  assert.equal(differenceInCalendarDays(parseISO(proximoVencimento.dataValidade), agora), 45)
  assert.equal(dados.movimentacoes.filter((item) => item.medicamentoId === 20 && item.tipo === 'SAIDA').length, 0)
  assert.equal(new Set(dados.movimentacoes.filter((item) => item.tipo === 'SAIDA').map((item) => item.dataHora.slice(0, 7))).size, 3)
})

test('cada lote reconcilia entradas menos saídas, sem saldo negativo no histórico', () => {
  const dados = criarDadosIniciais(agora)
  for (const lote of dados.lotes) {
    let saldo = 0
    for (const movimento of dados.movimentacoes.filter((item) => item.loteId === lote.id)) {
      saldo += movimento.tipo === 'ENTRADA' ? movimento.quantidade : -movimento.quantidade
      assert.ok(saldo >= 0)
    }
    assert.equal(saldo, lote.quantidade)
  }
})

test('primeiro acesso salva apenas as coleções necessárias e preserva sessão/chaves externas', async () => {
  const storage = new Memoria()
  storage.setItem('outro_app', 'preservar')
  storage.setItem('conectasus_session', 'sessão existente')
  const api = criarMockApi(() => storage)
  await api.inicializarDados()
  assert.equal(storage.dados.size, 7)
  assert.equal(storage.getItem('outro_app'), 'preservar')
  assert.equal(storage.getItem('conectasus_session'), 'sessão existente')
  assert.equal((await api.getUsuarios()).length, 7)
  assert.equal((await api.getUnidades()).length, 5)
  assert.equal((await api.getMedicamentos()).length, 20)
  assert.equal((await api.getLotes()).length, 23)
  assert.equal((await api.getMovimentacoes()).length, 80)
})

test('reinicializar com outra data não altera conteúdo, datas ou quantidade de escritas', () => {
  const storage = new Memoria()
  carregarDados(storage, agora)
  const antes = [...storage.dados]
  const escritas = storage.escritas
  carregarDados(storage, addDays(agora, 60))
  assert.deepEqual([...storage.dados], antes)
  assert.equal(storage.escritas, escritas)
})

test('nova instância do serviço preserva edição persistida e devolve cópias independentes', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const medicamentos = await api.getMedicamentos()
  medicamentos[0].nome = 'Nome editado pelo usuário'
  storage.setItem(CHAVES_DADOS.medicamentos, JSON.stringify(medicamentos))
  const antes = [...storage.dados]
  const novaApi = criarMockApi(() => storage)
  await novaApi.inicializarDados()
  assert.deepEqual([...storage.dados], antes)
  const leitura = await novaApi.getMedicamentos()
  assert.equal(leitura[0].nome, 'Nome editado pelo usuário')
  leitura[0].nome = 'Alteração apenas em memória'
  assert.equal((await api.getMedicamentos())[0].nome, 'Nome editado pelo usuário')
})

test('estoque sempre soma os lotes persistidos, sem usar ou gravar saldo redundante', async () => {
  const storage = new Memoria()
  const api = criarMockApi(() => storage)
  const lotes = await api.getLotes()
  lotes[0].quantidade += 10
  storage.setItem(CHAVES_DADOS.lotes, JSON.stringify(lotes))
  storage.setItem('conectasus_estoque', 'cache antigo que não deve ser usado')
  const estoque = await api.getEstoque()
  assert.equal(estoque.find((item) => item.medicamentoId === 1 && item.unidadeId === 1)?.quantidade, 1010)
  assert.equal(storage.getItem('conectasus_estoque'), 'cache antigo que não deve ser usado')
  for (const saldo of estoque) {
    assert.equal(saldo.quantidade, lotes.filter((lote) => lote.medicamentoId === saldo.medicamentoId && lote.unidadeId === saldo.unidadeId).reduce((soma, lote) => soma + lote.quantidade, 0))
  }
})

test('coleções vazias existentes não são confundidas com primeira execução', async () => {
  const storage = new Memoria()
  for (const chave of Object.values(CHAVES_DADOS)) storage.setItem(chave, '[]')
  const api = criarMockApi(() => storage)
  await api.inicializarDados()
  assert.deepEqual(await api.getEstoque(), [])
  assert.deepEqual(await api.getMedicamentos(), [])
  assert.equal(storage.escritas, 5)
})

test('JSON inválido, schema inválido e base incompleta geram erro sem sobrescrever dados', async () => {
  for (const valor of ['{inválido', '{}', 'null']) {
    const storage = new Memoria()
    carregarDados(storage, agora)
    storage.setItem(CHAVES_DADOS.lotes, valor)
    const antes = [...storage.dados]
    await assert.rejects(criarMockApi(() => storage).getLotes(), /Dados locais inválidos/)
    assert.deepEqual([...storage.dados], antes)
  }
  const storage = new Memoria()
  storage.setItem(CHAVES_DADOS.usuarios, '[]')
  const antes = [...storage.dados]
  await assert.rejects(criarMockApi(() => storage).inicializarDados(), /incompletos/)
  assert.deepEqual([...storage.dados], antes)
})

test('IDs duplicados, saldo negativo e referências inválidas são rejeitados', () => {
  const duplicados = criarDadosIniciais(agora)
  duplicados.lotes[1].id = duplicados.lotes[0].id
  assert.equal(dadosSchema.safeParse(duplicados).success, false)
  const negativo = criarDadosIniciais(agora)
  negativo.lotes[0].quantidade = -1
  assert.equal(dadosSchema.safeParse(negativo).success, false)
  const referencia = criarDadosIniciais(agora)
  referencia.lotes[0].medicamentoId = 999
  assert.equal(dadosSchema.safeParse(referencia).success, false)
  const unidade = criarDadosIniciais(agora)
  unidade.usuarios[2].unidadeId = 999
  assert.equal(dadosSchema.safeParse(unidade).success, false)
})

test('falha de armazenamento reverte apenas chaves desta inicialização e permite tentar novamente', () => {
  const storage = new Memoria()
  storage.setItem('outro_app', 'preservar')
  const comFalha: Armazenamento = {
    getItem: (chave) => storage.getItem(chave),
    removeItem: (chave) => storage.removeItem(chave),
    setItem: (chave, valor) => {
      if (chave === CHAVES_DADOS.lotes) throw new Error('QuotaExceededError')
      storage.setItem(chave, valor)
    },
  }
  assert.throws(() => carregarDados(comFalha, agora), /Não foi possível salvar/)
  assert.deepEqual([...storage.dados], [['outro_app', 'preservar']])
  assert.equal(carregarDados(storage, agora).lotes.length, 23)
})

test('localStorage indisponível resulta em rejeição tratável pelo chamador', async () => {
  const api = criarMockApi(() => { throw new Error('Armazenamento bloqueado') })
  await assert.rejects(api.inicializarDados(), /Armazenamento bloqueado/)
})
