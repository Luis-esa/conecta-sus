export default function LoadingState({ label = 'Carregando consulta…' }: { label?: string }) {
  return <div className="ui-panel space-y-4 p-6" role="status" aria-live="polite">
    <p className="text-body text-muted-foreground">{label}</p>
    <div aria-hidden="true" className="space-y-3">
      <div className="h-4 w-1/3 rounded-control bg-muted" />
      <div className="h-10 rounded-control bg-muted" />
      <div className="h-10 rounded-control bg-muted" />
    </div>
  </div>
}
