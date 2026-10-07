import type { Lote, Medicamento, Movimentacao, Unidade, Usuario } from '../types/index.ts'
import { filtrarDadosDaUnidade } from './escopo.ts'

export interface FiltrosHistorico {
  inicio: string
  fim: string
  medicamentoId: string
  unidadeId: string
  tipo: string
  usuarioId: string
}

export const filtrosHistoricoIniciais: FiltrosHistorico = { inicio: '', fim: '', medicamentoId: 'TODOS', unidadeId: 'TODAS', tipo: 'TODOS', usuarioId: 'TODOS' }

export interface LinhaHistorico {
  movimentacao: Movimentacao
  medicamento: string
  lote: string
  unidade: string
  origem: string
  destino: string
  usuario: string
}

/** Um evento por operação: os débitos/créditos internos da transferência ficam fora da lista. */
export function criarHistorico(dados: {
  movimentacoes: readonly Movimentacao[]
  medicamentos: readonly Medicamento[]
  lotes: readonly Lote[]
  unidades: readonly Unidade[]
  usuarios: readonly Usuario[]
}, usuarioAtual: Usuario): LinhaHistorico[] {
  const visiveis = filtrarDadosDaUnidade(usuarioAtual, { ...dados, estoque: [] }).movimentacoes
  const medicamentos = new Map(dados.medicamentos.map((item) => [item.id, item.nome]))
  const lotes = new Map(dados.lotes.map((item) => [item.id, item.numero]))
  const unidades = new Map(dados.unidades.map((item) => [item.id, item.nome]))
  const usuarios = new Map(dados.usuarios.map((item) => [item.id, item.nome]))
  return visiveis.filter((item) => item.transferenciaId === undefined)
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora) || b.id - a.id)
    .map((item) => ({
      movimentacao: item,
      medicamento: medicamentos.get(item.medicamentoId) ?? `Medicamento #${item.medicamentoId}`,
      lote: item.loteId === undefined ? '—' : lotes.get(item.loteId) ?? `Lote #${item.loteId}`,
      unidade: unidades.get((item.tipo === 'ENTRADA' ? item.destinoId : item.origemId) ?? -1) ?? '—',
      origem: item.origemId === undefined ? '—' : unidades.get(item.origemId) ?? '—',
      destino: item.destinoId === undefined ? '—' : unidades.get(item.destinoId) ?? '—',
      usuario: usuarios.get(item.usuarioId) ?? `Usuário #${item.usuarioId}`,
    }))
}

export function filtrarHistorico(linhas: readonly LinhaHistorico[], filtros: FiltrosHistorico): LinhaHistorico[] {
  return linhas.filter(({ movimentacao: item }) => {
    const data = item.dataHora.slice(0, 10)
    return (!filtros.inicio || data >= filtros.inicio)
      && (!filtros.fim || data <= filtros.fim)
      && (filtros.medicamentoId === 'TODOS' || item.medicamentoId === Number(filtros.medicamentoId))
      && (filtros.unidadeId === 'TODAS' || item.origemId === Number(filtros.unidadeId) || item.destinoId === Number(filtros.unidadeId))
      && (filtros.tipo === 'TODOS' || item.tipo === filtros.tipo)
      && (filtros.usuarioId === 'TODOS' || item.usuarioId === Number(filtros.usuarioId))
  })
}
