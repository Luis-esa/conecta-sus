import { format } from 'date-fns'
import type { Alerta, Lote, Medicamento, Unidade, Usuario } from '../types/index.ts'
import { agregarEstoque, classificarEstoque } from './estoque.ts'
import { classificarValidade, diasParaVencer } from './validade.ts'

export interface AlertaAtual extends Alerta {
  severidade: 'CRITICA' | 'ATENCAO'
  loteId?: number
  quantidade: number
  estoqueMinimo?: number
  dataValidade?: string
}

export function gerarAlertas(dados: { unidades: readonly Unidade[]; medicamentos: readonly Medicamento[]; lotes: readonly Lote[] }, agora = new Date()): AlertaAtual[] {
  const unidades = new Map(dados.unidades.filter((item) => item.status === 'ATIVA').map((item) => [item.id, item]))
  const medicamentos = new Map(dados.medicamentos.filter((item) => item.ativo).map((item) => [item.id, item]))
  const data = format(agora, 'yyyy-MM-dd')
  const alertas: AlertaAtual[] = []

  for (const estoque of agregarEstoque(dados.lotes)) {
    const medicamento = medicamentos.get(estoque.medicamentoId)
    if (!unidades.has(estoque.unidadeId) || !medicamento) continue
    const situacao = classificarEstoque(estoque.quantidade, medicamento.estoqueMinimo)
    if (situacao === 'NORMAL') continue
    alertas.push({
      id: 0, tipo: situacao === 'CRITICO' ? 'ESTOQUE_CRITICO' : 'ESTOQUE_BAIXO',
      severidade: situacao === 'CRITICO' ? 'CRITICA' : 'ATENCAO',
      medicamentoId: medicamento.id, unidadeId: estoque.unidadeId, quantidade: estoque.quantidade,
      estoqueMinimo: medicamento.estoqueMinimo, data, status: 'ATIVO',
      mensagem: `${estoque.quantidade} em estoque; mínimo definido: ${medicamento.estoqueMinimo}.`,
    })
  }

  for (const lote of dados.lotes) {
    if (lote.quantidade <= 0 || !unidades.has(lote.unidadeId) || !medicamentos.has(lote.medicamentoId)) continue
    const validade = classificarValidade(lote.dataValidade, agora)
    if (validade === 'REGULAR') continue
    const dias = diasParaVencer(lote.dataValidade, agora)
    alertas.push({
      id: 0, tipo: 'VENCIMENTO', severidade: validade === 'VENCIDO' ? 'CRITICA' : 'ATENCAO',
      medicamentoId: lote.medicamentoId, unidadeId: lote.unidadeId, loteId: lote.id,
      quantidade: lote.quantidade, dataValidade: lote.dataValidade, data, status: 'ATIVO',
      mensagem: validade === 'VENCIDO' ? `Lote ${lote.numero} vencido há ${-dias} dia(s); ${lote.quantidade} unidades.` : `Lote ${lote.numero} vence em ${dias} dia(s); ${lote.quantidade} unidades.`,
    })
  }

  return alertas.sort((a, b) => Number(b.severidade === 'CRITICA') - Number(a.severidade === 'CRITICA') ||
    a.unidadeId - b.unidadeId || a.medicamentoId - b.medicamentoId || a.tipo.localeCompare(b.tipo) || (a.loteId ?? 0) - (b.loteId ?? 0))
    .map((alerta, index) => ({ ...alerta, id: index + 1 }))
}

export function filtrarAlertasDoUsuario(alertas: readonly AlertaAtual[], usuario: Usuario): AlertaAtual[] {
  return usuario.role === 'UBS' ? alertas.filter((item) => item.unidadeId === usuario.unidadeId) : [...alertas]
}
