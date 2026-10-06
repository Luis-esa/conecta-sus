# ConectaSUS

Plataforma web para gestão integrada dos estoques de medicamentos das unidades de saúde de Lagarto.

Este primeiro passo contém apenas a aplicação inicial, sem funcionalidades de domínio ou backend.

## Stack atual

React, TypeScript e Vite, com ESLint para análise estática.

## Executar localmente

Requer Node.js 20.19+ na linha 20, ou 22.12+ (recomendado Node.js 24), e npm.

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
```

O build verifica o TypeScript e gera os arquivos em `dist/`. Para visualizar esse build localmente, execute `npm run preview`.

No PowerShell, se a política de execução bloquear `npm.ps1`, use `npm.cmd` no lugar de `npm` nos comandos acima.
