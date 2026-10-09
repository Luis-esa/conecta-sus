import { HeartPulse } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { navigation } from '@/routes/navigation'
import { podeAcessar } from '@/routes/permissoes'
import { useAuthStore } from '@/stores/authStore'

export default function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const items = usuario ? navigation.filter((item) => podeAcessar(usuario, item.path)) : []
  return (
    <div className="flex h-full min-h-0 flex-col bg-navigation text-white">
      <Link to="/dashboard" onClick={onNavigate} className="flex min-h-18 items-center gap-3 border-b border-white/15 px-5 py-3 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white" aria-label="ConectaSUS — Dashboard">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10"><HeartPulse className="size-5" aria-hidden="true" /></span>
        <span><span className="block text-lg font-semibold tracking-tight">ConectaSUS</span><span className="block text-xs text-blue-100">Gestão de medicamentos</span></span>
      </Link>
      <nav aria-label="Navegação principal" className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {(['Visão geral', 'Estoque', 'Operações', 'Monitoramento', 'Análise', 'Administração'] as const).filter((group) => items.some((item) => item.group === group)).map((group) => (
          <div key={group} className="mb-3 last:mb-0">
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-blue-100">{group}</p>
            <ul className="space-y-0.5">
              {items.filter((item) => item.group === group).map(({ path, title, icon: Icon }) => (
                <li key={path}>
                  <NavLink to={path} end onClick={onNavigate} className={({ isActive }) => cn(
                    'flex min-h-10 items-center gap-3 rounded-md border-l-[3px] px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white',
                    isActive ? 'border-white bg-white/20 font-semibold text-white' : 'border-transparent text-blue-100 hover:bg-white/10 hover:text-white',
                  )}>
                    <Icon className="size-[18px] shrink-0" strokeWidth={2} aria-hidden="true" /><span>{title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/15 px-5 py-3 text-xs text-blue-100">
        <p className="font-medium text-white">Rede municipal de saúde</p>
        <p className="mt-1">Lagarto · Sergipe</p>
      </div>
    </div>
  )
}
