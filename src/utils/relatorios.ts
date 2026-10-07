import type { LinhaEstoque, LinhaLote } from './consultas.ts'
import type { LinhaHistorico } from './historico.ts'
import type { AnaliseConsumo } from './consumo.ts'

export function resumirRelatorios(dados: {
  estoque: readonly LinhaEstoque[]
  lotes: readonly LinhaLote[]
  movimentacoes: readonly LinhaHistorico[]
  consumo: readonly AnaliseConsumo[]
}) {
  const { estoque, lotes, movimentacoes, consumo } = dados
  const entradas = movimentacoes.filter((item) => item.movimentacao.tipo === 'ENTRADA')
  const saidas = movimentacoes.filter((item) => item.movimentacao.tipo === 'SAIDA')
  const transferencias = movimentacoes.filter((item) => item.movimentacao.tipo === 'TRANSFERENCIA')
  return {
    saldoTotal: estoque.reduce((total, item) => total + item.quantidade, 0),
    baixos: estoque.filter((item) => item.status === 'BAIXO').length,
    criticos: estoque.filter((item) => item.status === 'CRITICO').length,
    lotesAtencao: lotes.filter((item) => item.lote.quantidade > 0 && item.statusValidade !== 'REGULAR').length,
    entradas: entradas.length,
    saidas: saidas.length,
    transferencias: transferencias.length,
    quantidadeEntrada: entradas.reduce((total, item) => total + item.movimentacao.quantidade, 0),
    quantidadeSaida: saidas.reduce((total, item) => total + item.movimentacao.quantidade, 0),
    consumoComHistorico: consumo.filter((item) => item.situacao === 'SUFICIENTE').length,
  }
}

export function movimentosPorMes(linhas: readonly LinhaHistorico[]) {
  const meses = new Map<string, { mes: string; entradas: number; saidas: number; transferencias: number }>()
  for (const { movimentacao: item } of linhas) {
    const mes = item.dataHora.slice(0, 7)
    const registro = meses.get(mes) ?? { mes, entradas: 0, saidas: 0, transferencias: 0 }
    if (item.tipo === 'ENTRADA') registro.entradas += item.quantidade
    if (item.tipo === 'SAIDA') registro.saidas += item.quantidade
    if (item.tipo === 'TRANSFERENCIA') registro.transferencias += item.quantidade
    meses.set(mes, registro)
  }
  return [...meses.values()].sort((a, b) => a.mes.localeCompare(b.mes))
}
