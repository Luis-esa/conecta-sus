# Utils

Funções puras de domínio e formatação serão centralizadas aqui: estoque, alertas, redistribuição e consumo. Não depender de componentes React, stores ou localStorage. O utilitário visual `cn` permanece em `@/lib/utils`.

`estoque.ts` agrega os saldos por medicamento/unidade a partir dos lotes, sem alterar os dados de origem. `dashboard.ts` deriva indicadores, distribuição do estoque, resumos das unidades, pontos de atenção e movimentações recentes. `escopo.ts` limita unidades, lotes, saldos e movimentações ao vínculo da UBS. Os cálculos do dashboard não gravam alertas ou sugestões; os fluxos próprios desses módulos serão implementados nas suas etapas.
