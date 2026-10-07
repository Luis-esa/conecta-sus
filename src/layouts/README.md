# Layouts

`DashboardLayout.tsx` compõe sidebar, header, feedback do carregamento e área principal com `Outlet`. Não acessa mocks ou localStorage.

`components/layout/AppSidebar.tsx` reutiliza a configuração de `routes/navigation.ts`, com grupos e rota atual indicada por texto, fundo, borda e `aria-current`. Desktop e notebook (1024 px ou mais) usam sidebar fixa; telas menores usam Sheet no header, com rolagem, fechamento ao navegar, Escape e foco controlado pelo Radix.

`AppHeader.tsx` apresenta título da rota, usuário atual, perfil/unidade e saída. Notificações permanecem desabilitadas até sua etapa. O título da aba acompanha a página. O layout oferece link para pular ao conteúdo.

`AppDataStatus.tsx` consome seletores do Zustand e mantém feedback de loading/erro e nova tentativa em todas as rotas do layout. Dashboard, estoque, medicamentos e lotes leem os dados do store; os demais módulos continuam placeholders explícitos.

`/login` fica fora do layout; `/` redireciona para `/dashboard`. `ProtectedRoute` envia visitantes sem sessão ao login, e `PermissionRoute` mostra acesso não autorizado para áreas fora do perfil. A sidebar usa a mesma matriz de permissões. URLs desconhecidas exibem 404 dentro do layout. Em uma futura hospedagem estática, configurar fallback das URLs da SPA para `index.html`, como ocorre no Vite dev/preview.
