import type { ReactNode } from 'react'
import { Check, CircleAlert, Clock, Search, TriangleAlert } from 'lucide-react'
import LoadingState from '@/components/common/LoadingState'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { StatusEstoque } from '@/types'
import type { StatusValidade } from '@/utils/validade'

const estoque = {
  NORMAL: { rotulo: 'Normal', tom: 'success', icone: Check },
  BAIXO: { rotulo: 'Baixo', tom: 'warning', icone: TriangleAlert },
  CRITICO: { rotulo: 'Crítico', tom: 'critical', icone: CircleAlert },
} as const
const validade = {
  REGULAR: { rotulo: 'Regular', tom: 'muted', icone: Check },
  PROXIMO: { rotulo: 'Próximo', tom: 'warning', icone: Clock },
  VENCIDO: { rotulo: 'Vencido', tom: 'critical', icone: CircleAlert },
} as const

export function StockStatusBadge({ status }: { status: StatusEstoque }) {
  const item = estoque[status]
  return <StatusBadge label={item.rotulo} tone={item.tom} icon={item.icone} />
}

export function ValidityBadge({ status }: { status: StatusValidade }) {
  const item = validade[status]
  return <StatusBadge label={item.rotulo} tone={item.tom} icon={item.icone} />
}

export function SearchField({ value, onChange, placeholder, hint, controlClassName }: { value: string; onChange: (value: string) => void; placeholder: string; hint?: string; controlClassName?: string }) {
  return <div className="min-w-0 space-y-2"><Label htmlFor="busca-consulta">Pesquisar</Label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="busca-consulta" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-describedby={hint ? 'busca-ajuda' : undefined} className={cn('pl-9', controlClassName)} /></div>{hint && <p id="busca-ajuda" className="text-helper text-muted-foreground">{hint}</p>}</div>
}

export function FilterSelect({ id, label, value, onChange, options, controlClassName }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; controlClassName?: string }) {
  return <div className="min-w-0 space-y-2"><Label htmlFor={id}>{label}</Label><select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={cn('ui-control h-9', controlClassName)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
}

export function ConsultaEstado({ carregado, erro, children, loadingLabel }: { carregado: boolean; erro: string | null; children: ReactNode; loadingLabel?: string }) {
  if (carregado) return children
  if (!erro) return <LoadingState label={loadingLabel} />
  return <section className="ui-panel p-6 text-body text-muted-foreground">A consulta estará disponível após o carregamento dos dados.</section>
}

export function EmptyResults({ filtrado, onClear, title }: { filtrado: boolean; onClear: () => void; title?: string }) {
  return <div className="space-y-3 px-6 py-8 text-center"><p className="text-section font-medium">{title ?? (filtrado ? 'Nenhum resultado encontrado' : 'Nenhum registro disponível')}</p><p className="text-body text-muted-foreground">{filtrado ? 'Altere os filtros ou limpe a pesquisa.' : 'Os registros aparecerão aqui quando forem cadastrados.'}</p>{filtrado && <Button variant="outline" onClick={onClear}>Limpar filtros</Button>}</div>
}
