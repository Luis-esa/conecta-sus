import { useEffect } from 'react'
import { HeartPulse } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function Login() {
  useEffect(() => { document.title = 'Login | ConectaSUS' }, [])
  return (
    <main className="flex min-h-dvh items-center justify-center p-5">
      <section className="w-full max-w-md rounded-xl border bg-white p-8">
        <HeartPulse className="mb-5 size-10 text-primary" aria-hidden="true" />
        <p className="text-sm font-semibold text-primary">ConectaSUS</p>
        <h1 className="mt-2 text-2xl font-semibold">Acesso ao sistema</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">A área de login está em preparação. Você já pode conhecer a navegação e as áreas do sistema.</p>
        <Button asChild className="mt-6 w-full"><Link to="/dashboard">Explorar o sistema</Link></Button>
        <p className="mt-6 text-xs text-muted-foreground">Rede municipal de saúde · Lagarto, SE</p>
      </section>
    </main>
  )
}
