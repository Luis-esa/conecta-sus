import { Route, Routes } from 'react-router'
import Inicio from '@/pages/Inicio'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Preserva a tela inicial em qualquer URL até a definição dos módulos. */}
      <Route path="*" element={<Inicio />} />
    </Routes>
  )
}
