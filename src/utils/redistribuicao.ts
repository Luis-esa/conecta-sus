import type { Estoque, Medicamento, SugestaoRedistribuicao, Unidade } from '../types/index.ts'

export interface SugestaoDetalhada extends SugestaoRedistribuicao {
  estoqueOrigem: number
  estoqueDestino: number
  estoqueMinimo: number
}

/** Sugestões derivadas dos saldos; cada unidade de origem só oferece seu excedente uma vez. */
export function gerarSugestoesRedistribuicao(dados: {
  unidades: readonly Unidade[]
  medicamentos: readonly Medicamento[]
  estoque: readonly Estoque[]
}): SugestaoDetalhada[] {
  const unidades = dados.unidades.filter((item) => item.status === 'ATIVA').sort((a, b) => a.id - b.id)
  const saldos = new Map(dados.estoque.map((item) => [`${item.medicamentoId}:${item.unidadeId}`, item.quantidade]))
  const sugestoes: SugestaoDetalhada[] = []

  for (const medicamento of dados.medicamentos.filter((item) => item.ativo && item.estoqueMinimo > 0)) {
    const minimo = medicamento.estoqueMinimo
    const estoque = (unidadeId: number) => saldos.get(`${medicamento.id}:${unidadeId}`) ?? 0
    // Reservar ao menos 2× o mínimo na origem, mantendo o critério estrito de excesso.
    const origens = unidades.map((unidade) => ({ unidade, saldo: estoque(unidade.id), disponivel: Math.max(0, Math.floor(estoque(unidade.id) - 2 * minimo)) }))
      .filter((item) => item.saldo > 2 * minimo && item.disponivel > 0)
      .sort((a, b) => b.disponivel - a.disponivel || a.unidade.id - b.unidade.id)
    const destinos = unidades.map((unidade) => ({ unidade, saldo: estoque(unidade.id), falta: Math.ceil(minimo - estoque(unidade.id)) }))
      .filter((item) => item.saldo < minimo)
      .sort((a, b) => a.saldo - b.saldo || a.unidade.id - b.unidade.id)

    for (const destino of destinos) {
      for (const origem of origens) {
        if (destino.falta <= 0) break
        if (origem.unidade.id === destino.unidade.id || origem.disponivel <= 0) continue
        const quantidadeSugerida = Math.min(origem.disponivel, destino.falta)
        if (quantidadeSugerida <= 0) continue
        sugestoes.push({
          id: sugestoes.length + 1, medicamentoId: medicamento.id,
          origemId: origem.unidade.id, destinoId: destino.unidade.id,
          estoqueOrigem: origem.saldo, estoqueDestino: destino.saldo,
          estoqueMinimo: minimo, quantidadeSugerida,
          motivo: `A origem possui mais que o dobro do mínimo e o destino está abaixo do mínimo de ${minimo}.`,
          status: 'PENDENTE',
        })
        origem.disponivel -= quantidadeSugerida
        destino.falta -= quantidadeSugerida
      }
    }
  }
  return sugestoes
}
