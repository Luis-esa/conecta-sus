import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { StatusEstoque } from '@/types'
import type { StatusValidade } from '@/utils/validade'

const estoque = {
  NORMAL: { rotulo: 'Normal', classe: 'border-green-200 bg-green-50 text-green-800' },
  BAIXO: { rotulo: 'Baixo', classe: 'border-amber-200 bg-amber-50 text-amber-800' },
  CRITICO: { rotulo: 'Crítico', classe: 'border-red-200 bg-red-50 text-red-800' },
}
const validade = {
  REGULAR: { rotulo: 'Regular', classe: 'border-slate-200 bg-slate-50 text-slate-700' },
  PROXIMO: { rotulo: 'Próximo', classe: 'border-amber-200 bg-amber-50 text-amber-800' },
  VENCIDO: { rotulo: 'Vencido', classe: 'border-red-200 bg-red-50 text-red-800' },
}

export function StockStatusBadge({ status }: { status: StatusEstoque }) {
  const item = estoque[status]
  return <Badge variant="outline" className={item.classe}>{item.rotulo}</Badge>
}

export function ValidityBadge({ status }: { status: StatusValidade }) {
  const item = validade[status]
  return <Badge variant="outline" className={item.classe}>{item.rotulo}</Badge>
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="space-y-2"><Label htmlFor="busca-consulta">Pesquisar</Label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="busca-consulta" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9" /></div></div>
}

export function FilterSelect({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
}

export function ConsultaEstado({ carregado, erro, children }: { carregado: boolean; erro: string | null; children: ReactNode }) {
  if (carregado) return children
  return <section className="rounded-xl border bg-white p-8 text-sm text-muted-foreground" role={erro ? undefined : 'status'}>{erro ? 'A consulta estará disponível após o carregamento dos dados.' : 'Carregando consulta…'}</section>
}

export function EmptyResults({ filtrado, onClear }: { filtrado: boolean; onClear: () => void }) {
  return <div className="px-6 py-14 text-center"><p className="font-medium">{filtrado ? 'Nenhum resultado encontrado' : 'Nenhum registro disponível'}</p><p className="mt-2 text-sm text-muted-foreground">{filtrado ? 'Altere os filtros ou limpe a pesquisa.' : 'Os registros aparecerão aqui quando forem cadastrados.'}</p>{filtrado && <Button variant="outline" className="mt-5" onClick={onClear}>Limpar filtros</Button>}</div>
}
