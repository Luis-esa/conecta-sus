# ConectaSUS

Plataforma web para gestão integrada dos estoques de medicamentos das unidades de saúde de Lagarto.

O projeto contém a aplicação inicial, a fundação de UI e a camada de dados mockados com persistência local, sem módulos completos ou backend.

## Stack atual

React, TypeScript e Vite, com ESLint para análise estática.

UI: Tailwind CSS, shadcn/ui, Lucide React e Sonner.
Dependências para as próximas telas: React Router, Zustand, React Hook Form com Zod e resolvers, Recharts e date-fns.

## Base de UI

O Tailwind é integrado pelo plugin do Vite. As cores e tokens estão em `src/index.css`; o tema atual é claro e usa fontes do sistema, sem downloads de fontes.

Os componentes shadcn/ui (base Radix, estilo New York) ficam em `src/components/ui`, com configuração em `components.json` e imports pelo alias `@/`. Estão disponíveis Button, Input, Label, Card, Badge, Table, Dialog, Select, Dropdown Menu, Sheet, Tooltip e Sonner.

Use `primary` para ações, `success` para normal, `warning` para atenção e `destructive` para crítico, sempre acompanhando status com texto. O provider de Tooltip e o Toaster ficam na raiz da aplicação. Stores, formulários, gráficos e rotas de domínio serão criados nas próximas etapas.

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

Fluxo previsto: `Page → Store → Service → Mock Data / localStorage`.

- `pages/`: telas; a tela inicial existente está em `Inicio.tsx`.
- `routes/`: composição das rotas em `AppRoutes.tsx`, usando o BrowserRouter já configurado na raiz. Por enquanto, qualquer URL mantém a tela inicial.
- `layouts/`: futura composição visual compartilhada.
- `stores/`: futuro estado compartilhado e ações que chamarão os serviços.
- `services/`: Mock Service e persistência local, isolados da UI.
- `data/`: cadastros e seed inicial tipado, acessados pelos serviços.
- `types/`: contratos TypeScript do domínio, sem dependências de UI.
- `utils/`: agregação do estoque; futuras regras puras e formatação.
- `hooks/`: futuros hooks reutilizáveis de interface.
- `components/ui/` e `lib/`: componentes e utilitários visuais existentes.

Os diretórios ainda sem implementação possuem apenas notas de responsabilidade. Não há stores ou operações de entrada, saída e transferência nesta etapa.

Os tipos em `src/types/index.ts` preservam os campos e opcionais da seção 6 do `PROJECT_CONTEXT.md`: IDs numéricos e datas como strings. Tipos não validam dados em execução; `dadosSchema.ts` valida o formato e as referências da base local. Validações operacionais e permissões serão adicionadas aos futuros fluxos. Importe contratos com `import type { Medicamento } from '@/types'`.

## Dados locais

O bootstrap inicializa 7 usuários, 5 unidades, 20 medicamentos, 23 lotes e 80 movimentações. São exemplos fictícios. `mockApi` oferece leituras assíncronas; os futuros stores serão seus consumidores. O estoque (22 combinações iniciais) é derivado dos lotes, evitando saldos duplicados.

O seed só é persistido quando todas as cinco coleções estão ausentes. Recarregar não sobrescreve dados nem recalcula suas datas. Dados incompletos ou inválidos são preservados e geram feedback de erro, sem reset automático. Não há autenticação nesta etapa; a sessão não é modificada. Consulte `src/services/README.md` e `src/data/README.md` para contratos e cenários.

`npm test` usa o executor nativo do Node com TypeScript e armazenamento em memória, incluindo testes de reinicialização e preservação. Não é necessário instalar dependências de teste.
