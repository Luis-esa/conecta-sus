import { agregarEstoque } from '../utils/estoque.ts'
import { carregarDados, salvarOperacao, type Armazenamento } from './persistencia.ts'
import { entradaSchema, saidaSchema, type EntradaDados, type SaidaDados } from './movimentacaoSchema.ts'
import type { Lote, Movimentacao, Usuario } from '../types/index.ts'

function validarAcesso(usuario: Usuario | undefined, unidadeId: number) {
  if (!usuario?.ativo || (usuario.role === 'UBS' && usuario.unidadeId !== unidadeId)) {
    throw new Error('Usuário sem permissão para movimentar esta unidade.')
  }
}

function proximoId(registros: readonly { id: number }[]) {
  return Math.max(0, ...registros.map((item) => item.id)) + 1
}

function horarioMovimentacao(data: string) {
  return new Date(`${data}T12:00:00`).toISOString()
}

/** Ponto de acesso dos futuros stores. A fábrica permite testar sem tocar no navegador. */
export function criarMockApi(obterStorage: () => Armazenamento = () => window.localStorage) {
  const ler = () => carregarDados(obterStorage())

  return {
    async getDadosAplicacao() {
      const { unidades, medicamentos, lotes, movimentacoes } = ler()
      return { unidades, medicamentos, lotes, movimentacoes }
    },
    async inicializarDados(): Promise<void> { ler() },
    async getUsuarios() { return ler().usuarios },
    async getUnidades() { return ler().unidades },
    async getMedicamentos() { return ler().medicamentos },
    async getLotes() { return ler().lotes },
    async getEstoque() { return agregarEstoque(ler().lotes) },
    async getMovimentacoes() { return ler().movimentacoes },
    async registrarEntrada(input: EntradaDados) {
      const dadosEntrada = entradaSchema.parse(input)
      const storage = obterStorage()
      const dados = carregarDados(storage)
      const unidade = dados.unidades.find((item) => item.id === dadosEntrada.unidadeId && item.status === 'ATIVA')
      const medicamento = dados.medicamentos.find((item) => item.id === dadosEntrada.medicamentoId && item.ativo)
      const usuario = dados.usuarios.find((item) => item.id === dadosEntrada.usuarioId)
      if (!unidade || !medicamento) throw new Error('Medicamento ou unidade indisponível para entrada.')
      validarAcesso(usuario, unidade.id)
      if (dadosEntrada.dataValidade < dadosEntrada.data) throw new Error('A validade do lote não pode ser anterior à data da entrada.')

      let lote: Lote | undefined
      if (dadosEntrada.loteId !== undefined) {
        lote = dados.lotes.find((item) => item.id === dadosEntrada.loteId)
        if (!lote || lote.unidadeId !== unidade.id || lote.medicamentoId !== medicamento.id) throw new Error('Lote incompatível com o medicamento ou a unidade.')
        if (lote.numero.toLowerCase() !== dadosEntrada.numeroLote.toLowerCase() || lote.dataValidade !== dadosEntrada.dataValidade) throw new Error('Número ou validade diferente do lote selecionado.')
      } else {
        if (dados.lotes.some((item) => item.unidadeId === unidade.id && item.medicamentoId === medicamento.id && item.numero.toLowerCase() === dadosEntrada.numeroLote.toLowerCase())) {
          throw new Error('Este lote já existe nesta unidade. Selecione o lote cadastrado.')
        }
      }

      const loteId = lote?.id ?? proximoId(dados.lotes)
      const lotes = lote
        ? dados.lotes.map((item) => item.id === loteId ? { ...item, quantidade: item.quantidade + dadosEntrada.quantidade } : item)
        : [...dados.lotes, { id: loteId, medicamentoId: medicamento.id, numero: dadosEntrada.numeroLote, quantidade: dadosEntrada.quantidade, dataEntrada: dadosEntrada.data, dataValidade: dadosEntrada.dataValidade, unidadeId: unidade.id }]
      const movimentacao: Movimentacao = {
        id: proximoId(dados.movimentacoes), tipo: 'ENTRADA', medicamentoId: medicamento.id, loteId,
        quantidade: dadosEntrada.quantidade, destinoId: unidade.id, usuarioId: usuario!.id,
        dataHora: horarioMovimentacao(dadosEntrada.data), motivo: `Origem: ${dadosEntrada.origem}`,
        observacao: dadosEntrada.observacao?.trim() || undefined,
      }
      const salvos = salvarOperacao(storage, { ...dados, lotes, movimentacoes: [...dados.movimentacoes, movimentacao] })
      return { unidades: salvos.unidades, medicamentos: salvos.medicamentos, lotes: salvos.lotes, movimentacoes: salvos.movimentacoes }
    },
    async registrarSaida(input: SaidaDados) {
      const dadosSaida = saidaSchema.parse(input)
      const storage = obterStorage()
      const dados = carregarDados(storage)
      const unidade = dados.unidades.find((item) => item.id === dadosSaida.unidadeId && item.status === 'ATIVA')
      const medicamento = dados.medicamentos.find((item) => item.id === dadosSaida.medicamentoId && item.ativo)
      const usuario = dados.usuarios.find((item) => item.id === dadosSaida.usuarioId)
      if (!unidade || !medicamento) throw new Error('Medicamento ou unidade indisponível para saída.')
      validarAcesso(usuario, unidade.id)
      const lote = dados.lotes.find((item) => item.id === dadosSaida.loteId)
      if (!lote || lote.unidadeId !== unidade.id || lote.medicamentoId !== medicamento.id) throw new Error('Lote incompatível com o medicamento ou a unidade.')
      if (dadosSaida.quantidade > lote.quantidade) {
        throw new Error(`A quantidade solicitada é maior que o estoque disponível. Disponível no lote: ${lote.quantidade}. Solicitado: ${dadosSaida.quantidade}.`)
      }
      const lotes = dados.lotes.map((item) => item.id === lote.id ? { ...item, quantidade: item.quantidade - dadosSaida.quantidade } : item)
      const movimentacao: Movimentacao = {
        id: proximoId(dados.movimentacoes), tipo: 'SAIDA', medicamentoId: medicamento.id, loteId: lote.id,
        quantidade: dadosSaida.quantidade, origemId: unidade.id, usuarioId: usuario!.id,
        dataHora: horarioMovimentacao(dadosSaida.data), motivo: dadosSaida.destinoMotivo,
        observacao: dadosSaida.observacao?.trim() || undefined,
      }
      const salvos = salvarOperacao(storage, { ...dados, lotes, movimentacoes: [...dados.movimentacoes, movimentacao] })
      return { unidades: salvos.unidades, medicamentos: salvos.medicamentos, lotes: salvos.lotes, movimentacoes: salvos.movimentacoes }
    },
  }
}

// Transferências serão acrescentadas na etapa própria, usando a mesma persistência.
export const mockApi = criarMockApi()
