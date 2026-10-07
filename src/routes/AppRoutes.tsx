import { Navigate, Route, Routes } from 'react-router'
import DashboardLayout from '@/layouts/DashboardLayout'
import ModulePlaceholder from '@/pages/ModulePlaceholder'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import ProtectedRoute from './ProtectedRoute'
import PermissionRoute from './PermissionRoute'
import { navigation } from './navigation'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {navigation.map((page) => <Route key={page.path} path={page.path} element={<PermissionRoute path={page.path}><ModulePlaceholder page={page} /></PermissionRoute>} />)}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
