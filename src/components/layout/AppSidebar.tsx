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
    <div className="flex h-full min-h-0 flex-col bg-[#12345a] text-white">
      <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-3 border-b border-white/10 px-6 py-6" aria-label="ConectaSUS — Dashboard">
        <span className="flex size-10 items-center justify-center rounded-lg bg-white/10"><HeartPulse className="size-6" aria-hidden="true" /></span>
        <span><span className="block text-lg font-semibold tracking-tight">ConectaSUS</span><span className="block text-xs text-blue-100">Gestão de medicamentos</span></span>
      </Link>
      <nav aria-label="Navegação principal" className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        {(['Visão geral', 'Operação', 'Gestão'] as const).filter((group) => items.some((item) => item.group === group)).map((group) => (
          <div key={group} className="mb-5 last:mb-0">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-blue-200">{group}</p>
            <ul className="space-y-1">
              {items.filter((item) => item.group === group).map(({ path, title, icon: Icon }) => (
                <li key={path}>
                  <NavLink to={path} end onClick={onNavigate} className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm transition-colors',
                    isActive ? 'border-blue-300 bg-white/15 font-semibold text-white' : 'border-transparent text-blue-100 hover:bg-white/10 hover:text-white',
                  )}>
                    <Icon className="size-[18px] shrink-0" aria-hidden="true" />{title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-6 py-4 text-xs text-blue-100">
        <p className="font-medium text-white">Rede municipal de saúde</p>
        <p className="mt-1">Lagarto · Sergipe</p>
      </div>
    </div>
  )
}
