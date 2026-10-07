import type { Estoque, Lote, Medicamento, StatusEstoque, Unidade, Usuario } from '../types/index.ts'
import { filtrarDadosDaUnidade } from './escopo.ts'
import { classificarEstoque } from './estoque.ts'
import { classificarValidade, type StatusValidade } from './validade.ts'

export interface DadosConsulta {
  unidades: readonly Unidade[]
  medicamentos: readonly Medicamento[]
  lotes: readonly Lote[]
  estoque: readonly Estoque[]
}

export interface LinhaEstoque {
  medicamento: Medicamento
  unidade: Unidade
  quantidade: number
  lotes: readonly Lote[]
  proximaValidade: string | null
  statusValidade: StatusValidade | 'SEM_SALDO'
  status: StatusEstoque
}

export interface LinhaLote {
  lote: Lote
  medicamento: Medicamento
  unidade: Unidade
  statusValidade: StatusValidade
}

export interface LinhaMedicamento {
  medicamento: Medicamento
  unidadesComLote: readonly Unidade[]
}

export interface FiltrosEstoque {
  busca: string
  unidadeId: string
  status: string
  validade: string
}

export interface FiltrosLotes {
  busca: string
  unidadeId: string
  validade: string
}

export interface FiltrosMedicamentos {
  busca: string
  situacao: string
}

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function correspondeBusca(busca: string, ...valores: string[]) {
  const termo = normalizar(busca)
  return !termo || valores.some((valor) => normalizar(valor).includes(termo))
}

export function criarConsultas(dados: DadosConsulta, usuario: Usuario, agora = new Date()) {
  const visiveis = filtrarDadosDaUnidade(usuario, { ...dados, movimentacoes: [] })
  const medicamentosPorId = new Map(dados.medicamentos.map((item) => [item.id, item]))
  const unidadesPorId = new Map(visiveis.unidades.map((item) => [item.id, item]))
  const lotesPorChave = new Map<string, Lote[]>()
  for (const lote of visiveis.lotes) {
    const chave = `${lote.unidadeId}:${lote.medicamentoId}`
    const lista = lotesPorChave.get(chave) ?? []
    lista.push(lote)
    lotesPorChave.set(chave, lista)
  }

  const estoque: LinhaEstoque[] = visiveis.estoque.flatMap((saldo) => {
    const medicamento = medicamentosPorId.get(saldo.medicamentoId)
    const unidade = unidadesPorId.get(saldo.unidadeId)
    if (!medicamento || !unidade) return []
    const lotes = lotesPorChave.get(`${saldo.unidadeId}:${saldo.medicamentoId}`) ?? []
    const proximaValidade = lotes.filter((item) => item.quantidade > 0).map((item) => item.dataValidade).sort()[0] ?? null
    return [{ medicamento, unidade, quantidade: saldo.quantidade, lotes, proximaValidade,
      statusValidade: proximaValidade ? classificarValidade(proximaValidade, agora) : 'SEM_SALDO' as const,
      status: classificarEstoque(saldo.quantidade, medicamento.estoqueMinimo) }]
  }).sort((a, b) => a.medicamento.nome.localeCompare(b.medicamento.nome, 'pt-BR') || a.unidade.nome.localeCompare(b.unidade.nome, 'pt-BR'))

  const lotes: LinhaLote[] = visiveis.lotes.flatMap((lote) => {
    const medicamento = medicamentosPorId.get(lote.medicamentoId)
    const unidade = unidadesPorId.get(lote.unidadeId)
    return medicamento && unidade ? [{ lote, medicamento, unidade, statusValidade: classificarValidade(lote.dataValidade, agora) }] : []
  }).sort((a, b) => a.lote.dataValidade.localeCompare(b.lote.dataValidade) || a.lote.id - b.lote.id)

  const idsVisiveis = new Set(visiveis.lotes.map((item) => item.medicamentoId))
  const medicamentos: LinhaMedicamento[] = dados.medicamentos
    .filter((item) => usuario.role !== 'UBS' || idsVisiveis.has(item.id))
    .map((medicamento) => ({ medicamento,
      unidadesComLote: visiveis.unidades.filter((unidade) => visiveis.lotes.some((lote) => lote.medicamentoId === medicamento.id && lote.unidadeId === unidade.id)),
    }))
    .sort((a, b) => a.medicamento.nome.localeCompare(b.medicamento.nome, 'pt-BR'))

  return { unidades: visiveis.unidades, estoque, lotes, medicamentos }
}

export function filtrarEstoque(linhas: readonly LinhaEstoque[], filtros: FiltrosEstoque) {
  return linhas.filter((linha) =>
    correspondeBusca(filtros.busca, linha.medicamento.nome, linha.medicamento.principioAtivo, linha.medicamento.codigo, ...linha.lotes.map((item) => item.numero))
    && (filtros.unidadeId === 'TODAS' || linha.unidade.id === Number(filtros.unidadeId))
    && (filtros.status === 'TODOS' || linha.status === filtros.status)
    && (filtros.validade === 'TODAS' || linha.statusValidade === filtros.validade))
}

export function filtrarLotes(linhas: readonly LinhaLote[], filtros: FiltrosLotes) {
  return linhas.filter((linha) =>
    correspondeBusca(filtros.busca, linha.medicamento.nome, linha.medicamento.principioAtivo, linha.medicamento.codigo, linha.lote.numero)
    && (filtros.unidadeId === 'TODAS' || linha.unidade.id === Number(filtros.unidadeId))
    && (filtros.validade === 'TODAS' || linha.statusValidade === filtros.validade))
}

export function filtrarMedicamentos(linhas: readonly LinhaMedicamento[], filtros: FiltrosMedicamentos) {
  return linhas.filter((linha) => correspondeBusca(filtros.busca, linha.medicamento.nome, linha.medicamento.principioAtivo, linha.medicamento.codigo)
    && (filtros.situacao === 'TODOS' || (filtros.situacao === 'ATIVO') === linha.medicamento.ativo))
}
