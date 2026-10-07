# Layouts

`DashboardLayout.tsx` compõe sidebar, header, feedback do carregamento e área principal com `Outlet`. Não acessa mocks ou localStorage.

`components/layout/AppSidebar.tsx` reutiliza a configuração de `routes/navigation.ts`, com grupos e rota atual indicada por texto, fundo, borda e `aria-current`. Desktop e notebook (1024 px ou mais) usam sidebar fixa; telas menores usam Sheet no header, com rolagem, fechamento ao navegar, Escape e foco controlado pelo Radix.

`AppHeader.tsx` apresenta o título da rota e espaços para usuário, unidade/perfil, notificações e saída. Não há usuário autenticado; os controles futuros estão desabilitados e identificados. O título da aba acompanha a página. O layout oferece link para pular ao conteúdo.

`AppDataStatus.tsx` consome seletores do Zustand e mantém feedback de loading/erro e nova tentativa em todas as rotas do layout. Os módulos são placeholders explícitos; não há indicadores fictícios nem funcionalidades de domínio nesta etapa.

`/login` fica fora do layout; `/` redireciona para `/dashboard`. URLs desconhecidas exibem 404 dentro do layout. As rotas ainda não têm proteção por perfil. Em uma futura hospedagem estática, configurar fallback das URLs da SPA para `index.html`, como ocorre no Vite dev/preview.
