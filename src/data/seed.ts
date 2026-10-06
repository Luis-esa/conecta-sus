import { addDays, format, startOfMonth, subMonths } from 'date-fns'
import type { Lote, Movimentacao } from '../types/index.ts'
import { medicamentosIniciais, unidadesIniciais, usuariosIniciais } from './catalogo.ts'

/** Datas relativas apenas na primeira inicialização; IDs e cenários determinísticos. */
export function criarDadosIniciais(agora = new Date()) {
  const inicioMes = startOfMonth(agora)
  const entrada = addDays(subMonths(inicioMes, 4), 1)
  const dataEntrada = format(entrada, 'yyyy-MM-dd')
  const validade = (dias: number) => format(addDays(agora, dias), 'yyyy-MM-dd')
  const lotes: Lote[] = medicamentosIniciais.map((medicamento, index) => ({
    id: medicamento.id,
    medicamentoId: medicamento.id,
    numero: `DEMO-${String(medicamento.id).padStart(3, '0')}-A`,
    quantidade: [600, 80, 20][index] ?? 150,
    dataEntrada,
    dataValidade: validade(medicamento.id === 4 ? 45 : 365 + index * 3),
    unidadeId: (index % 5) + 1,
  }))

  lotes.push(
    { id: 21, medicamentoId: 1, numero: 'DEMO-001-B', quantidade: 400, dataEntrada, dataValidade: validade(240), unidadeId: 1 },
    { id: 22, medicamentoId: 1, numero: 'DEMO-001-C', quantidade: 20, dataEntrada, dataValidade: validade(365), unidadeId: 5 },
    { id: 23, medicamentoId: 1, numero: 'DEMO-001-D', quantidade: 150, dataEntrada, dataValidade: validade(365), unidadeId: 2 },
  )

  const movimentacoes: Movimentacao[] = []
  for (const lote of lotes) {
    // Três meses completos de consumo para os primeiros 19 lotes.
    // Ácido fólico (20) e lotes adicionais não têm saídas.
    const temConsumo = lote.id < 20
    movimentacoes.push({
      id: movimentacoes.length + 1,
      tipo: 'ENTRADA',
      medicamentoId: lote.medicamentoId,
      loteId: lote.id,
      quantidade: lote.quantidade + (temConsumo ? 45 : 0),
      destinoId: lote.unidadeId,
      usuarioId: 2,
      dataHora: entrada.toISOString(),
      motivo: 'Recebimento inicial de demonstração',
    })
    if (temConsumo) {
      for (const mesesAtras of [3, 2, 1]) {
        movimentacoes.push({
          id: movimentacoes.length + 1,
          tipo: 'SAIDA',
          medicamentoId: lote.medicamentoId,
          loteId: lote.id,
          quantidade: 15,
          origemId: lote.unidadeId,
          usuarioId: lote.unidadeId + 2,
          dataHora: addDays(subMonths(inicioMes, mesesAtras), 14).toISOString(),
          motivo: 'Consumo demonstrativo da unidade',
        })
      }
    }
  }

  return {
    usuarios: structuredClone(usuariosIniciais),
    unidades: structuredClone(unidadesIniciais),
    medicamentos: structuredClone(medicamentosIniciais),
    lotes,
    movimentacoes: movimentacoes.sort((a, b) => a.dataHora.localeCompare(b.dataHora) || a.id - b.id),
  }
}
