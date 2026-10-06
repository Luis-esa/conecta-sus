import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/appStore'
import {
  selecionarCarregando, selecionarDadosCarregados, selecionarErro, selecionarRecarregar,
} from '@/stores/appSelectors'

export default function Inicio() {
  const carregando = useAppStore(selecionarCarregando)
  const dadosCarregados = useAppStore(selecionarDadosCarregados)
  const erro = useAppStore(selecionarErro)
  const recarregar = useAppStore(selecionarRecarregar)

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-primary">ConectaSUS</h1>
      <p className="mt-2 text-muted-foreground">Gestão Integrada de Medicamentos</p>
      <p className="mt-4 text-sm text-muted-foreground" role="status">
        {carregando ? 'Carregando dados…' : dadosCarregados && !erro ? 'Dados carregados.' : null}
      </p>
      {erro && (
        <div className="mt-4">
          <p role="alert" className="text-sm text-destructive">{erro}</p>
          <Button className="mt-2" variant="outline" disabled={carregando} onClick={() => void recarregar()}>
            Tentar novamente
          </Button>
        </div>
      )}
    </main>
  )
}
