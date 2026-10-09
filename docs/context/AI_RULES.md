# ConectaSUS — AI_RULES.md

> Regras operacionais para qualquer IA/agente que trabalhe neste repositório.
>
> **OBRIGATÓRIO:** ler este arquivo e `PROJECT_CONTEXT.md` antes de criar, editar, refatorar, mover ou remover código.

---

# 1. HIERARQUIA DE CONTEXTO

Use as fontes nesta ordem:

1. Requisitos originais do ConectaSUS — definem o comportamento e o domínio.
2. `PROJECT_CONTEXT.md` — define arquitetura, stack, MVP, entidades, regras e prioridades.
3. `AI_RULES.md` — define como a IA deve trabalhar.
4. `REFERENCE_ANALYSIS.md`, quando existir — apenas referência de UX/UI.
5. Código atual — representa o estado real e mais recente da implementação.

Em caso de conflito de escopo, os requisitos do ConectaSUS prevalecem.

Uma referência externa nunca pode transformar o ConectaSUS em um sistema genérico de clínica.

---

# 2. O QUE É O CONECTASUS

O ConectaSUS é uma plataforma web para gestão integrada dos estoques de medicamentos das unidades de saúde.

Domínio principal:

- usuários;
- unidades de saúde;
- medicamentos;
- lotes;
- estoque;
- entradas;
- saídas;
- transferências;
- alertas;
- consumo;
- redistribuição;
- histórico;
- relatórios.

O problema central é transformar dados distribuídos de estoque em informação operacional para prevenção de faltas, excessos, desperdícios e melhor redistribuição.

---

# 3. FASE ATUAL

Estamos construindo um **MVP/protótipo funcional de aproximadamente 15 dias**.

Prioridades:

1. funcionamento;
2. experiência do usuário;
3. visual;
4. regras de negócio;
5. organização do código;
6. preparação para backend futuro.

O objetivo desta fase NÃO é criar um sistema de produção.

---

# 4. STACK OFICIAL

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Router
- Zustand
- React Hook Form
- Zod
- Recharts
- date-fns
- localStorage

Não trocar a stack sem necessidade real.
Não instalar bibliotecas desnecessárias.

---

# 5. BACKEND: NÃO IMPLEMENTAR AGORA

Não implementar nesta fase:

- Spring Boot;
- MySQL;
- Flyway;
- JWT real;
- autenticação real;
- cloud obrigatória;
- integrações externas;
- Supabase/Firebase apenas por conveniência;
- infraestrutura complexa.

O backend futuro poderá seguir:

```text
React
  ↓
REST API
  ↓
Spring Boot
  ↓
JPA/Hibernate
  ↓
MySQL
```

O código atual deve ser preparado para essa evolução, mas sem antecipá-la.

---

# 6. ARQUITETURA DO MVP

Preferir:

```text
Page
  ↓
Store
  ↓
Service
  ↓
Mock Data / localStorage
```

A UI não deve acessar diretamente arrays de mock.

Criar uma camada de serviço, por exemplo:

```text
src/services/mockApi.ts
```

As operações de dados devem ficar desacopladas da apresentação.

---

# 7. DADOS MOCKADOS DEVEM SER FUNCIONAIS

Mockar comportamento, não apenas aparência.

Exemplo obrigatório:

```text
Entrada de 500 unidades
      ↓
estoque aumenta
      ↓
lote é atualizado
      ↓
histórico recebe movimentação
      ↓
alertas são recalculados
      ↓
dashboard reflete a alteração
```

Os dados devem ser coerentes entre:

```text
medicamento ↔ lote ↔ unidade ↔ estoque ↔ movimentação
```

Não criar inconsistências artificiais.

---

# 8. LOCALSTORAGE

Pode usar localStorage para persistência local.

Chaves sugeridas:

```text
conectasus_users
conectasus_unidades
conectasus_medicamentos
conectasus_lotes
conectasus_estoque
conectasus_movimentacoes
conectasus_alertas
conectasus_sugestoes
conectasus_session
```

Primeira execução:

```text
localStorage vazio
  ↓
carregar mocks iniciais
  ↓
salvar localmente
```

Nunca tratar localStorage como banco relacional real.

---

# 9. ESTADO GLOBAL

Usar Zustand para o estado compartilhado.

Pode haver, inicialmente:

```text
authStore
appStore
```

Se o store crescer demais, dividir por responsabilidade.

Não criar um store gigantesco apenas para evitar dois ou três arquivos.

---

# 10. REGRAS DE NEGÓCIO DEVEM SER CENTRALIZADAS

Não duplicar regras em componentes.

Preferir utilitários como:

```text
src/utils/estoque.ts
src/utils/alertas.ts
src/utils/redistribuicao.ts
src/utils/consumo.ts
```

Exemplos:

```text
getStockStatus()
calculateAverageConsumption()
calculateStockDuration()
generateAlerts()
generateRedistributionSuggestions()
```

Uma regra de negócio deve possuir uma fonte principal de verdade.

---

# 11. REGRAS DE ESTOQUE

## Estoque baixo

```text
estoqueAtual <= estoqueMinimo
```

## Estoque crítico

Regra inicial do MVP:

```text
estoqueAtual <= estoqueMinimo * 0.30
```

Essa regra deve ficar centralizada e fácil de alterar.

Não espalhar valores mágicos pela UI.

---

# 12. VENCIMENTO

Usar uma constante configurável, por exemplo:

```ts
const DIAS_ALERTA_VENCIMENTO = 90
```

Regra:

```text
diasParaVencer <= DIAS_ALERTA_VENCIMENTO
```

Não repetir `90` em vários arquivos.

---

# 13. ENTRADA

Regra:

```text
novoEstoque = estoqueAtual + quantidadeRecebida
```

Após confirmar:

1. validar;
2. atualizar estoque;
3. atualizar lote;
4. registrar movimentação;
5. recalcular alertas;
6. atualizar indicadores;
7. exibir feedback.

---

# 14. SAÍDA

Nunca permitir:

```text
quantidadeSolicitada > estoqueDisponivel
```

Também impedir:

```text
quantidade <= 0
```

Se válida:

```text
novoEstoque = estoqueAtual - quantidade
```

Depois atualizar estoque, lote, histórico e alertas.

Mensagem de erro deve explicar o motivo.

Exemplo:

```text
Estoque insuficiente.
Disponível: 50
Solicitado: 80
```

---

# 15. TRANSFERÊNCIA

Uma transferência deve:

1. validar origem;
2. validar destino;
3. validar medicamento;
4. validar lote;
5. validar quantidade;
6. retirar da origem;
7. adicionar ao destino;
8. registrar movimentação;
9. atualizar histórico;
10. recalcular alertas;
11. atualizar dashboard.

Nunca permitir:

```text
origem == destino
quantidade <= 0
quantidade > estoque da origem
lote inexistente
lote incompatível com a origem
```

---

# 16. REDISTRIBUIÇÃO

A redistribuição é uma **sugestão**, não uma operação automática.

Regra inicial:

```text
estoqueOrigem > estoqueMinimo * 2
```

e:

```text
estoqueDestino < estoqueMinimo
```

Fluxo:

```text
Sistema analisa
  ↓
Sugestão
  ↓
Gestor analisa
  ↓
Gestor decide
  ↓
Transferência manual, se desejada
```

Nunca executar transferência automaticamente por causa de uma sugestão.

---

# 17. CONSUMO

Usar histórico de saídas.

Consumo médio mensal deve ser calculado a partir dos dados disponíveis.

Estimativa:

```text
mesesDeEstoque = estoqueAtual / consumoMedioMensal
```

Nunca dividir por zero.

Se não houver histórico suficiente:

```text
Sem histórico de consumo suficiente.
```

---

# 18. PERFIS

Perfis:

```text
ADMIN
GESTOR
UBS
```

## ADMIN
Acesso completo.

## GESTOR
Visão centralizada de todas as unidades e relatórios.

## UBS
Acesso principalmente à própria unidade.

Usuário UBS deve possuir `unidadeId` quando aplicável.

---

# 19. LOGIN

Autenticação mockada.

Usuários de demonstração podem incluir:

```text
admin@conectasus.com / 123456
gestor@conectasus.com / 123456
ubs01@conectasus.com / 123456
```

Fluxo:

```text
login
 ↓
validar mock
 ↓
salvar sessão
 ↓
identificar role
 ↓
dashboard
```

Persistir sessão localmente.

---

# 20. PERMISSÕES

As permissões no MVP são simuladas no frontend.

Isso é comportamento de demonstração, não segurança real.

Rotas e menus devem respeitar o perfil.

Usuário UBS não deve visualizar informações de outras unidades.

Usuário sem permissão deve receber:

```text
Acesso não autorizado.
```

---

# 21. UI/UX

O visual deve ser institucional, moderno e confiável.

Priorizar:

- clareza;
- hierarquia;
- espaçamento;
- tabelas limpas;
- cards;
- badges;
- modais;
- filtros;
- feedback visual.

Base visual:

```text
Azul institucional
Branco
Cinza claro
```

Estados:

```text
Verde → Normal
Amarelo → Baixo/Atenção
Vermelho → Crítico
```

Não depender somente da cor: o texto do status também deve aparecer.

Evitar:

- excesso de gradientes;
- excesso de sombras;
- animações desnecessárias;
- visual gamer;
- aparência de dashboard genérico de startup;
- telas excessivamente carregadas.

---

# 22. COMPONENTIZAÇÃO

Preferir componentes reutilizáveis, por exemplo:

```text
PageHeader
StatCard
DataTable
StatusBadge
StockStatusBadge
EmptyState
LoadingState
ConfirmDialog
FormModal
SearchInput
FilterSelect
NotificationPanel
AlertCard
MedicationCard
TransferDialog
```

Não duplicar estruturas grandes de UI.

Não criar componentes gigantes com toda a regra de negócio dentro.

---

# 23. FORMULÁRIOS

Usar:

```text
React Hook Form
Zod
```

Validar:

- obrigatórios;
- números;
- quantidades;
- referências existentes;
- combinações inválidas.

Todo formulário deve dar feedback de erro e sucesso.

---

# 24. TABELAS E FILTROS

Tabelas devem priorizar legibilidade.

Pesquisa deve considerar quando aplicável:

- nome;
- princípio ativo;
- código;
- lote.

Filtros podem incluir:

- unidade;
- situação;
- validade;
- período;
- tipo de movimentação.

Sempre oferecer uma forma clara de limpar filtros.

---

# 25. ALERTAS

Tipos principais:

```text
ESTOQUE_BAIXO
ESTOQUE_CRITICO
VENCIMENTO
```

Alertas devem ser derivados dos dados atuais.

Não criar números falsos diretamente na UI.

O contador de notificações deve refletir os dados.

---

# 26. DASHBOARD

O dashboard é a vitrine da aplicação.

Indicadores devem ser calculados dos dados:

```text
Unidades
Medicamentos
Estoque crítico
Estoque baixo
Próximos do vencimento
Possíveis redistribuições
```

Também podem aparecer:

- gráfico de situação dos estoques;
- gráfico de consumo;
- situação das unidades;
- alertas recentes;
- movimentações recentes;
- sugestões de redistribuição.

Nunca hard-code indicadores que deveriam ser derivados.

---

# 27. DADOS MOCKADOS

Criar dados realistas de demonstração.

Exemplos:

```text
Paracetamol 500 mg
Dipirona 500 mg
Amoxicilina 500 mg
Losartana 50 mg
Ibuprofeno 600 mg
Omeprazol 20 mg
Metformina 850 mg
```

Unidades:

```text
UBS 01
UBS 02
UBS 03
UBS 04
UBS 05
```

Criar cenários:

```text
Normal
Baixo
Crítico
Próximo do vencimento
Estoque elevado
Redistribuição possível
Sem histórico de consumo
```

É melhor ter 20+ medicamentos coerentes do que centenas de registros inconsistentes.

---

# 28. CONSISTÊNCIA DOS MOCKS

Exemplo inválido:

```text
estoque = 500
lote A = 400
lote B = 300
```

quando não houver qualquer regra que justifique isso.

Os mocks devem ser coerentes o suficiente para suportar a demonstração.

---

# 29. ROTAS

Rotas esperadas:

```text
/login
/dashboard
/estoque
/medicamentos
/lotes
/movimentacoes
/transferencias
/alertas
/relatorios
/unidades
/usuarios
/historico
```

Adaptar à estrutura existente somente quando necessário.

---

# 30. REFERÊNCIA HOSPITALAR EXTERNA

O repositório `hospitalmanagement` é apenas referência de UX/UI e organização visual.

Ele não é o código-base do ConectaSUS.

Não importar automaticamente:

- Django;
- models;
- views;
- templates;
- banco;
- consultas;
- médicos;
- pacientes;
- internação;
- faturamento.

Pode aproveitar conceitos como:

- organização de dashboards;
- navegação por perfil;
- tabelas;
- formulários;
- agrupamento de módulos;
- padrões visuais.

Sempre adaptar para o domínio de estoque de medicamentos.

---

# 31. LOVABLE

Caso o projeto tenha sido iniciado ou acelerado no Lovable:

- preservar o que estiver correto;
- revisar a estrutura antes de refatorar;
- não criar dependência proprietária desnecessária;
- não adicionar backend gerenciado apenas para facilitar uma tela;
- manter o projeto executável localmente;
- continuar seguindo este arquivo e `PROJECT_CONTEXT.md`.

---

# 32. ANTIGRAVITY

Antigravity pode ser o principal agente de implementação.

Antes de uma tarefa:

1. ler a documentação;
2. analisar o código atual;
3. localizar os arquivos afetados;
4. implementar a menor mudança necessária;
5. testar;
6. revisar possíveis regressões.

Não refatorar o projeto inteiro para implementar uma pequena funcionalidade.

---

# 33. OPENCODE

OpenCode pode ser utilizado para:

- implementação;
- debugging;
- análise de código;
- refatorações pontuais;
- correções;
- revisão.

O histórico do OpenCode é útil, mas não substitui os documentos oficiais.

Sempre consultar:

```text
AI_RULES.md
PROJECT_CONTEXT.md
```

---

# 34. MÚLTIPLAS IAS

Evitar alterações estruturais simultâneas.

Fluxo recomendado:

```text
IA A implementa
      ↓
executar/testar
      ↓
commit
      ↓
IA B revisa ou corrige
```

Não deixar Lovable, Antigravity e OpenCode alterando o mesmo estado do projeto ao mesmo tempo sem coordenação.

---

# 35. GIT

Preferir commits pequenos e descritivos.

Exemplos:

```text
feat: cria layout principal
feat: adiciona login mockado
feat: implementa dashboard
feat: adiciona estoque
feat: implementa entradas e saídas
feat: implementa transferências
feat: adiciona alertas
feat: adiciona redistribuição
fix: corrige validação de estoque
refactor: centraliza regra de alertas
```

Antes de uma grande refatoração, criar commit de segurança.

---

# 36. NÃO DESTRUIR FUNCIONALIDADES

Antes de modificar algo que já funciona:

- entender a implementação;
- identificar dependências;
- alterar somente o necessário;
- testar o fluxo afetado.

Não substituir uma solução funcional por outra sem ganho claro.

---

# 37. NÃO CRIAR COMPLEXIDADE PREMATURA

Perguntar:

```text
Existe solução mais simples?
```

antes de introduzir:

- bibliotecas;
- abstrações;
- hooks genéricos;
- camadas extras;
- infraestrutura;
- padrões complexos.

O prazo é curto. Simplicidade é requisito.

---

# 38. NÃO HARD-CODAR DADOS NA UI

Evitar:

```tsx
<StatCard value="8" />
```

quando `8` deveria ser calculado.

Preferir:

```text
Dados
 ↓
Selector/serviço
 ↓
Componente
```

Isso vale para:

- cards;
- gráficos;
- alertas;
- tabelas;
- contadores;
- sugestões.

---

# 39. DATAS

Utilizar `date-fns` quando necessário.

Manter datas internas em formato consistente.

Na apresentação, usar formato brasileiro quando apropriado:

```text
dd/MM/yyyy
```

Evitar cálculos manuais de datas espalhados por componentes.

---

# 40. LOADING / EMPTY / ERROR

Toda tela relevante deve possuir estados adequados quando necessário:

```text
loading
empty
error
success
```

Exemplo de empty state:

```text
Nenhum medicamento encontrado.
Tente alterar os filtros.
```

---

# 41. ACESSIBILIDADE MÍNIMA

Priorizar:

- labels nos campos;
- contraste suficiente;
- foco visível;
- botões claros;
- mensagens de erro compreensíveis;
- navegação previsível;
- status com texto além de cor.

---

# 42. ORDEM DE IMPLEMENTAÇÃO

Seguir preferencialmente:

```text
1. Fundação
2. Layout
3. Login
4. Dados + stores + mock service
5. Dashboard
6. Estoque
7. Medicamentos
8. Lotes
9. Entrada
10. Saída
11. Transferência
12. Alertas
13. Redistribuição
14. Consumo
15. Histórico
16. Relatórios
17. Unidades
18. Usuários
19. Permissões
20. Polimento
```

Se o tempo apertar, priorizar P0 conforme `PROJECT_CONTEXT.md`.

---

# 43. O QUE É P0

Obrigatório:

```text
Login
Dashboard
Estoque
Entrada
Saída
Transferência
Alertas
Redistribuição
Histórico
Relatórios
```

---

# 44. O QUE É P1

Importante:

```text
Medicamentos
Lotes
Unidades
Usuários
Permissões detalhadas
```

---

# 45. O QUE É P2

Futuro:

```text
Backend
Banco real
JWT
Cloud
Backup
Auditoria real
Multiusuário real
API
Integrações
```

---

# 46. COMO RECEBER TAREFAS

Preferir tarefas pequenas e verificáveis.

Bom:

```text
Implemente a tela de estoque.

Requisitos:
- tabela;
- pesquisa;
- filtros;
- status;
- entrada;
- saída;
- dados via store/service;
- sem HTTP real.

Não altere outras áreas além do necessário.
```

Evitar:

```text
Faça o sistema inteiro.
```

---

# 47. ANTES DE UMA IMPLEMENTAÇÃO

A IA deve sempre:

```text
1. Ler AI_RULES.md
2. Ler PROJECT_CONTEXT.md
3. Ler os requisitos relevantes
4. Analisar o código existente
5. Identificar arquivos afetados
6. Implementar a solução mais simples
7. Testar
8. Revisar regressões
```

---

# 48. QUANDO NÃO HÁ ESPECIFICAÇÃO SUFICIENTE

Não interromper por dúvidas pequenas.

Quando houver uma decisão que não bloqueia a implementação:

```text
assumir solução simples
↓
documentar quando relevante
↓
continuar
```

Só solicitar esclarecimento quando a ambiguidade realmente impedir uma implementação segura.

---

# 49. AO ENCONTRAR CÓDIGO RUIM

Classificar:

```text
bloqueia o MVP
→ corrigir agora
```

ou:

```text
não bloqueia
→ evitar refatoração ampla
→ registrar para futuro
```

Não transformar cada tarefa em uma grande refatoração.

---

# 50. CRITÉRIO DE PRONTO

Uma funcionalidade só está pronta quando:

```text
implementada
+
integrada ao estado
+
validada
+
visualmente correta
+
testada
```

Verificar:

- navegação;
- console;
- estado;
- dados;
- regras;
- feedback;
- responsividade;
- regressões.

---

# 51. CHECKLIST ANTES DE COMMIT

```text
[ ] Projeto compila
[ ] Não há erro de console conhecido
[ ] Fluxo principal funciona
[ ] Validações funcionam
[ ] Feedback funciona
[ ] Dados permanecem consistentes
[ ] Não quebrou telas existentes
[ ] Regras continuam centralizadas
[ ] Não adicionou dependência desnecessária
[ ] Não deixou debug/logs temporários sem necessidade
```

---

# 52. CHECKLIST ANTES DA DEMONSTRAÇÃO

```text
[ ] Login gestor
[ ] Login UBS
[ ] Dashboard
[ ] Estoque
[ ] Busca
[ ] Filtros
[ ] Lotes
[ ] Entrada
[ ] Saída
[ ] Erro de estoque insuficiente
[ ] Transferência
[ ] Histórico
[ ] Alertas
[ ] Vencimentos
[ ] Redistribuição
[ ] Consumo
[ ] Relatórios
[ ] Permissões
[ ] Logout
[ ] Persistência local
[ ] Responsividade
```

---

# 53. FLUXO DE DEMONSTRAÇÃO IDEAL

A apresentação deve conseguir mostrar:

```text
Login como gestor
    ↓
Dashboard
    ↓
Estoque crítico
    ↓
Alerta
    ↓
Detalhes do medicamento/lote
    ↓
Entrada ou saída
    ↓
Estoque muda
    ↓
Histórico muda
    ↓
Alertas são recalculados
    ↓
Sugestão de redistribuição
    ↓
Transferência
    ↓
Origem diminui
    ↓
Destino aumenta
    ↓
Relatório
```

Esse fluxo é mais importante do que funcionalidades secundárias.

---

# 54. REGRA SOBRE PRAZO

Com prazo aproximado de 15 dias:

```text
MVP completo e consistente
>
quantidade máxima de funcionalidades
```

Se faltar tempo:

```text
polir P0
```

antes de começar novas funcionalidades.

Não comprometer todo o projeto tentando implementar backend agora.

---

# 55. REGRA DE DECISÃO PARA NOVAS FUNCIONALIDADES

Antes de implementar algo novo, verificar:

```text
1. Está nos requisitos?
2. Ajuda a resolver o problema?
3. É necessária para a demonstração?
4. Existe solução mais simples?
5. Pode ser mockada?
6. Pode ficar desacoplada para futuro backend?
```

Se não houver benefício claro, deixar para fase futura.

---

# 56. HANDOFF ENTRE IAS

Quando finalizar uma tarefa importante, deixar o projeto em estado compreensível para outra IA.

Evitar:

- lógica escondida;
- arquivos sem propósito claro;
- código temporário sem comentário;
- mocks espalhados;
- regras duplicadas.

Quando uma decisão estrutural for relevante, documentar em `PROJECT_CONTEXT.md` ou em documentação apropriada.

---

# 57. REGRA FINAL ABSOLUTA

O ConectaSUS deve permanecer:

```text
simples
funcional
bonito
navegável
coerente
mockado de forma inteligente
preparado para evolução
```

Não transformar o MVP em um sistema complexo sem necessidade.

Não sacrificar UX por arquitetura.

Não sacrificar regras de negócio por aparência.

Não permitir que referências externas mudem o domínio do produto.

Não apagar o contexto documental.

Sempre preservar o objetivo do projeto.

---

# 58. RESUMO PARA QUALQUER IA

```text
LEIA PRIMEIRO:
AI_RULES.md
PROJECT_CONTEXT.md
requisitos relevantes
REFERENCE_ANALYSIS.md (se existir)

ENTÃO:
analisar código atual
↓
implementar menor mudança necessária
↓
testar
↓
revisar
↓
preservar contexto
```

## Fonte final de verdade

```text
REQUISITOS → O QUE O PRODUTO FAZ
PROJECT_CONTEXT.md → O QUE É A ARQUITETURA/MVP
AI_RULES.md → COMO A IA DEVE TRABALHAR
REFERENCE_ANALYSIS.md → INSPIRAÇÃO DE UX/UI
CÓDIGO → ESTADO REAL ATUAL
```

**Fim das regras.**
