# Stores

`appStore.ts` contém um store pequeno de dados de domínio, consumido por React através de `useAppStore(selector)`. Não acessa localStorage nem importa mocks: consulta `mockApi.getDadosAplicacao()`, que lê e valida as coleções em uma única chamada. Não há middleware de persistência duplicando a base local.

Estado: unidades, medicamentos, lotes, movimentações, `carregando`, `dadosCarregados` e `erro`. Alertas e sugestões são tipados como coleção ou `null`; nesta etapa permanecem `null` (ainda não calculados), sem simular ausência de resultados. Autenticação e `authStore` ficam para a etapa de login.

Actions:
- `inicializar()`: carrega uma vez após sucesso; chamadas simultâneas compartilham a mesma Promise.
- `recarregar()`: consulta novamente o serviço e substitui as coleções juntas. Mantém os últimos dados válidos se houver erro. A falha fica em `erro`, sem rejeição não tratada; uma nova tentativa é explícita.

O bootstrap em `main.tsx` chama `inicializar()` fora do ciclo de render. `Inicio.tsx` assina apenas loading, erro, conclusão e a action de nova tentativa. Não há efeito dependente do estado que provoque recargas em loop.

`appSelectors.ts` expõe seletores de coleções, loading, erro, conclusão e recarga. `selecionarEstoque` reutiliza `agregarEstoque` e memoriza o resultado por referência dos lotes, garantindo snapshots estáveis no React. Estoque não é uma segunda coleção editável. Consumidores devem tratar coleções e resultados dos seletores como somente leitura.

`criarAppStore(servico)` permite testes isolados de concorrência, erro, atualização e nova sessão. Não há actions de entrada, saída, transferência ou setters que alterem dados apenas em memória.
