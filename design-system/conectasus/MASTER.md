# ConectaSUS — sistema visual

Fonte de continuidade para a fase UI 3–9. Requisitos funcionais, `PROJECT_CONTEXT.md`, `AI_RULES.md` e o código operacional prevalecem sobre este documento.

## Direção

Sistema administrativo de saúde pública para uso diário. Priorizar leitura rápida, confiança, orientação e eficiência. Uma tela começa pelo título, contexto e ação principal; situações críticas vêm antes de métricas gerais. Não usar padrões de landing page, neomorfismo, gradientes decorativos nem animação de entrada.

## Base existente

- Usar os tokens de `src/index.css`: azul principal `#1d4ed8`, navegação `#12345a`, fundo `#f8fafc`, superfície branca e texto `#0f172a`.
- Tipografia de sistema (`Segoe UI`, fallback sans-serif), com números tabulares em colunas quantitativas. Não depender de fontes externas.
- Espaçamento de 4/8 px. Controles de pelo menos 44 px nas interações móveis. Superfícies com borda discreta e sombra mínima.
- Uma ação principal por seção; secundárias em contorno ou texto. Ícones Lucide com rótulo visível ou nome acessível.
- Status com texto e tom semântico: normal/ativo, atenção/baixo, crítico/vencido, informação e inativo. Nunca apenas cor.

## Dados e tabelas

- Cabeçalho claro, colunas por prioridade e quantidades alinhadas à direita. Datas, códigos e quantidades curtos não quebram; nomes, justificativas e observações podem quebrar.
- Em larguras estreitas, permitir rolagem **local** da tabela com indicação de uso. Nenhuma rolagem horizontal do documento.
- Busca, filtros, contagem e limpeza ficam próximos da tabela. Estados vazios orientam o próximo passo.
- Gráficos somente para comparação, distribuição ou tendência real. Título, período/unidade quando aplicável, tooltip, legenda e resumo textual ou tabela com valores.

## Formulários e diálogos

- Label visível, ajuda persistente para dependências, erros junto ao campo com `aria-invalid` e `aria-describedby`.
- Campos preenchidos automaticamente recebem indicação de somente leitura. Select dependente informa qual seleção falta.
- Diálogos usam foco e retorno de foco do Radix; cancelar e confirmar ficam no rodapé. Conteúdo rola dentro do diálogo em telas baixas.
- Erros de validação focam o primeiro campo inválido via React Hook Form; erro de operação aparece em região anunciada.

## Responsividade e acessibilidade

- Compor em 1440, 1280, 1024, 768, 375 e 320 px. Empilhar controles e cards conforme espaço, preservar todas as informações.
- Foco visível, navegação por teclado, link para conteúdo, títulos coerentes e contraste de texto. Respeitar movimento reduzido.

## Uso da skill ui-ux-pro-max

Consultas `--design-system` com variance 3, motion 2 e density 8 indicaram grade limpa e alto contraste. Consultas específicas `--domain ux` para tabelas/erros/foco, `--domain chart` para comparação categórica e `--stack react`/`shadcn` informaram os padrões acima. Os resultados de hero/CTA, neomorfismo, GSAP, fontes remotas e candlestick foram descartados porque não servem a uma operação municipal de medicamentos. O gerador não foi persistido diretamente porque esses resultados incompatíveis entrariam no `MASTER.md`.
