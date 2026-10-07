import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Lote, Medicamento, Movimentacao, Unidade } from '@/types'

const tipos = { ENTRADA: 'Entrada', SAIDA: 'Saída', TRANSFERENCIA: 'Transferência' }

export default function HistoricoRecente({ movimentacoes, medicamentos, lotes, unidades }: { movimentacoes: readonly Movimentacao[]; medicamentos: readonly Medicamento[]; lotes: readonly Lote[]; unidades: readonly Unidade[] }) {
  const recentes = [...movimentacoes].sort((a, b) => b.dataHora.localeCompare(a.dataHora) || b.id - a.id).slice(0, 10)
  const medPorId = new Map(medicamentos.map((item) => [item.id, item]))
  const lotePorId = new Map(lotes.map((item) => [item.id, item]))
  const unidadePorId = new Map(unidades.map((item) => [item.id, item]))
  return <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-historico-recente">
    <div className="border-b px-5 py-5 sm:px-6"><h2 id="titulo-historico-recente" className="text-lg font-semibold">Movimentações recentes</h2><p className="mt-1 text-sm text-muted-foreground">Últimos registros disponíveis para o seu perfil.</p></div>
    {recentes.length === 0 ? <p className="px-5 py-8 text-sm text-muted-foreground sm:px-6">Nenhuma movimentação registrada.</p> : <Table className="min-w-[850px]">
      <TableHeader className="bg-slate-50"><TableRow><TableHead className="pl-5 sm:pl-6">Data</TableHead><TableHead>Operação</TableHead><TableHead>Medicamento</TableHead><TableHead>Lote</TableHead><TableHead className="text-right">Quantidade</TableHead><TableHead>Unidade</TableHead><TableHead className="pr-5 sm:pr-6">Origem / motivo</TableHead></TableRow></TableHeader>
      <TableBody>{recentes.map((item) => {
        const unidadeId = item.tipo === 'ENTRADA' ? item.destinoId : item.origemId
        return <TableRow key={item.id}>
          <TableCell className="pl-5 sm:pl-6">{format(parseISO(item.dataHora), 'dd/MM/yyyy')}</TableCell>
          <TableCell><Badge variant="outline" className={item.tipo === 'ENTRADA' ? 'border-green-200 bg-green-50 text-green-800' : item.tipo === 'SAIDA' ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-amber-200 bg-amber-50 text-amber-800'}>{tipos[item.tipo]}</Badge></TableCell>
          <TableCell className="font-medium">{medPorId.get(item.medicamentoId)?.nome ?? 'Medicamento'}</TableCell>
          <TableCell className="font-mono text-xs">{item.loteId ? lotePorId.get(item.loteId)?.numero ?? '—' : '—'}</TableCell>
          <TableCell className="text-right font-semibold tabular-nums">{item.quantidade}</TableCell>
          <TableCell>{unidadePorId.get(unidadeId ?? -1)?.nome ?? 'Outra unidade'}</TableCell>
          <TableCell className="max-w-56 truncate pr-5 text-sm text-muted-foreground sm:pr-6" title={item.motivo}>{item.motivo ?? '—'}</TableCell>
        </TableRow>
      })}</TableBody>
    </Table>}
  </section>
}
