# Stores

`appStore.ts` contém um store pequeno de dados de domínio, consumido por React através de `useAppStore(selector)`. Não acessa localStorage nem importa mocks: consulta `mockApi.getDadosAplicacao()`, que lê e valida as coleções em uma única chamada. Não há middleware de persistência duplicando a base local.

Estado: unidades, medicamentos, lotes, movimentações, `carregando`, `dadosCarregados` e `erro`. `alertas` é `null` antes da carga e depois contém a lista derivada dos lotes; é recalculado após entradas, saídas, transferências e recarga. Sugestões são derivadas dos saldos após carga, recarga e operações; nunca executam transferências automaticamente. `operacaoCarregando` e `operacaoErro` representam o registro de movimentações.

`authStore.ts` separa a sessão dos dados de domínio. Expõe `usuarioAtual`, `isAuthenticated`, `inicializado`, `carregando` e `erro`, além de `inicializar()`, `login()` e `logout()`. A persistência fica no `authApi`, não nos componentes. O bootstrap restaura a sessão uma vez, sem efeito de render que cause loop.

Actions:
- `inicializar()`: carrega uma vez após sucesso; chamadas simultâneas compartilham a mesma Promise.
- `recarregar()`: consulta novamente o serviço e substitui as coleções juntas. Mantém os últimos dados válidos se houver erro. A falha fica em `erro`, sem rejeição não tratada; uma nova tentativa é explícita.
- `registrarEntrada()`, `registrarSaida()` e `registrarTransferencia()`: delegam ao Mock Service e publicam lotes e movimentações após a persistência. Retornam sucesso/falha e expõem erro operacional para os formulários. Dados derivados são invalidados após a mudança.
- `limparErroOperacao()`: remove feedback antigo ao trocar de operação ou corrigir o formulário.

O bootstrap em `main.tsx` chama `inicializar()` fora do ciclo de render. `AppDataStatus.tsx`, no layout, assina apenas loading, erro e a action de nova tentativa. Não há efeito dependente do estado que provoque recargas em loop.

`appSelectors.ts` expõe seletores de coleções, loading, erro, conclusão e recarga. `selecionarEstoque` reutiliza `agregarEstoque` e memoriza o resultado por referência dos lotes, garantindo snapshots estáveis no React. Estoque não é uma segunda coleção editável. Consumidores devem tratar coleções e resultados dos seletores como somente leitura.

`criarAppStore(servico)` permite testes isolados de concorrência, erro, atualização e nova sessão.
