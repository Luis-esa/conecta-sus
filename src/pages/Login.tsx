import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, HeartPulse, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'
import { podeAcessar } from '@/routes/permissoes'
import mascoteConectaSUS from '@/assets/mascote-conectasus.png'
import brasaoMarcaDagua from '@/assets/brasao-lagarto-marca-dagua.png'

const formularioSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.'),
})
type CamposLogin = z.infer<typeof formularioSchema>

const contas = [
  { perfil: 'Administrador', email: 'admin@conectasus.com' },
  { perfil: 'Gestor municipal', email: 'gestor@conectasus.com' },
  { perfil: 'Responsável UBS 01', email: 'ubs01@conectasus.com' },
] as const

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const inicializado = useAuthStore((state) => state.inicializado)
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const carregando = useAuthStore((state) => state.carregando)
  const erro = useAuthStore((state) => state.erro)
  const entrar = useAuthStore((state) => state.login)
  const { register, handleSubmit, setValue, setFocus, formState: { errors } } = useForm<CamposLogin>({
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

  return <main className="flex min-h-dvh items-center justify-center bg-background px-3 py-3 sm:px-6 sm:py-8 lg:px-8">
    <div className="mx-auto grid w-full max-w-[1320px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_48px_rgb(18_52_90_/_0.09)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
      <section className="relative isolate min-h-28 overflow-hidden bg-navigation px-5 py-6 text-white sm:px-8 md:min-h-[760px] md:px-8 md:py-9 lg:min-h-[800px] lg:px-10" aria-label="Sobre o ConectaSUS">
        <div className="pointer-events-none absolute -right-48 -top-44 hidden size-[550px] rounded-full bg-[#1754a1]/55 md:block" aria-hidden="true" />
        <img src={brasaoMarcaDagua} alt="" aria-hidden="true" className="pointer-events-none absolute right-0 top-12 hidden w-[50%] max-w-[320px] opacity-[0.13] md:block" />
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-44 w-full md:block" viewBox="0 0 700 176" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 34 C175 75 254 170 405 128 C526 95 617 26 700 10 L700 176 L0 176 Z" fill="#0b4b91" opacity="0.65" />
          <path d="M335 176 C471 153 555 74 700 33 L700 61 C577 100 507 170 414 176 Z" fill="#dbeafe" opacity="0.84" />
        </svg>
        <div className="relative z-30 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#1b5aa7]"><HeartPulse className="size-6" aria-hidden="true" /></span>
          <div className="min-w-0"><p className="text-xl font-semibold tracking-tight">ConectaSUS</p><p className="text-xs text-blue-100 sm:text-sm">Rede municipal de saúde · Lagarto, SE</p></div>
        </div>
        <div className="sr-only md:not-sr-only md:relative md:z-30 md:mt-16 md:max-w-[280px] lg:mt-28 lg:max-w-[320px]">
          <span className="mb-5 block h-1 w-10 rounded-full bg-[#4c86ff]" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Gestão integrada de medicamentos</p>
          <h1 className="mt-5 text-[clamp(1.75rem,3vw,2.45rem)] font-semibold leading-[1.13] tracking-tight">Informação para cuidar melhor do estoque de cada unidade.</h1>
          <p className="mt-5 max-w-[275px] text-sm leading-6 text-blue-100">Acompanhe saldos, vencimentos, movimentações e necessidades da rede em um só lugar.</p>
        </div>
        <img src={mascoteConectaSUS} alt="Mascote do ConectaSUS, um lagarto com jaleco e estetoscópio" className="pointer-events-none absolute bottom-0 right-0 z-20 hidden w-[59%] object-contain object-bottom md:block lg:-bottom-12 lg:right-[2%] lg:w-[74%] lg:max-w-[540px]" />
        <p className="absolute bottom-7 left-8 z-30 hidden max-w-52 items-center gap-3 text-xs leading-5 text-blue-100 md:flex lg:left-10"><ShieldCheck className="size-5 shrink-0 text-blue-200" aria-hidden="true" /> Ambiente de demonstração com dados simulados</p>
      </section>
      <section className="flex min-w-0 items-center px-6 py-8 sm:px-9 sm:py-10 md:min-h-[760px] md:px-8 lg:min-h-[800px] lg:px-12" aria-labelledby="titulo-login">
        <div className="mx-auto w-full max-w-[470px]">
          <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-accent text-primary"><LockKeyhole className="size-5" aria-hidden="true" /></span>
          <h2 id="titulo-login" className="text-page font-semibold tracking-tight lg:text-[1.75rem]">Acesso ao sistema</h2>
          <p className="mt-2 text-body text-muted-foreground">Use uma das contas de demonstração para entrar.</p>
          <form onSubmit={enviar} noValidate className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" className="h-11" type="email" autoComplete="username" placeholder="nome@conectasus.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-erro' : undefined} {...register('email')} />
              {errors.email && <p id="email-erro" role="alert" className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input id="senha" className="h-11 pr-12" type={mostrarSenha ? 'text' : 'password'} autoComplete="current-password" aria-invalid={Boolean(errors.senha)} aria-describedby={errors.senha ? 'senha-erro' : undefined} {...register('senha')} />
                <button type="button" className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-control text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={mostrarSenha} onClick={() => setMostrarSenha((valor) => !valor)}>{mostrarSenha ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}</button>
              </div>
              {errors.senha && <p id="senha-erro" role="alert" className="text-sm text-destructive">{errors.senha.message}</p>}
              <p className="text-helper text-muted-foreground">Esqueceu a senha? Contate o administrador.</p>
            </div>
            {erro && <p role="alert" className="rounded-control border border-status-critical-border bg-status-critical-bg px-3 py-2 text-sm text-status-critical-text">{erro} Confira o e-mail e a senha e tente novamente.</p>}
            <Button type="submit" className="h-11 w-full" disabled={carregando}>{carregando ? 'Verificando acesso…' : 'Entrar no ConectaSUS'}</Button>
          </form>
          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-semibold">Contas de demonstração</h3>
            <p className="mt-1 text-helper text-muted-foreground">Selecione um perfil para preencher o e-mail. Senha inicial das contas de demonstração: <strong>123456</strong>. O administrador pode alterá-la.</p>
            <div className="mt-4 grid gap-2">{contas.map((conta) => <button key={conta.email} type="button" className="flex min-h-11 min-w-0 flex-wrap items-center justify-between gap-x-2 rounded-control border px-3 py-2 text-left text-sm hover:border-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" onClick={() => { setValue('email', conta.email, { shouldValidate: true }); setFocus('senha') }}><span className="font-medium">{conta.perfil}</span><span className="wrap-anywhere text-xs text-muted-foreground">{conta.email}</span></button>)}</div>
          </div>
        </div>
      </section>
    </div>
  </main>
}
