# Utils

Funções puras de domínio e formatação serão centralizadas aqui: estoque, alertas, redistribuição e consumo. Não depender de componentes React, stores ou localStorage. O utilitário visual `cn` permanece em `@/lib/utils`.

`estoque.ts` agrega os saldos por medicamento/unidade e define a classificação normal/baixo/crítico. `validade.ts` centraliza a janela de 90 dias e a classificação vencido/próximo/regular. `consultas.ts` monta e filtra linhas de estoque, lotes e catálogo sem alterar os dados de origem. `dashboard.ts` deriva indicadores, distribuição do estoque, resumos das unidades, pontos de atenção e movimentações recentes usando as mesmas regras. `escopo.ts` limita unidades, lotes, saldos e movimentações ao vínculo da UBS. Os cálculos do dashboard não gravam alertas ou sugestões; os fluxos próprios desses módulos serão implementados nas suas etapas.
