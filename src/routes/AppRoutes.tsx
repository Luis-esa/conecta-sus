import { Navigate, Route, Routes } from 'react-router'
import DashboardLayout from '@/layouts/DashboardLayout'
import ModulePlaceholder from '@/pages/ModulePlaceholder'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import { navigation } from './navigation'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {navigation.map((page) => <Route key={page.path} path={page.path} element={<ModulePlaceholder page={page} />} />)}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
