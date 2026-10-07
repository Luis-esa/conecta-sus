import { format } from 'date-fns'
import { agregarEstoque } from '../utils/estoque.ts'
import { carregarDados, salvarOperacao, type Armazenamento } from './persistencia.ts'
import { entradaSchema, saidaSchema, transferenciaSchema, type EntradaDados, type SaidaDados, type TransferenciaDados } from './movimentacaoSchema.ts'
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
      const { usuarios, unidades, medicamentos, lotes, movimentacoes } = ler()
      return { usuarios, unidades, medicamentos, lotes, movimentacoes }
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
      return { usuarios: salvos.usuarios, unidades: salvos.unidades, medicamentos: salvos.medicamentos, lotes: salvos.lotes, movimentacoes: salvos.movimentacoes }
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
      return { usuarios: salvos.usuarios, unidades: salvos.unidades, medicamentos: salvos.medicamentos, lotes: salvos.lotes, movimentacoes: salvos.movimentacoes }
    },
    async registrarTransferencia(input: TransferenciaDados) {
      const pedido = transferenciaSchema.parse(input)
      const storage = obterStorage()
      const dados = carregarDados(storage)
      const origem = dados.unidades.find((item) => item.id === pedido.origemId && item.status === 'ATIVA')
      const destino = dados.unidades.find((item) => item.id === pedido.destinoId && item.status === 'ATIVA')
      const medicamento = dados.medicamentos.find((item) => item.id === pedido.medicamentoId && item.ativo)
      const usuario = dados.usuarios.find((item) => item.id === pedido.usuarioId)
      if (!origem || !destino || !medicamento) throw new Error('Medicamento ou unidade indisponível para transferência.')
      validarAcesso(usuario, origem.id)
      const loteOrigem = dados.lotes.find((item) => item.id === pedido.loteId)
      if (!loteOrigem || loteOrigem.unidadeId !== origem.id || loteOrigem.medicamentoId !== medicamento.id) {
        throw new Error('Lote inexistente ou incompatível com o medicamento e a unidade de origem.')
      }
      if (pedido.quantidade > loteOrigem.quantidade) {
        throw new Error(`A quantidade solicitada é maior que o estoque disponível na origem. Disponível no lote: ${loteOrigem.quantidade}. Solicitado: ${pedido.quantidade}.`)
      }
      const loteDestinoExistente = dados.lotes.find((item) => item.unidadeId === destino.id && item.medicamentoId === medicamento.id && item.numero.toLowerCase() === loteOrigem.numero.toLowerCase())
      if (loteDestinoExistente && loteDestinoExistente.dataValidade !== loteOrigem.dataValidade) {
        throw new Error('O lote no destino possui a mesma identificação, mas validade diferente.')
      }
      const loteDestinoId = loteDestinoExistente?.id ?? proximoId(dados.lotes)
      const agora = new Date()
      const dataHora = agora.toISOString()
      const lotes: Lote[] = dados.lotes.map((item) => item.id === loteOrigem.id
        ? { ...item, quantidade: item.quantidade - pedido.quantidade }
        : item.id === loteDestinoId ? { ...item, quantidade: item.quantidade + pedido.quantidade } : item)
      if (!loteDestinoExistente) lotes.push({ id: loteDestinoId, medicamentoId: medicamento.id, numero: loteOrigem.numero, quantidade: pedido.quantidade, dataEntrada: format(agora, 'yyyy-MM-dd'), dataValidade: loteOrigem.dataValidade, unidadeId: destino.id })

      const transferenciaId = proximoId(dados.movimentacoes)
      const base = { medicamentoId: medicamento.id, quantidade: pedido.quantidade, usuarioId: usuario!.id, dataHora }
      const movimentacoes: Movimentacao[] = [
        ...dados.movimentacoes,
        { ...base, id: transferenciaId, tipo: 'TRANSFERENCIA', loteId: loteOrigem.id, origemId: origem.id, destinoId: destino.id, motivo: `Transferência de ${origem.nome} para ${destino.nome}` },
        { ...base, id: transferenciaId + 1, tipo: 'SAIDA', loteId: loteOrigem.id, origemId: origem.id, transferenciaId, motivo: `Transferência para ${destino.nome}` },
        { ...base, id: transferenciaId + 2, tipo: 'ENTRADA', loteId: loteDestinoId, destinoId: destino.id, transferenciaId, motivo: `Transferência de ${origem.nome}` },
      ]
      const salvos = salvarOperacao(storage, { ...dados, lotes, movimentacoes })
      return { usuarios: salvos.usuarios, unidades: salvos.unidades, medicamentos: salvos.medicamentos, lotes: salvos.lotes, movimentacoes: salvos.movimentacoes }
    },
  }
}

export const mockApi = criarMockApi()
