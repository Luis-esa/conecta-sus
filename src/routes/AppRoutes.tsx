import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import DashboardLayout from '@/layouts/DashboardLayout'
import NotFound from '@/pages/NotFound'
import ProtectedRoute from './ProtectedRoute'
import PermissionRoute from './PermissionRoute'
import { navigation } from './navigation'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Login = lazy(() => import('@/pages/Login'))
const Estoque = lazy(() => import('@/pages/Estoque'))
const Medicamentos = lazy(() => import('@/pages/Medicamentos'))
const Lotes = lazy(() => import('@/pages/Lotes'))
const ModulePlaceholder = lazy(() => import('@/pages/ModulePlaceholder'))

const paginasOperacionais: Record<string, React.ReactNode> = {
  '/dashboard': <Dashboard />,
  '/estoque': <Estoque />,
  '/medicamentos': <Medicamentos />,
  '/lotes': <Lotes />,
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<main role="status" className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Carregando acesso…</main>}><Login /></Suspense>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {navigation.map((page) => <Route key={page.path} path={page.path} element={<PermissionRoute path={page.path}><Suspense fallback={<p role="status" className="text-sm text-muted-foreground">Carregando página…</p>}>{paginasOperacionais[page.path] ?? <ModulePlaceholder page={page} />}</Suspense></PermissionRoute>} />)}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
