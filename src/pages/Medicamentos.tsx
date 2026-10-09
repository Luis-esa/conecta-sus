import { useState } from 'react'
import { Link } from 'react-router'
import PageHeader from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConsultaEstado, EmptyResults, FilterSelect, SearchField } from '@/components/consultas/ConsultaUI'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useConsultas } from '@/hooks/useConsultas'
import { filtrarMedicamentos, type FiltrosMedicamentos } from '@/utils/consultas'
import { Dialog } from '@/components/ui/dialog'
import MedicamentoForm from '@/components/admin/MedicamentoForm'
import { useAppStore } from '@/stores/appStore'

const filtrosIniciais: FiltrosMedicamentos = { busca: '', situacao: 'TODOS' }

export default function Medicamentos() {
  const { consultas, usuario, dadosCarregados, erro } = useConsultas()
  const [filtros, setFiltros] = useState<FiltrosMedicamentos>(filtrosIniciais)
  const [editando, setEditando] = useState<number | null>(null)
  const [formAberto, setFormAberto] = useState(false)
  const limparErro = useAppStore((state) => state.limparErroOperacao)
  const abrir = (id: number | null) => { limparErro(); setEditando(id); setFormAberto(true) }
  const linhas = consultas ? filtrarMedicamentos(consultas.medicamentos, filtros) : []
  const filtrado = filtros.busca !== '' || filtros.situacao !== 'TODOS'

  return <ConsultaEstado carregado={dadosCarregados} erro={erro}>
    <section className="space-y-5" aria-label="Consulta de medicamentos">
      <PageHeader title="Medicamentos" description={usuario?.role === 'UBS' ? 'Medicamentos com lotes cadastrados na sua unidade.' : 'Catálogo de medicamentos cadastrados na rede municipal.'} actions={usuario?.role === 'ADMIN' ? <Button onClick={() => abrir(null)}>Cadastrar medicamento</Button> : undefined} />
      <div className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:p-5">
        <SearchField value={filtros.busca} onChange={(busca) => setFiltros((atual) => ({ ...atual, busca }))} placeholder="Nome, princípio ativo ou código" />
        <FilterSelect id="filtro-situacao" label="Situação" value={filtros.situacao} onChange={(situacao) => setFiltros((atual) => ({ ...atual, situacao }))} options={[{ value: 'TODOS', label: 'Todos' }, { value: 'ATIVO', label: 'Ativos' }, { value: 'INATIVO', label: 'Inativos' }]} />
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4 sm:px-6"><h2 className="font-semibold">Medicamentos cadastrados</h2><div className="flex items-center gap-3"><p role="status" className="text-sm text-muted-foreground">{linhas.length} {linhas.length === 1 ? 'medicamento' : 'medicamentos'}</p>{filtrado && <Button size="sm" variant="ghost" onClick={() => setFiltros(filtrosIniciais)}>Limpar filtros</Button>}</div></div>
        {linhas.length === 0 ? <EmptyResults filtrado={filtrado} onClear={() => setFiltros(filtrosIniciais)} /> : <Table className="min-w-[1080px]">
          <TableHeader className="bg-slate-50"><TableRow><TableHead className="pl-5 sm:pl-6">Medicamento</TableHead><TableHead>Princípio ativo</TableHead><TableHead>Concentração</TableHead><TableHead>Forma</TableHead><TableHead>Unidade</TableHead><TableHead>Código</TableHead><TableHead className="text-right">Mínimo</TableHead><TableHead className="text-right">Máximo</TableHead><TableHead>Unidades com lote</TableHead><TableHead>Situação</TableHead>{usuario?.role === 'ADMIN' && <TableHead className="pr-5 sm:pr-6">Ações</TableHead>}</TableRow></TableHeader>
          <TableBody>{linhas.map(({ medicamento, unidadesComLote }) => <TableRow key={medicamento.id}>
            <TableCell className="pl-5 font-medium sm:pl-6"><Link to={`/lotes?busca=${encodeURIComponent(medicamento.nome)}`} className="text-primary underline-offset-2 hover:underline">{medicamento.nome}</Link></TableCell>
            <TableCell>{medicamento.principioAtivo}</TableCell><TableCell>{medicamento.concentracao}</TableCell><TableCell>{medicamento.formaFarmaceutica}</TableCell><TableCell>{medicamento.unidadeMedida}</TableCell><TableCell className="font-mono text-xs">{medicamento.codigo}</TableCell><TableCell className="text-right tabular-nums">{medicamento.estoqueMinimo}</TableCell><TableCell className="text-right tabular-nums">{medicamento.estoqueMaximo ?? '—'}</TableCell><TableCell>{unidadesComLote.length ? unidadesComLote.map((item) => item.nome).join(', ') : '—'}</TableCell><TableCell><Badge variant="outline" className={medicamento.ativo ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-200 bg-slate-100 text-slate-700'}>{medicamento.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>{usuario?.role === 'ADMIN' && <TableCell className="pr-5 sm:pr-6"><Button size="sm" variant="outline" onClick={() => abrir(medicamento.id)}>Editar</Button></TableCell>}
          </TableRow>)}</TableBody>
        </Table>}
      </div>
      {usuario?.role === 'ADMIN' && <Dialog open={formAberto} onOpenChange={setFormAberto}>{formAberto && <MedicamentoForm key={editando ?? 'novo'} adminId={usuario.id} item={consultas?.medicamentos.find((linha) => linha.medicamento.id === editando)?.medicamento} onSaved={() => setFormAberto(false)} />}</Dialog>}
    </section>
  </ConsultaEstado>
}
