import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="rounded-xl border bg-white p-8">
      <p className="text-sm font-semibold text-primary">404</p>
      <h2 className="mt-2 text-2xl font-semibold">Esta página não foi encontrada</h2>
      <p className="mt-3 text-sm text-muted-foreground">Verifique o endereço ou use o menu para acessar uma área do sistema.</p>
      <Button asChild className="mt-6"><Link to="/dashboard">Voltar ao Dashboard</Link></Button>
    </section>
  )
}
