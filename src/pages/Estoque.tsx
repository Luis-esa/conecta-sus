import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Link } from 'react-router'
import { ConsultaEstado, EmptyResults, FilterSelect, SearchField, StockStatusBadge, ValidityBadge } from '@/components/consultas/ConsultaUI'
import { opcoesValidade } from '@/components/consultas/filterOptions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useConsultas } from '@/hooks/useConsultas'
import { filtrarEstoque, type FiltrosEstoque } from '@/utils/consultas'

const filtrosIniciais: FiltrosEstoque = { busca: '', unidadeId: 'TODAS', status: 'TODOS', validade: 'TODAS' }

export default function Estoque() {
  const { consultas, usuario, dadosCarregados, erro } = useConsultas()
  const [filtros, setFiltros] = useState<FiltrosEstoque>(filtrosIniciais)
  const alterar = (campo: keyof FiltrosEstoque, valor: string) => setFiltros((atual) => ({ ...atual, [campo]: valor }))
  const linhas = consultas ? filtrarEstoque(consultas.estoque, filtros) : []
  const filtrosAtivos = Object.entries(filtros).some(([campo, valor]) => valor !== filtrosIniciais[campo as keyof FiltrosEstoque])
  const ubs = usuario?.role === 'UBS'

  return <ConsultaEstado carregado={dadosCarregados} erro={erro}>
    <section className="space-y-5" aria-label="Consulta de estoque">
      <p className="text-sm leading-6 text-muted-foreground">{ubs ? `Saldos e lotes de ${consultas?.unidades[0]?.nome ?? 'sua unidade'}.` : 'Saldos por medicamento e unidade, calculados a partir dos lotes cadastrados.'}</p>
      <div className="rounded-xl border bg-white p-4 sm:p-5">
        <div className={`grid gap-4 sm:grid-cols-2 ${ubs ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
          <SearchField value={filtros.busca} onChange={(valor) => alterar('busca', valor)} placeholder="Nome, princípio ativo, código ou lote" />
          {!ubs && <FilterSelect id="filtro-unidade" label="Unidade" value={filtros.unidadeId} onChange={(valor) => alterar('unidadeId', valor)} options={[{ value: 'TODAS', label: 'Todas as unidades' }, ...(consultas?.unidades ?? []).map((item) => ({ value: String(item.id), label: item.nome }))]} />}
          <FilterSelect id="filtro-status" label="Status do estoque" value={filtros.status} onChange={(valor) => alterar('status', valor)} options={[{ value: 'TODOS', label: 'Todos os status' }, { value: 'NORMAL', label: 'Normal' }, { value: 'BAIXO', label: 'Baixo' }, { value: 'CRITICO', label: 'Crítico' }]} />
          <FilterSelect id="filtro-validade" label="Validade" value={filtros.validade} onChange={(valor) => alterar('validade', valor)} options={[...opcoesValidade, { value: 'SEM_SALDO', label: 'Sem lote com saldo' }]} />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4 sm:px-6"><h2 className="font-semibold">Estoque atual</h2><div className="flex items-center gap-3"><p role="status" className="text-sm text-muted-foreground">{linhas.length} {linhas.length === 1 ? 'registro' : 'registros'}</p>{filtrosAtivos && <Button size="sm" variant="ghost" onClick={() => setFiltros(filtrosIniciais)}>Limpar filtros</Button>}</div></div>
        {linhas.length === 0 ? <EmptyResults filtrado={filtrosAtivos} onClear={() => setFiltros(filtrosIniciais)} /> : <Table className="min-w-[940px]">
          <TableHeader className="bg-slate-50"><TableRow>
            <TableHead className="pl-5 sm:pl-6">Medicamento</TableHead><TableHead className="text-right">Quantidade</TableHead><TableHead className="text-right">Mínimo</TableHead><TableHead>Lotes</TableHead><TableHead>Validade relevante</TableHead><TableHead>Unidade</TableHead><TableHead className="pr-5 sm:pr-6">Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>{linhas.map((linha) => <TableRow key={`${linha.unidade.id}:${linha.medicamento.id}`}>
            <TableCell className="pl-5 sm:pl-6"><p className="font-medium">{linha.medicamento.nome}</p><p className="text-xs text-muted-foreground">{linha.medicamento.codigo} · {linha.medicamento.principioAtivo}</p></TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{linha.quantidade}</TableCell>
            <TableCell className="text-right tabular-nums">{linha.medicamento.estoqueMinimo}</TableCell>
            <TableCell><Link className="font-medium text-primary underline-offset-2 hover:underline" to={`/lotes?busca=${encodeURIComponent(linha.medicamento.nome)}&unidade=${linha.unidade.id}`}>{linha.lotes.length} {linha.lotes.length === 1 ? 'lote' : 'lotes'}</Link><p className="text-xs text-muted-foreground">{linha.lotes.length === 1 ? linha.lotes[0].numero : 'Ver detalhes'}</p></TableCell>
            <TableCell>{linha.proximaValidade ? <span className="flex flex-col items-start gap-1"><span>{format(parseISO(linha.proximaValidade), 'dd/MM/yyyy')}</span><ValidityBadge status={linha.statusValidade === 'SEM_SALDO' ? 'REGULAR' : linha.statusValidade} /></span> : <span className="text-muted-foreground">Sem lote com saldo</span>}</TableCell>
            <TableCell>{linha.unidade.nome}</TableCell>
            <TableCell className="pr-5 sm:pr-6"><StockStatusBadge status={linha.status} /></TableCell>
          </TableRow>)}</TableBody>
        </Table>}
      </div>
    </section>
  </ConsultaEstado>
}
