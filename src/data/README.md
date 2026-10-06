# Data

`catalogo.ts` contém 7 usuários fictícios, 5 unidades e 20 medicamentos. `seed.ts` cria 23 lotes e 80 movimentações (23 entradas e 57 saídas) com datas relativas à primeira inicialização. Os saldos reconciliam todo o histórico inicial; nenhum registro usa referências inexistentes.

Cenários: Paracetamol na UBS 01 tem 1.000 unidades em dois lotes; na UBS 05 tem 20; na UBS 02 tem 150. Dipirona tem 80 (baixo), Amoxicilina tem 20 (crítico), Losartana vence em 45 dias e Ácido fólico não tem saídas. Os demais medicamentos têm 150 unidades. Os mínimos são 100 e os máximos 300. São 22 combinações medicamento/unidade com estoque.

Os dados são consumidos apenas pelos serviços. Datas persistidas não se deslocam ao recarregar. Alertas e sugestões não são arrays fixos: serão derivados nas etapas próprias a partir destes cenários. Autenticação e senhas mockadas também ficam para a etapa de login.
