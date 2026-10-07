# ConectaSUS

MVP para gestão integrada dos estoques de medicamentos das unidades de saúde de Lagarto. **O backend é simulado**: dados fictícios e persistência no localStorage do navegador.

## Stack

React, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), Lucide React, React Router, Zustand, React Hook Form, Zod, Recharts, date-fns e Sonner.

## Instalação e execução

Requer Node.js 22.22+ (recomendado 24) e npm. Dentro do repositório:

```sh
npm ci
npm run dev
```

Abra a URL indicada pelo Vite. No PowerShell, use `npm.cmd` se a política de execução bloquear `npm.ps1`.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

O build valida TypeScript e gera `dist/`. A hospedagem estática deve redirecionar rotas da SPA para `index.html`.

## Usuários de demonstração

Todos usam a senha fictícia `123456`.

| Perfil | E-mail | Escopo |
| --- | --- | --- |
| ADMIN | admin@conectasus.com | Operação e cadastros administrativos |
| GESTOR | gestor@conectasus.com | Rede municipal, histórico e relatórios |
| UBS | ubs01@conectasus.com | Estoque e operações da UBS 01 |

Também existem `ubs02@conectasus.com` até `ubs05@conectasus.com`, vinculados às respectivas unidades. Contas inativas não entram. Logout encerra a sessão; recarregar restaura a sessão ativa.

## Funcionalidades

- Dashboard com indicadores e gráficos derivados dos dados operacionais.
- Consulta de estoque e lotes com busca, filtros e validade.
- Entradas, saídas e transferências manuais, com validação de quantidades e saldo.
- Alertas de estoque baixo/crítico e vencimento em até 90 dias.
- Sugestões de redistribuição entre unidades; nunca executam transferências automaticamente.
- Consumo médio mensal e estimativa de meses de estoque, sem divisão por zero.
- Histórico somente para consulta, com filtros de período, medicamento, unidade, operação e usuário.
- Relatórios de estoque, validade, movimentações e consumo com tabelas e gráficos dos mesmos dados.
- ADMIN: cadastro, edição e ativação/inativação de medicamentos, unidades e usuários; correção de validade de lotes preservando seus vínculos. Novos lotes entram por movimentação, sem edição direta de saldo.
- Layout responsivo, navegação por perfil, feedback de erro/sucesso, carregamento e estados vazios.

## Estrutura

Fluxo: `Page → Store → Service → Mock Data / localStorage`.

```text
src/
├── components/  # UI, formulários, tabelas e gráficos
├── pages/       # telas operacionais e administrativas
├── layouts/     # estrutura de navegação responsiva
├── routes/      # rotas e permissões por perfil
├── stores/      # dados operacionais e sessão
├── services/    # mockApi, autenticação, validação e persistência
├── data/        # seed inicial tipado
├── types/       # contratos do domínio
├── utils/       # cálculos, filtros e regras testáveis
├── hooks/       # integração das consultas com React
└── lib/         # utilitários visuais
```

## Persistência e cenários

O seed contém 7 usuários, 5 unidades, 20 medicamentos, 23 lotes e 80 movimentações, com estoque normal, baixo, crítico, excesso, vencimento próximo e histórico insuficiente. As datas são relativas à primeira inicialização e não são renovadas ao recarregar.

As coleções usam `conectasus_users`, `conectasus_unidades`, `conectasus_medicamentos`, `conectasus_lotes` e `conectasus_movimentacoes`; a sessão usa `conectasus_session`. Estoque, alertas e sugestões são derivados, evitando saldos duplicados. O seed só é gravado quando todas as coleções estão ausentes. Dados inválidos geram erro e não são apagados automaticamente.

## Roteiro de demonstração

1. Entre como GESTOR e confira o dashboard e o estoque.
2. Em Movimentações, registre entrada de 50 de Dipirona na UBS 02, lote existente. No seed novo, o saldo passa de 80 para 130; recarregue e confirme.
3. Registre saída de 20: saldo 110. Tente uma saída maior que o disponível e confira a mensagem, sem mudança no saldo.
4. Transfira 25 de Paracetamol da UBS 01 para UBS 05. Confira redução e aumento iguais nas unidades e recarregue.
5. Consulte Histórico, filtre período/medicamento e confira os registros. Abra Alertas, Redistribuição e consumo e Relatórios.
6. Saia e entre como UBS 01: estoque, lotes, dashboard e histórico devem respeitar a unidade; administração e relatórios municipais não ficam disponíveis.
7. Opcionalmente, entre como ADMIN para demonstrar cadastros e inativação sem excluir o histórico.

Os saldos do roteiro dependem dos dados já persistidos. Para uma demonstração independente, use outro perfil de navegador ou outra porta de desenvolvimento, sem apagar a base existente.

## Limitações do MVP

- Sem backend, sincronização entre dispositivos, autenticação real ou proteção de dados no servidor. Perfis e senha são uma simulação; não utilizar dados reais.
- Persistência por origem/navegador; não oferece transações de banco nem coordenação de gravações simultâneas em várias abas. Use uma aba operacional por vez.
- Consumo considera os três meses calendários completos anteriores, exige saídas em todos eles e exclui débitos de transferências. Na ausência de histórico suficiente, não estima cobertura.
- Redistribuição usa excesso acima de duas vezes o mínimo e falta abaixo do mínimo; a decisão e a transferência são manuais.
- Relatórios são consultas em tela, sem geração complexa de PDF. Período, operação e usuário filtram movimentações; estoque e validade são fotografias atuais, e consumo usa sua janela mensal própria.
- Inativação preserva IDs e vínculos; nomes exibidos no histórico refletem os cadastros atuais. Não há trilha completa de auditoria de alterações cadastrais.
