import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useSearchParams } from 'react-router'
import PageHeader from '@/components/common/PageHeader'
import { ConsultaEstado, EmptyResults, FilterSelect, SearchField, ValidityBadge } from '@/components/consultas/ConsultaUI'
import { opcoesValidade } from '@/components/consultas/filterOptions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useConsultas } from '@/hooks/useConsultas'
import { filtrarLotes, type FiltrosLotes } from '@/utils/consultas'
import { Link } from 'react-router'
import { Dialog } from '@/components/ui/dialog'
import ValidadeLoteForm from '@/components/admin/ValidadeLoteForm'
import { useAppStore } from '@/stores/appStore'

const filtrosIniciais: FiltrosLotes = { busca: '', unidadeId: 'TODAS', validade: 'TODAS' }

export default function Lotes() {
  const { consultas, usuario, dadosCarregados, erro } = useConsultas()
  const [parametros, setParametros] = useSearchParams()
  const [filtros, setFiltros] = useState<FiltrosLotes>({ busca: parametros.get('busca') ?? '', unidadeId: parametros.get('unidade') ?? 'TODAS', validade: 'TODAS' })
  const [loteEditando, setLoteEditando] = useState<number | null>(null)
  const [focoAnterior, setFocoAnterior] = useState<HTMLElement | null>(null)
  const limparErro = useAppStore((state) => state.limparErroOperacao)
  const alterar = (campo: keyof FiltrosLotes, valor: string) => setFiltros((atual) => ({ ...atual, [campo]: valor }))
  const linhas = consultas ? filtrarLotes(consultas.lotes, filtros) : []
  const filtrado = filtros.busca !== '' || filtros.unidadeId !== 'TODAS' || filtros.validade !== 'TODAS'
  const ubs = usuario?.role === 'UBS'
  const limparFiltros = () => { setFiltros(filtrosIniciais); setParametros({}, { replace: true }) }

  return <ConsultaEstado carregado={dadosCarregados} erro={erro}>
    <section className="space-y-5" aria-label="Consulta de lotes">
      <PageHeader title="Lotes" description={ubs ? `Lotes de ${consultas?.unidades[0]?.nome ?? 'sua unidade'}, com entrada e validade.` : 'Acompanhe os lotes, quantidades e prazos de validade de cada unidade.'} actions={usuario?.role === 'ADMIN' ? <Button asChild size="sm"><Link to="/movimentacoes?operacao=ENTRADA">Registrar novo lote</Link></Button> : undefined} />
      <div className={`grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-2 sm:p-5 ${ubs ? '' : 'lg:grid-cols-3'}`}>
        <SearchField value={filtros.busca} onChange={(valor) => alterar('busca', valor)} placeholder="Medicamento, princípio ativo, código ou lote" />
        {!ubs && <FilterSelect id="filtro-unidade" label="Unidade" value={filtros.unidadeId} onChange={(valor) => alterar('unidadeId', valor)} options={[{ value: 'TODAS', label: 'Todas as unidades' }, ...(consultas?.unidades ?? []).map((item) => ({ value: String(item.id), label: item.nome }))]} />}
        <FilterSelect id="filtro-validade" label="Validade" value={filtros.validade} onChange={(valor) => alterar('validade', valor)} options={opcoesValidade} />
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4 sm:px-6"><h2 className="font-semibold">Lotes cadastrados</h2><div className="flex items-center gap-3"><p role="status" className="text-sm text-muted-foreground">{linhas.length} {linhas.length === 1 ? 'lote' : 'lotes'}</p>{filtrado && <Button size="sm" variant="ghost" onClick={limparFiltros}>Limpar filtros</Button>}</div></div>
        {linhas.length === 0 ? <EmptyResults filtrado={filtrado} onClear={limparFiltros} /> : <Table className="min-w-[760px]">
          <TableHeader className="bg-slate-50"><TableRow><TableHead className="pl-5 sm:pl-6">Medicamento</TableHead><TableHead>Número do lote</TableHead><TableHead className="text-right">Quantidade</TableHead><TableHead>Unidade</TableHead><TableHead>Entrada</TableHead><TableHead>Validade</TableHead><TableHead>Situação</TableHead>{usuario?.role === 'ADMIN' && <TableHead className="pr-5 sm:pr-6">Ações</TableHead>}</TableRow></TableHeader>
          <TableBody>{linhas.map(({ lote, medicamento, unidade, statusValidade }) => <TableRow key={lote.id}>
            <TableCell className="max-w-48 whitespace-normal pl-5 font-medium sm:pl-6">{medicamento.nome}<p className="text-xs font-normal text-muted-foreground">{medicamento.codigo}</p></TableCell><TableCell className="font-mono text-xs">{lote.numero}</TableCell><TableCell className="text-right font-semibold tabular-nums">{lote.quantidade}</TableCell><TableCell className="max-w-40 whitespace-normal">{unidade.nome}</TableCell><TableCell>{format(parseISO(lote.dataEntrada), 'dd/MM/yyyy')}</TableCell><TableCell>{format(parseISO(lote.dataValidade), 'dd/MM/yyyy')}</TableCell><TableCell><ValidityBadge status={statusValidade} /></TableCell>{usuario?.role === 'ADMIN' && <TableCell className="pr-5 sm:pr-6"><Button size="sm" variant="outline" aria-label={`Corrigir validade do lote ${lote.numero} de ${medicamento.nome}`} onClick={() => { setFocoAnterior(document.activeElement as HTMLElement | null); limparErro(); setLoteEditando(lote.id) }}>Corrigir validade</Button></TableCell>}
          </TableRow>)}</TableBody>
        </Table>}
      </div>
      {usuario?.role === 'ADMIN' && <Dialog open={loteEditando !== null} onOpenChange={(aberto) => { if (!aberto) setLoteEditando(null) }}>{loteEditando !== null && consultas && <ValidadeLoteForm key={loteEditando} adminId={usuario.id} lote={consultas.lotes.find((linha) => linha.lote.id === loteEditando)!.lote} onSaved={() => setLoteEditando(null)} returnFocusTo={focoAnterior} />}</Dialog>}
    </section>
  </ConsultaEstado>
}
