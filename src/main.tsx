import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { mockApi } from '@/services/mockApi'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>,
)

// Bootstrap da infraestrutura; páginas continuam sem acesso direto aos dados.
void mockApi.inicializarDados().catch(() => {
  toast.error('Não foi possível carregar os dados locais. Os registros existentes foram preservados.', {
    duration: Infinity,
  })
})
