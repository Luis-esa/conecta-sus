import type { Estoque, Lote, Movimentacao, Unidade, Usuario } from '../types/index.ts'

/** Recorte de leitura usado pelas futuras telas da UBS. */
export function filtrarDadosDaUnidade(
  usuario: Usuario,
  dados: { unidades: readonly Unidade[]; lotes: readonly Lote[]; estoque: readonly Estoque[]; movimentacoes: readonly Movimentacao[] },
) {
  if (usuario.role !== 'UBS') return dados
  const unidadeId = usuario.unidadeId
  if (unidadeId === undefined) return { unidades: [], lotes: [], estoque: [], movimentacoes: [] }
  return {
    unidades: dados.unidades.filter((item) => item.id === unidadeId),
    lotes: dados.lotes.filter((item) => item.unidadeId === unidadeId),
    estoque: dados.estoque.filter((item) => item.unidadeId === unidadeId),
    movimentacoes: dados.movimentacoes.filter((item) => item.origemId === unidadeId || item.destinoId === unidadeId),
  }
}
