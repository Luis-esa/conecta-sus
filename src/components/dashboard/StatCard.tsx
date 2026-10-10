import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router'

const tons = {
  azul: 'bg-status-info-bg text-status-info-icon',
  verde: 'bg-status-success-bg text-status-success-icon',
  amarelo: 'bg-status-warning-bg text-status-warning-icon',
  vermelho: 'bg-status-critical-bg text-status-critical-icon',
} as const

export default function StatCard({ titulo, valor, detalhe, icone: Icon, tom = 'azul', to, destaque = false }: {
  titulo: string
  valor: number | string
  detalhe: string
  icone: LucideIcon
  tom?: keyof typeof tons
  to?: string
  destaque?: boolean
}) {
  return (
    <Card className={`gap-0 py-5 shadow-none ${destaque ? 'border-status-critical-border bg-status-critical-bg/40' : ''}`}>
      <CardContent className="flex items-start justify-between gap-3 px-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
          <p className={`mt-2 text-3xl font-semibold tabular-nums tracking-tight ${destaque ? 'text-status-critical-text' : ''}`}>{valor}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{detalhe}</p>
          {to && <Link to={to} className="mt-3 inline-flex min-h-7 items-center text-sm font-semibold text-primary underline underline-offset-4">Ver detalhes<span className="sr-only">: {titulo}</span></Link>}
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tons[tom]}`}><Icon className="size-5" aria-hidden="true" /></span>
      </CardContent>
    </Card>
  )
}
