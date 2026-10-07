import { format, parseISO } from 'date-fns'
import type { Estoque, Lote, Medicamento, Movimentacao, Unidade, Usuario } from '../types/index.ts'
import { filtrarDadosDaUnidade } from './escopo.ts'
import { classificarEstoque } from './estoque.ts'
import { exigeAtencaoValidade } from './validade.ts'

export interface DadosDashboard {
  unidades: readonly Unidade[]
  medicamentos: readonly Medicamento[]
  lotes: readonly Lote[]
  estoque: readonly Estoque[]
  movimentacoes: readonly Movimentacao[]
}

export interface ResumoUnidade {
  id: number
  nome: string
  medicamentos: number
  baixos: number
  criticos: number
  vencimentos: number
  status: 'NORMAL' | 'ATENCAO' | 'CRITICO' | 'INATIVA'
}

export interface ObservacaoDashboard {
  id: string
  titulo: string
  detalhe: string
  tipo: 'CRITICO' | 'BAIXO' | 'VENCIMENTO'
}

export interface MovimentacaoResumo {
  id: number
  dataHora: string
  tipo: Movimentacao['tipo']
  medicamento: string
  quantidade: number
  unidade: string
}

export function calcularDashboard(dados: DadosDashboard, usuario: Usuario, agora = new Date()) {
  const visiveis = filtrarDadosDaUnidade(usuario, dados)
  const medicamentosPorId = new Map(dados.medicamentos.map((item) => [item.id, item]))
  const unidadesPorId = new Map(visiveis.unidades.map((item) => [item.id, item]))
  const situacoes = visiveis.estoque.map((item) => ({
    ...item,
    status: classificarEstoque(item.quantidade, medicamentosPorId.get(item.medicamentoId)?.estoqueMinimo ?? 0),
  }))
  const criticos = situacoes.filter((item) => item.status === 'CRITICO')
  const baixos = situacoes.filter((item) => item.status === 'BAIXO')
  const normais = situacoes.filter((item) => item.status === 'NORMAL')

  // Uma situação de vencimento por medicamento/unidade, usando o lote mais próximo.
  const vencimentos = new Map<string, Lote>()
  for (const lote of visiveis.lotes) {
    if (lote.quantidade <= 0 || !exigeAtencaoValidade(lote.dataValidade, agora)) continue
    const chave = `${lote.unidadeId}:${lote.medicamentoId}`
    const anterior = vencimentos.get(chave)
    if (!anterior || lote.dataValidade < anterior.dataValidade) vencimentos.set(chave, lote)
  }

  const unidades: ResumoUnidade[] = visiveis.unidades.map((unidade) => {
    const saldos = situacoes.filter((item) => item.unidadeId === unidade.id)
    const unidadeCriticos = saldos.filter((item) => item.status === 'CRITICO').length
    const unidadeBaixos = saldos.filter((item) => item.status === 'BAIXO').length
    const unidadeVencimentos = [...vencimentos.values()].filter((item) => item.unidadeId === unidade.id).length
    return {
      id: unidade.id,
      nome: unidade.nome,
      medicamentos: saldos.length,
      baixos: unidadeBaixos,
      criticos: unidadeCriticos,
      vencimentos: unidadeVencimentos,
      status: unidade.status === 'INATIVA' ? 'INATIVA' : unidadeCriticos > 0 ? 'CRITICO' : unidadeBaixos > 0 || unidadeVencimentos > 0 ? 'ATENCAO' : 'NORMAL',
    }
  })

  const observacoes: ObservacaoDashboard[] = [
    ...criticos.map((item) => ({ id: `critico-${item.unidadeId}-${item.medicamentoId}`, titulo: medicamentosPorId.get(item.medicamentoId)?.nome ?? 'Medicamento', detalhe: `${unidadesPorId.get(item.unidadeId)?.nome ?? 'Unidade'} · ${item.quantidade} em estoque`, tipo: 'CRITICO' as const })),
    ...baixos.map((item) => ({ id: `baixo-${item.unidadeId}-${item.medicamentoId}`, titulo: medicamentosPorId.get(item.medicamentoId)?.nome ?? 'Medicamento', detalhe: `${unidadesPorId.get(item.unidadeId)?.nome ?? 'Unidade'} · ${item.quantidade} em estoque`, tipo: 'BAIXO' as const })),
    ...[...vencimentos.values()].map((item) => ({ id: `vencimento-${item.unidadeId}-${item.medicamentoId}`, titulo: medicamentosPorId.get(item.medicamentoId)?.nome ?? 'Medicamento', detalhe: `${unidadesPorId.get(item.unidadeId)?.nome ?? 'Unidade'} · lote ${item.numero} · validade ${format(parseISO(item.dataValidade), 'dd/MM/yyyy')}`, tipo: 'VENCIMENTO' as const })),
  ]

  const movimentacoes: MovimentacaoResumo[] = [...visiveis.movimentacoes]
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora) || b.id - a.id)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      dataHora: item.dataHora,
      tipo: item.tipo,
      medicamento: medicamentosPorId.get(item.medicamentoId)?.nome ?? 'Medicamento',
      quantidade: item.quantidade,
      unidade: item.tipo === 'TRANSFERENCIA'
        ? `${unidadesPorId.get(item.origemId ?? -1)?.nome ?? 'Origem'} → ${unidadesPorId.get(item.destinoId ?? -1)?.nome ?? 'Destino'}`
        : unidadesPorId.get((item.tipo === 'ENTRADA' ? item.destinoId : item.origemId) ?? -1)?.nome ?? 'Unidade',
    }))

  // Prévia municipal: conta necessidades com ao menos uma origem excedente; não cria sugestões nem transferências.
  const possibilidadesRedistribuicao = usuario.role === 'UBS' ? null : situacoes.filter((destino) => {
    const minimo = medicamentosPorId.get(destino.medicamentoId)?.estoqueMinimo ?? 0
    return destino.quantidade < minimo && situacoes.some((origem) => origem.medicamentoId === destino.medicamentoId && origem.unidadeId !== destino.unidadeId && origem.quantidade > minimo * 2)
  }).length

  return {
    indicadores: {
      unidades: visiveis.unidades.length,
      medicamentos: usuario.role === 'UBS' ? new Set(visiveis.estoque.map((item) => item.medicamentoId)).size : dados.medicamentos.filter((item) => item.ativo).length,
      criticos: criticos.length,
      baixos: baixos.length,
      vencimentos: vencimentos.size,
      possibilidadesRedistribuicao,
    },
    distribuicao: [
      { nome: 'Normal', quantidade: normais.length, cor: '#15803d' },
      { nome: 'Baixo', quantidade: baixos.length, cor: '#a16207' },
      { nome: 'Crítico', quantidade: criticos.length, cor: '#b91c1c' },
    ],
    unidades,
    observacoes,
    movimentacoes,
  }
}
