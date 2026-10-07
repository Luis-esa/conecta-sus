import { useMemo } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConsultaEstado } from '@/components/consultas/ConsultaUI'
import { useAppStore } from '@/stores/appStore'
import { selecionarDadosCarregados, selecionarErro, selecionarEstoque, selecionarMedicamentos, selecionarMovimentacoes, selecionarSugestoes, selecionarUnidades } from '@/stores/appSelectors'
import { analisarConsumo, MESES_HISTORICO_CONSUMO } from '@/utils/consumo'

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

export default function Redistribuicao() {
  const sugestoes = useAppStore(selecionarSugestoes)
  const unidades = useAppStore(selecionarUnidades)
  const medicamentos = useAppStore(selecionarMedicamentos)
  const estoque = useAppStore(selecionarEstoque)
  const movimentacoes = useAppStore(selecionarMovimentacoes)
  const carregado = useAppStore(selecionarDadosCarregados)
  const erro = useAppStore(selecionarErro)
  const consumo = useMemo(() => analisarConsumo({ estoque, movimentacoes }), [estoque, movimentacoes])
  const unidadePorId = new Map(unidades.map((item) => [item.id, item.nome]))
  const medicamentoPorId = new Map(medicamentos.map((item) => [item.id, item.nome]))

  return <ConsultaEstado carregado={carregado} erro={erro}>
    <div className="space-y-6">
      <p className="text-sm leading-6 text-muted-foreground">Sugestões calculadas a partir do estoque atual. O gestor avalia cada caso e, se desejar, registra a transferência manualmente.</p>
      <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-sugestoes">
        <div className="border-b px-5 py-5"><h2 id="titulo-sugestoes" className="text-lg font-semibold">Sugestões de redistribuição</h2><p className="mt-1 text-sm text-muted-foreground">Origem acima de 2× o mínimo; destino abaixo do mínimo. A quantidade preserva 2× o mínimo na origem e cobre no máximo a falta no destino.</p></div>
        {!sugestoes?.length ? <p className="px-5 py-8 text-sm text-muted-foreground">Nenhuma combinação de excedente e necessidade encontrada.</p> : <div className="overflow-x-auto"><Table className="min-w-[920px]"><TableHeader><TableRow><TableHead>Medicamento</TableHead><TableHead>Origem</TableHead><TableHead>Destino</TableHead><TableHead className="text-right">Origem / destino</TableHead><TableHead className="text-right">Mínimo</TableHead><TableHead className="text-right">Sugerido</TableHead><TableHead>Justificativa</TableHead></TableRow></TableHeader><TableBody>{sugestoes.map((item) => <TableRow key={`${item.medicamentoId}-${item.origemId}-${item.destinoId}`}><TableCell className="font-medium">{medicamentoPorId.get(item.medicamentoId)}</TableCell><TableCell>{unidadePorId.get(item.origemId)}</TableCell><TableCell>{unidadePorId.get(item.destinoId)}</TableCell><TableCell className="text-right tabular-nums">{item.estoqueOrigem} / {item.estoqueDestino}</TableCell><TableCell className="text-right tabular-nums">{item.estoqueMinimo}</TableCell><TableCell className="text-right font-semibold tabular-nums">{item.quantidadeSugerida}</TableCell><TableCell className="max-w-64 text-sm text-muted-foreground">{item.motivo}</TableCell></TableRow>)}</TableBody></Table></div>}
        <div className="border-t px-5 py-4"><Button asChild variant="outline" size="sm"><Link to="/transferencias">Abrir transferências manuais</Link></Button></div>
      </section>
      <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-consumo">
        <div className="border-b px-5 py-5"><h2 id="titulo-consumo" className="text-lg font-semibold">Análise de consumo</h2><p className="mt-1 text-sm text-muted-foreground">Média das saídas de consumo nos últimos {MESES_HISTORICO_CONSUMO} meses completos. Saídas de transferências não entram no cálculo.</p></div>
        {consumo.length === 0 ? <p className="px-5 py-8 text-sm text-muted-foreground">Nenhum estoque disponível para análise.</p> : <div className="overflow-x-auto"><Table className="min-w-[680px]"><TableHeader><TableRow><TableHead>Medicamento</TableHead><TableHead>Unidade</TableHead><TableHead className="text-right">Estoque</TableHead><TableHead className="text-right">Média mensal</TableHead><TableHead className="text-right">Meses de estoque</TableHead></TableRow></TableHeader><TableBody>{consumo.map((item) => <TableRow key={`${item.medicamentoId}-${item.unidadeId}`}><TableCell className="font-medium">{medicamentoPorId.get(item.medicamentoId)}</TableCell><TableCell>{unidadePorId.get(item.unidadeId)}</TableCell><TableCell className="text-right tabular-nums">{item.estoqueAtual}</TableCell><TableCell className="text-right tabular-nums">{item.consumoMedioMensal === null ? '—' : numero.format(item.consumoMedioMensal)}</TableCell><TableCell className="text-right">{item.mesesDeEstoque === null ? <span className="text-muted-foreground">Sem histórico de consumo suficiente.</span> : <span className="tabular-nums">{numero.format(item.mesesDeEstoque)}</span>}</TableCell></TableRow>)}</TableBody></Table></div>}
      </section>
    </div>
  </ConsultaEstado>
}
