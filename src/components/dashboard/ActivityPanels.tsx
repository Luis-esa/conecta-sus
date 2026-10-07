import { format, parseISO } from 'date-fns'
import { AlertTriangle, ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CalendarClock } from 'lucide-react'
import type { MovimentacaoResumo, ObservacaoDashboard } from '@/utils/dashboard'

const tipos = {
  CRITICO: { texto: 'Crítico', icon: AlertTriangle, classe: 'bg-red-50 text-red-700' },
  BAIXO: { texto: 'Estoque baixo', icon: AlertTriangle, classe: 'bg-amber-50 text-amber-700' },
  VENCIMENTO: { texto: 'Vencimento', icon: CalendarClock, classe: 'bg-blue-50 text-blue-700' },
}

const operacoes = {
  ENTRADA: { texto: 'Entrada', icon: ArrowDownLeft, classe: 'bg-green-50 text-green-700' },
  SAIDA: { texto: 'Saída', icon: ArrowUpRight, classe: 'bg-amber-50 text-amber-700' },
  TRANSFERENCIA: { texto: 'Transferência', icon: ArrowLeftRight, classe: 'bg-blue-50 text-blue-700' },
}

export function AlertSummary({ observacoes, total }: { observacoes: ObservacaoDashboard[]; total: number }) {
  return (
    <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-alertas">
      <div className="border-b px-5 py-5 sm:px-6">
        <h2 id="titulo-alertas" className="text-lg font-semibold">Pontos de atenção</h2>
        <p className="mt-1 text-sm text-muted-foreground">{total === 0 ? 'Nenhuma situação identificada.' : `${total} situações identificadas nos dados atuais.`}</p>
      </div>
      {observacoes.length === 0 ? <p className="px-5 py-8 text-sm text-muted-foreground sm:px-6">Não há alertas de estoque ou vencimento no momento.</p> : (
        <ul className="divide-y">
          {observacoes.slice(0, 4).map((item) => {
            const tipo = tipos[item.tipo]
            const Icon = tipo.icon
            return <li key={item.id} className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
              <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${tipo.classe}`}><Icon className="size-4" aria-hidden="true" /></span>
              <div className="min-w-0"><p className="text-sm font-medium">{item.titulo}</p><p className="mt-0.5 text-xs text-muted-foreground">{tipo.texto} · {item.detalhe}</p></div>
            </li>
          })}
        </ul>
      )}
    </section>
  )
}

export function RecentMovements({ movimentacoes }: { movimentacoes: MovimentacaoResumo[] }) {
  return (
    <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="titulo-movimentacoes">
      <div className="border-b px-5 py-5 sm:px-6"><h2 id="titulo-movimentacoes" className="text-lg font-semibold">Movimentações recentes</h2><p className="mt-1 text-sm text-muted-foreground">Últimos registros do histórico disponível.</p></div>
      {movimentacoes.length === 0 ? <p className="px-5 py-8 text-sm text-muted-foreground sm:px-6">Nenhuma movimentação registrada.</p> : (
        <ul className="divide-y">
          {movimentacoes.map((item) => {
            const operacao = operacoes[item.tipo]
            const Icon = operacao.icon
            return <li key={item.id} className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
              <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${operacao.classe}`}><Icon className="size-4" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.medicamento}</p><p className="mt-0.5 text-xs text-muted-foreground">{operacao.texto} · {item.unidade} · {format(parseISO(item.dataHora), 'dd/MM/yyyy')}</p></div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{item.quantidade}</span>
            </li>
          })}
        </ul>
      )}
    </section>
  )
}
