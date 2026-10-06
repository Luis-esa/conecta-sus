# Utils

Funções puras de domínio e formatação serão centralizadas aqui: estoque, alertas, redistribuição e consumo. Não depender de componentes React, stores ou localStorage. O utilitário visual `cn` permanece em `@/lib/utils`.

`estoque.ts` já agrega os saldos por medicamento/unidade a partir dos lotes, sem alterar os dados de origem. As demais regras serão implementadas com os respectivos fluxos funcionais.
