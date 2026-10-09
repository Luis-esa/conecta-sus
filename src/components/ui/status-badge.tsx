import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const tones = {
  success: 'border-status-success-border bg-status-success-bg text-status-success-text [&>svg]:text-status-success-icon',
  warning: 'border-status-warning-border bg-status-warning-bg text-status-warning-text [&>svg]:text-status-warning-icon',
  critical: 'border-status-critical-border bg-status-critical-bg text-status-critical-text [&>svg]:text-status-critical-icon',
  info: 'border-status-info-border bg-status-info-bg text-status-info-text [&>svg]:text-status-info-icon',
  muted: 'border-status-muted-border bg-status-muted-bg text-status-muted-text [&>svg]:text-status-muted-icon',
} as const

export function StatusBadge({ label, tone = 'muted', icon: Icon, className }: {
  label: string
  tone?: keyof typeof tones
  icon?: LucideIcon
  className?: string
}) {
  return <Badge variant="outline" className={cn('rounded-control px-2 py-1 text-xs leading-[var(--text-helper--line-height)] font-medium', tones[tone], className)}>
    {Icon && <Icon aria-hidden="true" />}{label}
  </Badge>
}
