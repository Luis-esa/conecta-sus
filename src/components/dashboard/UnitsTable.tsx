import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ResumoUnidade } from '@/utils/dashboard'

const rotulos = { NORMAL: 'Normal', ATENCAO: 'Atenção', CRITICO: 'Crítico', INATIVA: 'Inativa' }
const tons = { NORMAL: 'success', ATENCAO: 'warning', CRITICO: 'critical', INATIVA: 'muted' } as const

export default function UnitsTable({ unidades }: { unidades: ResumoUnidade[] }) {
  return (
    <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-unidades">
      <div className="px-5 py-5 sm:px-6">
        <h2 id="titulo-unidades" className="text-lg font-semibold">Situação das unidades</h2>
        <p className="mt-1 text-sm text-muted-foreground">Resumo dos medicamentos com lotes cadastrados em cada unidade.</p>
      </div>
      <p className="border-y bg-muted/40 px-5 py-2 text-helper text-muted-foreground sm:px-6">Em telas menores, deslize a tabela ou use as setas do teclado.</p>
      <Table className="min-w-[680px]" containerProps={{ tabIndex: 0, role: 'region', 'aria-label': 'Situação das unidades' }}>
        <TableHeader className="bg-muted/60"><TableRow>
          <TableHead className="pl-5 sm:pl-6">Unidade</TableHead>
          <TableHead className="text-right">Medicamentos</TableHead>
          <TableHead className="text-right">Baixo</TableHead>
          <TableHead className="text-right">Críticos</TableHead>
          <TableHead className="text-right">Vencimentos</TableHead>
          <TableHead className="pr-5 text-right sm:pr-6">Status geral</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {unidades.map((unidade) => <TableRow key={unidade.id}>
            <TableCell className="max-w-44 whitespace-normal pl-5 font-medium sm:pl-6">{unidade.nome}</TableCell>
            <TableCell className="text-right tabular-nums">{unidade.medicamentos}</TableCell>
            <TableCell className="text-right tabular-nums">{unidade.baixos}</TableCell>
            <TableCell className="text-right tabular-nums">{unidade.criticos}</TableCell>
            <TableCell className="text-right tabular-nums">{unidade.vencimentos}</TableCell>
            <TableCell className="pr-5 text-right sm:pr-6"><StatusBadge label={rotulos[unidade.status]} tone={tons[unidade.status]} /></TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </section>
  )
}
