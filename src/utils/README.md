# Utils

Funções puras de domínio e formatação são centralizadas aqui: estoque, validade, alertas, consultas e dashboard. Redistribuição e consumo serão acrescentados nas suas etapas. Não depender de componentes React, stores ou localStorage. O utilitário visual `cn` permanece em `@/lib/utils`.

`estoque.ts` agrega os saldos por medicamento/unidade e define a classificação normal/baixo/crítico. `validade.ts` centraliza a janela de 90 dias e a classificação vencido/próximo/regular. `alertas.ts` gera alertas ativos a partir dos saldos e lotes, incluindo severidade e recorte por UBS. `consultas.ts` monta e filtra linhas de estoque, lotes e catálogo sem alterar os dados de origem. `dashboard.ts` deriva indicadores, distribuição do estoque, resumos das unidades, pontos de atenção e movimentações recentes usando as mesmas regras. `escopo.ts` limita unidades, lotes, saldos e movimentações ao vínculo da UBS. Os cálculos não gravam alertas ou sugestões no localStorage.
