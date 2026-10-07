import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function AccessDenied() {
  return (
    <section role="alert" className="rounded-xl border bg-white p-8">
      <p className="text-sm font-semibold text-destructive">Acesso restrito</p>
      <h2 className="mt-2 text-2xl font-semibold">Acesso não autorizado.</h2>
      <p className="mt-3 text-sm text-muted-foreground">Seu perfil não tem acesso a esta área.</p>
      <Button asChild className="mt-6"><Link to="/dashboard">Voltar ao Dashboard</Link></Button>
    </section>
  )
}
