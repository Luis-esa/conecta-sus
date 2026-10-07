import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ResumoUnidade } from '@/utils/dashboard'

const rotulos = { NORMAL: 'Normal', ATENCAO: 'Atenção', CRITICO: 'Crítico', INATIVA: 'Inativa' }
const estilos = {
  NORMAL: 'border-green-200 bg-green-50 text-green-800',
  ATENCAO: 'border-amber-200 bg-amber-50 text-amber-800',
  CRITICO: 'border-red-200 bg-red-50 text-red-800',
  INATIVA: 'border-slate-200 bg-slate-100 text-slate-700',
}

export default function UnitsTable({ unidades }: { unidades: ResumoUnidade[] }) {
  return (
    <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-unidades">
      <div className="px-5 py-5 sm:px-6">
        <h2 id="titulo-unidades" className="text-lg font-semibold">Situação das unidades</h2>
        <p className="mt-1 text-sm text-muted-foreground">Resumo dos medicamentos com lotes cadastrados em cada unidade.</p>
      </div>
      <Table>
        <TableHeader className="bg-slate-50"><TableRow>
          <TableHead className="pl-5 sm:pl-6">Unidade</TableHead>
          <TableHead className="text-right">Medicamentos</TableHead>
          <TableHead className="text-right">Baixo</TableHead>
          <TableHead className="text-right">Críticos</TableHead>
          <TableHead className="text-right">Vencimentos</TableHead>
          <TableHead className="pr-5 text-right sm:pr-6">Status geral</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {unidades.map((unidade) => <TableRow key={unidade.id}>
            <TableCell className="pl-5 font-medium sm:pl-6">{unidade.nome}</TableCell>
            <TableCell className="text-right tabular-nums">{unidade.medicamentos}</TableCell>
            <TableCell className="text-right tabular-nums">{unidade.baixos}</TableCell>
            <TableCell className="text-right tabular-nums">{unidade.criticos}</TableCell>
            <TableCell className="text-right tabular-nums">{unidade.vencimentos}</TableCell>
            <TableCell className="pr-5 text-right sm:pr-6"><Badge variant="outline" className={estilos[unidade.status]}>{rotulos[unidade.status]}</Badge></TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </section>
  )
}
