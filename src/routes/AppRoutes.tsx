import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import DashboardLayout from '@/layouts/DashboardLayout'
import NotFound from '@/pages/NotFound'
import ProtectedRoute from './ProtectedRoute'
import PermissionRoute from './PermissionRoute'
import { navigation } from './navigation'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Login = lazy(() => import('@/pages/Login'))
const ModulePlaceholder = lazy(() => import('@/pages/ModulePlaceholder'))

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<main role="status" className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Carregando acesso…</main>}><Login /></Suspense>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {navigation.map((page) => <Route key={page.path} path={page.path} element={<PermissionRoute path={page.path}><Suspense fallback={<p role="status" className="text-sm text-muted-foreground">Carregando página…</p>}>{page.path === '/dashboard' ? <Dashboard /> : <ModulePlaceholder page={page} />}</Suspense></PermissionRoute>} />)}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
