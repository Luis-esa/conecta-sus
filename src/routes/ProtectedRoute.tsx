import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '@/stores/authStore'

export default function ProtectedRoute() {
  const inicializado = useAuthStore((state) => state.inicializado)
  const usuario = useAuthStore((state) => state.usuarioAtual)
  const location = useLocation()

  if (!inicializado) return <main className="flex min-h-dvh items-center justify-center p-6 text-sm text-muted-foreground" role="status">Verificando sessão…</main>
  if (!usuario) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}
