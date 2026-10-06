# Services

`mockApi.ts` é o ponto de acesso dos futuros stores. Expõe `mockApi.inicializarDados()`, `getUsuarios()`, `getUnidades()`, `getMedicamentos()`, `getLotes()`, `getEstoque()` e `getMovimentacoes()`, todos assíncronos. Cada leitura retorna dados independentes e consulta a persistência atual, sem cache mutável compartilhado.

`persistencia.ts` usa as chaves `conectasus_users`, `conectasus_unidades`, `conectasus_medicamentos`, `conectasus_lotes` e `conectasus_movimentacoes`. Inicializa apenas quando todas estão ausentes. Se já existem, lê e valida por `dadosSchema.ts`. Dados inválidos ou coleções parcialmente ausentes geram erro sem reset automático. Falhas ao gravar o seed desfazem somente as chaves recém-criadas; chaves de outros aplicativos e de sessão não são alteradas.

Estoque é calculado pela soma dos lotes, sem gravar `conectasus_estoque`. Combinações sem lotes não são inventadas; lotes com saldo zero continuam representados. Alertas, sugestões e sessão ficam para suas etapas e não recebem coleções artificiais vazias agora.

O bootstrap em `main.tsx` inicializa a infraestrutura e trata erros com feedback. Páginas não importam mocks nem acessam localStorage. Futuras operações de entrada, saída e transferência serão métodos deste serviço, com validação e gravação consistente por esta camada; não existem stubs que aparentem sucesso.

Os testes usam armazenamento isolado em memória e o executor nativo do Node, sem modificar dados do navegador. Este protótipo ainda não oferece transações entre abas, migração de versões ou recuperação automática de dados corrompidos.
