# ConectaSUS

Plataforma web para gestão integrada dos estoques de medicamentos das unidades de saúde de Lagarto.

O projeto contém UI, dados mockados com persistência local, estado global com Zustand, layout, autenticação simulada por perfil e consultas e movimentações operacionais, sem backend.

## Stack atual

React, TypeScript e Vite, com ESLint para análise estática.

UI: Tailwind CSS, shadcn/ui, Lucide React e Sonner.
React Router compõe as rotas; Zustand conecta o estado ao React; Zod valida os dados locais e os formulários; React Hook Form gerencia os formulários. date-fns trata datas e Recharts visualiza indicadores do dashboard.

## Base de UI

O Tailwind é integrado pelo plugin do Vite. As cores e tokens estão em `src/index.css`; o tema atual é claro e usa fontes do sistema, sem downloads de fontes.

Os componentes shadcn/ui (base Radix, estilo New York) ficam em `src/components/ui`, com configuração em `components.json` e imports pelo alias `@/`. Estão disponíveis Button, Input, Label, Card, Badge, Table, Dialog, Select, Dropdown Menu, Sheet, Tooltip e Sonner.

Use `primary` para ações, `success` para normal, `warning` para atenção e `destructive` para crítico, sempre acompanhando status com texto. O provider de Tooltip e o Toaster ficam na raiz da aplicação.

## Executar localmente

Requer Node.js 22.22+ (recomendado Node.js 24) e npm.

Na pasta do repositório, instale as dependências:

```sh
npm install
```

Inicie o ambiente de desenvolvimento e abra a URL indicada no terminal:

```sh
npm run dev
```

## Build e verificações

```sh
npm run build
npm run lint
npm run typecheck
npm test
```

O build verifica o TypeScript e gera os arquivos em `dist/`. Para visualizar esse build localmente, execute `npm run preview`.

No PowerShell, se a política de execução bloquear `npm.ps1`, use `npm.cmd` no lugar de `npm` nos comandos acima.

## Arquitetura

Fluxo atual: `Page → Store → Service → Mock Data / localStorage`.

- `pages/`: dashboard, consultas de estoque, medicamentos e lotes, entradas, saídas e transferências, placeholders dos demais módulos, login, acesso negado e página 404.
- `routes/`: rotas, proteção e permissões, com BrowserRouter na raiz.
- `layouts/`: `DashboardLayout`, com sidebar, header e conteúdo via Outlet.
- `stores/`: `appStore` para dados de domínio e `authStore` para sessão, com seletores para consumo pelo React.
- `services/`: Mock Service e persistência local, isolados da UI.
- `data/`: cadastros e seed inicial tipado, acessados pelos serviços.
- `types/`: contratos TypeScript do domínio, sem dependências de UI.
- `utils/`: agregação/classificação do estoque, validade, consultas, cálculos do dashboard e recorte por unidade.
- `hooks/`: `useConsultas` conecta as consultas ao store e ao perfil atual.
- `components/ui/` e `lib/`: componentes e utilitários visuais existentes.

Os diretórios ainda sem implementação possuem apenas notas de responsabilidade. Alertas e redistribuição pertencem às próximas etapas.

Os tipos em `src/types/index.ts` preservam os campos e opcionais da seção 6 do `PROJECT_CONTEXT.md`: IDs numéricos e datas como strings. Tipos não validam dados em execução; `dadosSchema.ts` valida o formato e as referências da base local. As operações de estoque têm validação própria em `movimentacaoSchema.ts` e no serviço. Importe contratos com `import type { Medicamento } from '@/types'`.

## Dados locais

O bootstrap inicializa 7 usuários, 5 unidades, 20 medicamentos, 23 lotes e 80 movimentações. São exemplos fictícios. O `appStore` consulta `mockApi.getDadosAplicacao()` e publica as coleções de domínio juntas. O estoque (22 combinações iniciais) é derivado dos lotes por um seletor estável, evitando saldos duplicados.

`main.tsx` inicializa o store fora do ciclo de render. O layout consome seletores para loading e erro, com botão de nova tentativa. Chamadas concorrentes compartilham a requisição; inicializar após sucesso não recarrega. `recarregar()` atualiza a partir do serviço, preservando os últimos dados válidos em caso de falha. Alertas e sugestões permanecem `null` (não calculados) até suas etapas. Consulte `src/stores/README.md`.

## Layout e navegação

Rotas: `/login`, `/dashboard`, `/estoque`, `/medicamentos`, `/lotes`, `/movimentacoes`, `/transferencias`, `/alertas`, `/relatorios`, `/unidades`, `/usuarios` e `/historico`. A raiz redireciona para Dashboard; URLs desconhecidas exibem 404. Dashboard, estoque, medicamentos, lotes, movimentações e transferências usam dados do store; os demais módulos de domínio continuam placeholders. Login fica fora do layout; as demais rotas exigem sessão.

A sidebar usa azul institucional, com rota ativa destacada e grupos de navegação conforme o perfil. A partir de 1024 px fica fixa; abaixo disso, abre em Sheet pelo botão do header. O header mostra usuário, perfil/unidade e saída. Consulte `src/layouts/README.md`.

O Vite permite abrir e recarregar URLs diretamente em dev e preview. Uma futura hospedagem estática deve encaminhar as rotas da SPA para `index.html`. O ESLint ignora a cópia de trabalho em `.kilo/worktrees` e fixa a raiz desta configuração.

O seed só é persistido quando todas as cinco coleções estão ausentes. Recarregar não sobrescreve dados nem recalcula suas datas. Dados incompletos ou inválidos são preservados e geram feedback de erro, sem reset automático. Consulte `src/services/README.md` e `src/data/README.md` para contratos e cenários.

## Login de demonstração

Use `admin@conectasus.com`, `gestor@conectasus.com` ou `ubs01@conectasus.com`, todos com senha `123456`. O `authStore` solicita ao serviço a validação do usuário ativo dos mocks; a sessão guarda somente o ID em `conectasus_session` e é restaurada ao recarregar. Sair remove essa chave. A validação do formulário usa React Hook Form e Zod.

ADMIN acessa todas as áreas, GESTOR acessa a visão municipal sem administração, e UBS acessa as operações permitidas para sua unidade. A sidebar esconde áreas não autorizadas e o acesso direto a elas mostra “Acesso não autorizado.”. `filtrarDadosDaUnidade` prepara o recorte de unidades, lotes, estoque e movimentações para as próximas telas. Essas restrições de frontend são apenas uma simulação para o protótipo.

## Dashboard

`/dashboard` apresenta indicadores calculados de unidades, medicamentos, situações de estoque crítico e baixo, vencimentos e possibilidades de redistribuição. O gráfico usa Recharts para mostrar a distribuição dos saldos por situação; a tabela resume cada unidade. Pontos de atenção e movimentações recentes são derivados dos lotes e do histórico persistidos. Não há valores de indicadores fixos na UI.

O cálculo do painel está em `src/utils/dashboard.ts`, usando a classificação de `src/utils/estoque.ts` e a janela de vencimento de `src/utils/validade.ts`. O contador de redistribuição é uma prévia municipal de necessidades com ao menos uma origem acima de duas vezes o mínimo; não cria sugestão persistida nem executa transferência. ADMIN e GESTOR veem a rede; UBS recebe apenas o recorte da própria unidade. O dashboard mostra carregamento, vazio e erro conforme o estado do store.

## Consultas operacionais

`/estoque` mostra o saldo agregado por medicamento/unidade, mínimo, quantidade de lotes, validade mais próxima com saldo e status. A busca cobre nome, princípio ativo, código e número do lote; filtros de unidade, status e validade podem ser combinados. O link de lotes abre `/lotes` com medicamento e unidade selecionados. `/lotes` mostra cada lote, quantidade, entrada e validade; `/medicamentos` mostra os campos do catálogo, limites e situação ativa/inativa. As tabelas permitem rolagem horizontal em telas menores.

As linhas e filtros são funções puras de `src/utils/consultas.ts`; as páginas recebem dados pelo `useConsultas`, sem consultar mocks ou localStorage diretamente. Para UBS, estoque e lotes mostram somente a unidade vinculada. A rota de medicamentos segue a matriz de permissões vigente e não está disponível para UBS. Cadastro e edição administrativos ficam para a etapa própria.

## Entradas e saídas

`/movimentacoes` registra entrada em lote existente ou novo e saída de um lote com saldo. Os formulários usam React Hook Form e Zod; o serviço confirma medicamento, unidade, perfil, lote e quantidade antes de gravar. A saída não aceita quantidade maior que o saldo do lote, zero ou negativa. O estoque é recalculado dos lotes, e as movimentações aparecem no histórico recente e nos dados derivados do dashboard. A origem textual da entrada é registrada no motivo da movimentação, conforme o contrato atual. A gravação persiste lote e histórico em `localStorage`, com restauração do lote anterior caso a escrita do histórico falhe.

`npm test` usa o executor nativo do Node com TypeScript e armazenamento em memória, incluindo testes de reinicialização, preservação e entradas e saídas. Não é necessário instalar dependências de teste.

## Transferências

`/transferencias` move uma quantidade de um lote entre unidades ativas. O perfil UBS pode enviar somente da própria unidade; ADMIN e GESTOR podem selecionar a origem. O serviço rejeita origem igual ao destino, quantidade não positiva ou acima do saldo, lote inexistente/incompatível e medicamento indisponível. No destino, soma ao lote com mesmo medicamento, número e validade ou cria um novo lote. Um registro `TRANSFERENCIA` com origem, destino e usuário vincula os lançamentos `SAIDA` e `ENTRADA`; o histórico recente mostra uma linha consolidada. Lotes e movimentações são gravados juntos pela camada de persistência com reversão em falha de escrita. Estoque e indicadores são derivados dos lotes atualizados.
