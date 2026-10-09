import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { Link } from 'react-router'
import FilterBar from '@/components/common/FilterBar'
import PageHeader from '@/components/common/PageHeader'
import TablePanel from '@/components/common/TablePanel'
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

  return <ConsultaEstado carregado={dadosCarregados} erro={erro} loadingLabel="Carregando estoque…">
    <section className="space-y-6" aria-labelledby="titulo-consulta-estoque">
      <PageHeader
        titleId="titulo-consulta-estoque"
        title="Estoque de medicamentos"
        description="Consulte saldos, lotes e validade por unidade."
        context={ubs ? consultas?.unidades[0]?.nome ?? 'Sua unidade' : 'Rede municipal de saúde'}
        actions={<>
          <Button asChild className="h-11 sm:h-10"><Link to="/movimentacoes?operacao=ENTRADA"><ArrowDownToLine aria-hidden="true" />Registrar entrada</Link></Button>
          <Button asChild variant="outline" className="h-11 sm:h-10"><Link to="/movimentacoes?operacao=SAIDA"><ArrowUpFromLine aria-hidden="true" />Registrar saída</Link></Button>
        </>}
      />
      <FilterBar search={<SearchField value={filtros.busca} onChange={(valor) => alterar('busca', valor)} placeholder="Buscar medicamento ou lote" hint="Pesquise por nome, princípio ativo, código ou número do lote." controlClassName="h-11 sm:h-10" />}>
        {!ubs && <FilterSelect id="filtro-unidade" label="Unidade" value={filtros.unidadeId} onChange={(valor) => alterar('unidadeId', valor)} controlClassName="h-11 sm:h-10" options={[{ value: 'TODAS', label: 'Todas as unidades' }, ...(consultas?.unidades ?? []).map((item) => ({ value: String(item.id), label: item.nome }))]} />}
        <FilterSelect id="filtro-status" label="Situação do estoque" value={filtros.status} onChange={(valor) => alterar('status', valor)} controlClassName="h-11 sm:h-10" options={[{ value: 'TODOS', label: 'Todas as situações' }, { value: 'NORMAL', label: 'Normal' }, { value: 'BAIXO', label: 'Baixo' }, { value: 'CRITICO', label: 'Crítico' }]} />
        <FilterSelect id="filtro-validade" label="Validade" value={filtros.validade} onChange={(valor) => alterar('validade', valor)} controlClassName="h-11 sm:h-10" options={[...opcoesValidade, { value: 'SEM_SALDO', label: 'Sem lote com saldo' }]} />
      </FilterBar>
      <TablePanel title="Estoque atual" count={`${linhas.length} ${linhas.length === 1 ? 'registro encontrado' : 'registros encontrados'}`} actions={filtrosAtivos && <Button variant="ghost" onClick={() => setFiltros(filtrosIniciais)}>Limpar filtros</Button>}>
        {linhas.length === 0 ? <EmptyResults filtrado={filtrosAtivos} title="Nenhum medicamento encontrado" onClear={() => setFiltros(filtrosIniciais)} /> : <>
          <p id="estoque-rolagem" className="border-b bg-muted/40 px-4 py-2 text-helper text-muted-foreground sm:px-6">Deslize a tabela ou use as setas do teclado para consultar todas as colunas.</p>
          <Table className="min-w-[720px] table-fixed text-body" containerProps={{ tabIndex: 0, role: 'region', 'aria-label': 'Tabela de estoque', 'aria-describedby': 'estoque-rolagem', className: 'focus-visible:outline-offset-[-2px]' }}>
            <TableHeader className="bg-muted/60"><TableRow>
              <TableHead scope="col" className="w-[32%] px-4 sm:pl-6">Medicamento / lotes</TableHead>
              <TableHead scope="col" className="w-[14%] text-right">Saldo atual</TableHead>
              <TableHead scope="col" className="w-[15%] px-3">Situação</TableHead>
              <TableHead scope="col" className="w-[15%] px-3">Unidade</TableHead>
              <TableHead scope="col" className="w-[24%] pr-4 sm:pr-6">Validade relevante</TableHead>
            </TableRow></TableHeader>
            <TableBody>{linhas.map((linha) => <TableRow key={`${linha.unidade.id}:${linha.medicamento.id}`}>
              <TableCell className="whitespace-normal px-4 py-3 sm:pl-6">
                <p className="font-semibold leading-5 wrap-anywhere">{linha.medicamento.nome}</p>
                <p className="mt-1 text-helper text-muted-foreground"><span className="whitespace-nowrap">{linha.medicamento.codigo}</span> · {linha.medicamento.principioAtivo}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-helper">
                  <Link aria-label={`Ver ${linha.lotes.length} ${linha.lotes.length === 1 ? 'lote' : 'lotes'} de ${linha.medicamento.nome} em ${linha.unidade.nome}`} className="inline-flex min-h-6 items-center font-medium text-primary underline underline-offset-4" to={`/lotes?busca=${encodeURIComponent(linha.medicamento.nome)}&unidade=${linha.unidade.id}`}>
                    {linha.lotes.length} {linha.lotes.length === 1 ? 'lote' : 'lotes'}
                  </Link>
                  <span className="text-muted-foreground">{linha.lotes.length === 1 ? linha.lotes[0].numero : 'Ver detalhes'}</span>
                </div>
              </TableCell>
              <TableCell className="py-3 text-right tabular-nums"><p className="font-semibold">{linha.quantidade}</p><p className="mt-1 text-helper text-muted-foreground">Mínimo {linha.medicamento.estoqueMinimo}</p><span aria-hidden="true" className="mt-2 inline-flex sm:hidden"><StockStatusBadge status={linha.status} /></span></TableCell>
              <TableCell className="px-3 py-3"><StockStatusBadge status={linha.status} /></TableCell>
              <TableCell className="whitespace-normal px-3 py-3 font-medium wrap-anywhere">{linha.unidade.nome}</TableCell>
              <TableCell className="py-3 pr-4 sm:pr-6">{linha.proximaValidade ? <span className="flex flex-col items-start gap-2"><span className="tabular-nums">{format(parseISO(linha.proximaValidade), 'dd/MM/yyyy')}</span><ValidityBadge status={linha.statusValidade === 'SEM_SALDO' ? 'REGULAR' : linha.statusValidade} /></span> : <span className="whitespace-normal text-helper text-muted-foreground">Sem lote com saldo</span>}</TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </>}
      </TablePanel>
    </section>
  </ConsultaEstado>
}
