import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Medicamento, Unidade, Usuario } from '@/types'
import type { FiltrosHistorico } from '@/utils/historico'

const classeSelect = 'ui-control h-11'

export default function FiltrosHistorico({ filtros, alterar, limpar, medicamentos, unidades, usuarios, ocultarUnidade = false, label = 'Filtros de movimentações' }: {
  filtros: FiltrosHistorico
  alterar: (campo: keyof FiltrosHistorico, valor: string) => void
  limpar: () => void
  medicamentos: readonly Medicamento[]
  unidades: readonly Unidade[]
  usuarios: readonly Usuario[]
  ocultarUnidade?: boolean
  label?: string
}) {
  return <section className="rounded-xl border bg-white p-4 sm:p-5" aria-label={label}>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="filtro-inicio">Data inicial</Label><Input className="h-11" id="filtro-inicio" type="date" value={filtros.inicio} max={filtros.fim || undefined} onChange={(event) => alterar('inicio', event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="filtro-fim">Data final</Label><Input className="h-11" id="filtro-fim" type="date" value={filtros.fim} min={filtros.inicio || undefined} onChange={(event) => alterar('fim', event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="filtro-medicamento">Medicamento</Label><select id="filtro-medicamento" className={classeSelect} value={filtros.medicamentoId} onChange={(event) => alterar('medicamentoId', event.target.value)}><option value="TODOS">Todos</option>{medicamentos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
      {!ocultarUnidade && <div className="space-y-2"><Label htmlFor="filtro-unidade-historico">Unidade</Label><select id="filtro-unidade-historico" className={classeSelect} value={filtros.unidadeId} onChange={(event) => alterar('unidadeId', event.target.value)}><option value="TODAS">Todas</option>{unidades.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>}
      <div className="space-y-2"><Label htmlFor="filtro-tipo">Operação</Label><select id="filtro-tipo" className={classeSelect} value={filtros.tipo} onChange={(event) => alterar('tipo', event.target.value)}><option value="TODOS">Todas</option><option value="ENTRADA">Entrada</option><option value="SAIDA">Saída</option><option value="TRANSFERENCIA">Transferência</option></select></div>
      <div className="space-y-2"><Label htmlFor="filtro-usuario">Usuário</Label><select id="filtro-usuario" className={classeSelect} value={filtros.usuarioId} onChange={(event) => alterar('usuarioId', event.target.value)}><option value="TODOS">Todos</option>{usuarios.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
    </div>
    <div className="mt-4 flex justify-end"><Button type="button" className="min-h-11" variant="ghost" onClick={limpar}>Limpar filtros</Button></div>
  </section>
}
