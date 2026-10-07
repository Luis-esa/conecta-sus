# Services

`mockApi.ts` é o ponto de acesso dos stores. Expõe `mockApi.inicializarDados()`, `getUsuarios()`, `getUnidades()`, `getMedicamentos()`, `getLotes()`, `getEstoque()` e `getMovimentacoes()`, todos assíncronos. `getDadosAplicacao()` lê uma vez a base validada e retorna usuários, unidades, medicamentos, lotes e movimentações para o `appStore`. Cada leitura retorna dados independentes e consulta a persistência atual, sem cache mutável compartilhado.

`persistencia.ts` usa as chaves `conectasus_users`, `conectasus_unidades`, `conectasus_medicamentos`, `conectasus_lotes` e `conectasus_movimentacoes`. Inicializa apenas quando todas estão ausentes. Se já existem, lê e valida por `dadosSchema.ts`. Dados inválidos ou coleções parcialmente ausentes geram erro sem reset automático. Falhas ao gravar o seed desfazem somente as chaves recém-criadas; chaves de outros aplicativos e de sessão não são alteradas.

Estoque é calculado pela soma dos lotes, sem gravar `conectasus_estoque`. Combinações sem lotes não são inventadas; lotes com saldo zero continuam representados. Alertas e sugestões são derivados no store após a leitura do serviço, sem novas chaves de persistência.

`authApi.ts` consulta `getUsuarios()` do Mock Service, valida conta ativa e senha de demonstração e grava somente `{ usuarioId }` na chave `conectasus_session`. Na restauração, revalida o usuário contra os mocks persistidos; uma sessão inválida é removida. `logout()` remove a chave de sessão sem alterar os dados de domínio.

`registrarEntrada()`, `registrarSaida()` e `registrarTransferencia()` validam os dados com `movimentacaoSchema.ts` e as referências/permissões contra os registros persistidos. Entrada acrescenta saldo ao lote existente ou cria um novo; saída debita exclusivamente o lote selecionado e rejeita quantidade acima do saldo. Transferência reduz o lote da origem, acrescenta ou cria o lote correspondente no destino e vincula os lançamentos de saída e entrada a um registro consolidado. `salvarOperacao()` valida o conjunto e grava lotes e histórico, restaurando os lotes anteriores se a escrita do histórico falhar. O estoque permanece derivado dos lotes. A origem textual da entrada comum fica no campo `motivo` da movimentação.

`salvarMedicamento()`, `salvarUnidade()`, `salvarUsuario()` e `corrigirValidadeLote()` exigem administrador ativo, validam os formulários com `cadastroSchema.ts` e preservam IDs e movimentações. Cada cadastro altera apenas sua coleção. A quantidade dos lotes continua exclusiva das movimentações.

O bootstrap em `main.tsx` inicializa o `appStore`, que consulta o serviço e representa loading, conclusão e erro para feedback no React. Páginas não importam mocks nem acessam localStorage.

Os testes usam armazenamento isolado em memória e o executor nativo do Node, sem modificar dados do navegador. Este protótipo ainda não oferece transações entre abas, migração de versões ou recuperação automática de dados corrompidos.
