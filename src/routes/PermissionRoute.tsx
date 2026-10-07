import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { podeAcessar } from './permissoes'
import AccessDenied from '@/pages/AccessDenied'

export default function PermissionRoute({ path, children }: { path: string; children: ReactNode }) {
  const usuario = useAuthStore((state) => state.usuarioAtual)
  return usuario && podeAcessar(usuario, path) ? children : <AccessDenied />
}
