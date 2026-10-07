import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/appStore'
import { selecionarCarregando, selecionarErro, selecionarRecarregar } from '@/stores/appSelectors'

export default function AppDataStatus() {
  const carregando = useAppStore(selecionarCarregando)
  const erro = useAppStore(selecionarErro)
  const recarregar = useAppStore(selecionarRecarregar)
  if (carregando) return <p role="status" className="mb-5 rounded-lg border bg-white p-4 text-sm text-muted-foreground">Carregando dados…</p>
  if (!erro) return null
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/25 bg-white p-4">
      <p role="alert" className="text-sm text-destructive">{erro}</p>
      <Button variant="outline" onClick={() => void recarregar()}>Tentar novamente</Button>
    </div>
  )
}
