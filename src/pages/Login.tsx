import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { HeartPulse, LockKeyhole } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'
import { podeAcessar } from '@/routes/permissoes'

const formularioSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.'),
})
type CamposLogin = z.infer<typeof formularioSchema>

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const inicializado = useAuthStore((state) => state.inicializado)
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const carregando = useAuthStore((state) => state.carregando)
  const erro = useAuthStore((state) => state.erro)
  const entrar = useAuthStore((state) => state.login)
  const { register, handleSubmit, formState: { errors } } = useForm<CamposLogin>({
    resolver: zodResolver(formularioSchema),
    defaultValues: { email: '', senha: '' },
  })

  useEffect(() => { document.title = 'Login | ConectaSUS' }, [])

  if (!inicializado) return <main className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground" role="status">Verificando sessão…</main>
  if (usuario) {
    const origem = (location.state as { from?: unknown } | null)?.from
    const destino = typeof origem === 'string' && podeAcessar(usuario, origem) ? origem : '/dashboard'
    return <Navigate to={destino} replace />
  }

  const enviar = handleSubmit(async ({ email, senha }) => {
    if (!(await entrar(email, senha))) return
    const usuarioAutenticado = useAuthStore.getState().usuarioAtual
    const origem = (location.state as { from?: unknown } | null)?.from
    const destino = typeof origem === 'string' && usuarioAutenticado && podeAcessar(usuarioAutenticado, origem) ? origem : '/dashboard'
    navigate(destino, { replace: true })
  })

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f3f7fb] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3 text-[#12345a]">
          <span className="flex size-11 items-center justify-center rounded-lg bg-[#12345a] text-white"><HeartPulse aria-hidden="true" /></span>
          <div><p className="text-xl font-semibold tracking-tight">ConectaSUS</p><p className="text-xs">Rede municipal de saúde · Lagarto, SE</p></div>
        </div>
        <section className="rounded-xl border bg-white p-6 shadow-sm sm:p-8" aria-labelledby="titulo-login">
          <div className="mb-6">
            <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent text-primary"><LockKeyhole className="size-5" aria-hidden="true" /></span>
            <h1 id="titulo-login" className="text-2xl font-semibold tracking-tight">Acesso ao sistema</h1>
            <p className="mt-2 text-sm text-muted-foreground">Entre com sua conta de demonstração.</p>
          </div>
          <form onSubmit={enviar} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="username" placeholder="nome@conectasus.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-erro' : undefined} {...register('email')} />
              {errors.email && <p id="email-erro" className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.senha)} aria-describedby={errors.senha ? 'senha-erro' : undefined} {...register('senha')} />
              {errors.senha && <p id="senha-erro" className="text-sm text-destructive">{errors.senha.message}</p>}
            </div>
            {erro && <p role="alert" className="rounded-md border border-destructive/20 bg-red-50 px-3 py-2 text-sm text-destructive">{erro}</p>}
            <Button type="submit" className="w-full" disabled={carregando}>{carregando ? 'Entrando…' : 'Entrar'}</Button>
          </form>
          <div className="mt-7 border-t pt-5 text-xs leading-5 text-muted-foreground">
            <p className="font-semibold text-foreground">Contas de demonstração</p>
            <p>admin@conectasus.com · gestor@conectasus.com · ubs01@conectasus.com</p>
            <p>Senha para todas: 123456</p>
          </div>
        </section>
        <p className="mt-5 text-center text-xs text-muted-foreground">Gestão integrada de medicamentos</p>
      </div>
    </main>
  )
}
