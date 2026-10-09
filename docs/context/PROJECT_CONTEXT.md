# ConectaSUS — Contexto Completo do Projeto

> **Documento de contexto para IAs de desenvolvimento (Antigravity, Claude, OpenCode e similares).**
>
> Este arquivo deve ser lido antes de criar, alterar, refatorar ou remover qualquer código do projeto.
> O objetivo é manter uma visão única do produto, da arquitetura escolhida, das regras de negócio e da prioridade de implementação.

---

## 1. Visão geral

### Nome do projeto

**ConectaSUS**

### Objetivo

O ConectaSUS será uma plataforma web para gestão integrada dos estoques de medicamentos das unidades de saúde de Lagarto.

O sistema deve permitir que responsáveis pelos estoques registrem e acompanhem:

- entradas;
- saídas;
- transferências;
- quantidades disponíveis;
- lotes;
- datas de validade.

Os gestores devem conseguir acompanhar os estoques de todas as unidades em uma visão centralizada.

O sistema também deve utilizar os dados registrados para gerar:

- alertas;
- relatórios;
- análises de consumo;
- sugestões de redistribuição.

### Problema que o sistema resolve

O problema central do projeto é a dificuldade de obter uma visão centralizada e operacional dos medicamentos disponíveis nas diferentes unidades de saúde.

O ConectaSUS deve transformar os dados de estoque em informação útil para a tomada de decisão, ajudando a:

- identificar estoques baixos ou críticos;
- identificar medicamentos próximos do vencimento;
- acompanhar movimentações;
- acompanhar consumo;
- descobrir possíveis excessos em uma unidade;
- descobrir possíveis necessidades em outra unidade;
- sugerir redistribuições entre unidades.

### Objetivo da primeira versão

A primeira versão é um **protótipo funcional e visual**, desenvolvido em aproximadamente 15 dias.

Nesta fase:

- o foco principal é a interface;
- os dados serão mockados;
- não haverá dependência de banco de dados real;
- as principais operações devem funcionar visualmente;
- as alterações devem refletir na interface;
- o localStorage pode ser usado para persistência local;
- autenticação e permissões serão simuladas;
- a arquitetura deve ficar preparada para futura substituição dos mocks por uma API real.

**Importante:** não transformar a primeira versão em um projeto de backend completo. O objetivo é demonstrar claramente o funcionamento do produto.

---

# 2. Estratégia de desenvolvimento

## 2.1 Princípio principal

Construir primeiro um **MVP visualmente convincente e funcional**.

A aplicação deve permitir uma demonstração completa:

```text
Login
  ↓
Dashboard
  ↓
Visualização do estoque
  ↓
Registrar entrada/saída
  ↓
Estoque é atualizado
  ↓
Histórico é atualizado
  ↓
Alertas são recalculados
  ↓
Sugestões de redistribuição aparecem
  ↓
Gestor pode analisar e tomar decisão
```

## 2.2 O que não fazer nesta primeira fase

Não implementar inicialmente:

- Spring Boot;
- MySQL;
- Flyway;
- JWT real;
- autenticação real;
- infraestrutura cloud;
- CI/CD;
- integrações externas;
- APIs de terceiros;
- arquitetura distribuída;
- mecanismos complexos de previsão.

Esses itens podem fazer parte de uma segunda fase.

## 2.3 O que deve parecer real

Embora os dados sejam simulados, a experiência precisa parecer a de um sistema real.

Exemplo:

```text
Usuário registra entrada de 500 unidades
        ↓
Estoque passa de 200 para 700
        ↓
Histórico registra a entrada
        ↓
Dashboard atualiza os indicadores
        ↓
Alertas podem desaparecer ou surgir
```

O usuário final não deve perceber que a primeira versão utiliza mocks.

---

# 3. Stack tecnológica definida

## Frontend

- React
- TypeScript
- Vite

## Interface e estilos

- Tailwind CSS
- shadcn/ui
- Lucide React

## Navegação

- React Router

## Estado global

- Zustand

## Formulários e validação

- React Hook Form
- Zod

## Gráficos

- Recharts

## Datas

- date-fns

## Persistência local

- localStorage

## Dados

- mocks em TypeScript
- objetos/arrays tipados

## Backend

**Não será implementado na primeira versão.**

---

# 4. Arquitetura da aplicação

Arquitetura inicial:

```text
                    CONECTASUS
                         │
                         ▼
                 React + TypeScript
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
      React Router                  Zustand
            │                         │
            └────────────┬────────────┘
                         ▼
                    Mock Service
                         │
                  ┌──────┴──────┐
                  │             │
                  ▼             ▼
              Mock Data    localStorage
                  │
       ┌──────────┼───────────┐
       │          │           │
       ▼          ▼           ▼
    Estoque     Alertas     Histórico
       │
   ┌───┼─────────────┐
   │   │             │
   ▼   ▼             ▼
Entrada Saída   Transferência
                       │
                       ▼
             Redistribuição sugerida
```

## Regra arquitetural importante

As páginas e componentes **não devem manipular os mocks diretamente**.

Evitar:

```tsx
const estoque = [...];
setEstoque(...);
```

espalhado por várias páginas.

Preferir:

```text
Página
  ↓
Store
  ↓
Mock Service
  ↓
Dados
```

Isso facilita a futura troca:

```text
Mock Service
      ↓
REST API / Spring Boot
```

sem precisar reescrever a interface.

---

# 5. Estrutura de pastas

Estrutura recomendada:

```text
src/
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── estoque/
│   ├── medicamentos/
│   ├── lotes/
│   ├── movimentacoes/
│   ├── transferencias/
│   ├── alertas/
│   ├── relatorios/
│   ├── unidades/
│   └── usuarios/
│
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Estoque.tsx
│   ├── Medicamentos.tsx
│   ├── Lotes.tsx
│   ├── Movimentacoes.tsx
│   ├── Transferencias.tsx
│   ├── Alertas.tsx
│   ├── Relatorios.tsx
│   ├── Unidades.tsx
│   └── Usuarios.tsx
│
├── layouts/
│   └── DashboardLayout.tsx
│
├── routes/
│   └── AppRoutes.tsx
│
├── stores/
│   ├── authStore.ts
│   └── appStore.ts
│
├── services/
│   └── mockApi.ts
│
├── data/
│   ├── users.ts
│   ├── unidades.ts
│   ├── medicamentos.ts
│   ├── lotes.ts
│   ├── estoque.ts
│   ├── movimentacoes.ts
│   └── alertas.ts
│
├── types/
│   └── index.ts
│
├── utils/
│   ├── estoque.ts
│   ├── alertas.ts
│   ├── redistribuicao.ts
│   ├── consumo.ts
│   └── formatters.ts
│
├── hooks/
│   └── ...
│
├── lib/
│   └── utils.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

A estrutura pode ser ajustada durante o desenvolvimento, mas não deve ser desnecessariamente complexificada.

---

# 6. Entidades do domínio

Mesmo sem banco, o frontend deve modelar as entidades corretamente.

## 6.1 Usuário

```ts
interface Usuario {
  id: number
  nome: string
  email: string
  role: "ADMIN" | "GESTOR" | "UBS"
  unidadeId?: number
  ativo: boolean
}
```

Campos conceituais:

- nome;
- e-mail;
- senha/autenticação simulada;
- tipo de usuário;
- unidade vinculada;
- status.

## 6.2 Unidade

```ts
interface Unidade {
  id: number
  nome: string
  codigo: string
  endereco: string
  telefone?: string
  responsavel?: string
  status: "ATIVA" | "INATIVA"
}
```

## 6.3 Medicamento

```ts
interface Medicamento {
  id: number
  nome: string
  principioAtivo: string
  concentracao: string
  formaFarmaceutica: string
  unidadeMedida: string
  codigo: string
  estoqueMinimo: number
  estoqueMaximo?: number
  ativo: boolean
}
```

## 6.4 Lote

```ts
interface Lote {
  id: number
  medicamentoId: number
  numero: string
  quantidade: number
  dataEntrada: string
  dataValidade: string
  unidadeId: number
}
```

## 6.5 Movimentação

```ts
interface Movimentacao {
  id: number
  tipo: "ENTRADA" | "SAIDA" | "TRANSFERENCIA"
  medicamentoId: number
  loteId?: number
  quantidade: number
  origemId?: number
  destinoId?: number
  usuarioId: number
  dataHora: string
  motivo?: string
  observacao?: string
}
```

## 6.6 Alerta

```ts
interface Alerta {
  id: number
  tipo: "ESTOQUE_BAIXO" | "ESTOQUE_CRITICO" | "VENCIMENTO"
  medicamentoId: number
  unidadeId: number
  data: string
  status: "ATIVO" | "RESOLVIDO"
  mensagem: string
}
```

## 6.7 Sugestão de redistribuição

Essa estrutura é uma decisão de implementação da primeira versão:

```ts
interface SugestaoRedistribuicao {
  id: number
  medicamentoId: number
  origemId: number
  destinoId: number
  quantidadeSugerida: number
  motivo: string
  status: "PENDENTE" | "ACEITA" | "IGNORADA"
}
```

---

# 7. Perfis de usuário

Existem três perfis principais.

## 7.1 Administrador

Possui acesso completo.

Pode:

- cadastrar usuários;
- editar usuários;
- desativar usuários;
- cadastrar unidades;
- cadastrar medicamentos;
- definir permissões;
- visualizar todas as informações;
- acessar o histórico de ações.

## 7.2 Gestor da Assistência Farmacêutica

Possui visão centralizada do município.

Pode:

- visualizar todas as unidades;
- consultar medicamentos;
- acompanhar quantidades;
- visualizar estoques críticos;
- acompanhar medicamentos próximos do vencimento;
- visualizar movimentações;
- acompanhar consumo;
- receber alertas;
- consultar possibilidades de redistribuição;
- gerar relatórios.

## 7.3 Responsável pelo estoque da UBS

Possui acesso principalmente à própria unidade.

Pode:

- consultar estoque;
- registrar entrada;
- registrar saída;
- registrar transferência;
- consultar lotes;
- acompanhar validade;
- visualizar alertas;
- consultar histórico da unidade.

---

# 8. Login

A autenticação será simulada.

Usuários mockados, por exemplo:

```text
admin@conectasus.com / 123456
gestor@conectasus.com / 123456
ubs01@conectasus.com / 123456
```

O sistema deve identificar o perfil e direcionar o usuário ao ambiente correspondente.

## Comportamento

```text
Login válido
    ↓
Salvar usuário no authStore
    ↓
Salvar sessão no localStorage
    ↓
Redirecionar para Dashboard
```

Login inválido deve mostrar erro amigável.

Exemplo:

```text
E-mail ou senha inválidos.
```

---

# 9. Dashboard

O dashboard é a principal vitrine do projeto.

## 9.1 Dashboard do gestor

Deve mostrar:

- unidades cadastradas;
- medicamentos cadastrados;
- estoque crítico;
- estoque baixo;
- próximos do vencimento;
- possíveis redistribuições.

Exemplo:

```text
12
Unidades cadastradas

350
Medicamentos

8
Estoque crítico

21
Estoque baixo

17
Próximos do vencimento

5
Possíveis redistribuições
```

## 9.2 Elementos visuais

Recomendados:

- cards de indicadores;
- gráfico de situação de estoque;
- gráfico de consumo;
- tabela de unidades;
- lista de alertas recentes;
- sugestões de redistribuição;
- movimentações recentes.

## 9.3 Dashboard da UBS

Deve exibir apenas os dados da unidade vinculada ao usuário.

---

# 10. Estoque

A tela deve ser uma das principais do sistema.

Tabela:

```text
Medicamento | Quantidade | Mínimo | Validade | Situação
```

Exemplo:

```text
Paracetamol   | 500 | 100 | 08/2027 | Normal
Dipirona      | 80  | 100 | 04/2027 | Baixo
Amoxicilina   | 20  | 100 | 12/2026 | Crítico
```

## Filtros

Permitir:

- pesquisa por nome;
- princípio ativo;
- código;
- lote;
- unidade;
- situação;
- validade.

## Status

No mínimo:

```text
NORMAL
BAIXO
CRITICO
```

Opcionalmente:

```text
VENCIMENTO_PROXIMO
```

---

# 11. Controle de lotes

Um medicamento pode possuir vários lotes.

Cada lote deve possuir:

- medicamento;
- número do lote;
- quantidade;
- data de entrada;
- validade;
- unidade.

A tela deve permitir abrir os lotes de um medicamento e visualizar suas informações.

## Regra

A quantidade de um medicamento não deve ser tratada como se existisse apenas um lote.

Exemplo:

```text
Paracetamol 500 mg

Lote 45821 → 300 unidades → validade 08/2027
Lote 73102 → 200 unidades → validade 11/2026
```

Isso permite demonstrar controle de validade por lote.

---

# 12. Registro de entrada

Formulário:

- medicamento;
- lote;
- quantidade;
- validade;
- origem;
- data;
- observação.

## Regra de negócio

```text
novoEstoque = estoqueAtual + quantidadeRecebida
```

Após confirmar:

1. atualizar estoque;
2. atualizar lote;
3. registrar movimentação;
4. recalcular alertas;
5. atualizar dashboard;
6. mostrar confirmação.

Mensagem:

```text
Entrada registrada com sucesso.
```

---

# 13. Registro de saída

Formulário:

- medicamento;
- lote;
- quantidade;
- motivo/destino;
- data;
- observação.

## Regra obrigatória

Nunca permitir:

```text
quantidadeSaida > quantidadeDisponivel
```

Quando isso ocorrer:

```text
Estoque insuficiente.

Estoque disponível: 50
Quantidade solicitada: 80
```

Quando for válido:

```text
novoEstoque = estoqueAtual - quantidadeSaida
```

Depois:

1. atualizar estoque;
2. atualizar lote;
3. registrar movimentação;
4. recalcular alertas;
5. atualizar dashboard.

---

# 14. Transferência entre unidades

Uma das principais funcionalidades do sistema.

Formulário:

- unidade de origem;
- unidade de destino;
- medicamento;
- lote;
- quantidade.

## Regra

Uma transferência de 200 unidades deve:

```text
1. retirar 200 da origem
2. registrar saída na origem
3. adicionar 200 no destino
4. registrar entrada no destino
5. manter histórico da transferência
```

Exemplo:

```text
UBS 01
Paracetamol: 1000 → 800

        200 unidades
             ↓

UBS 05
Paracetamol: 30 → 230
```

## Validações

Não permitir:

- origem igual ao destino;
- quantidade menor/igual a zero;
- quantidade maior que estoque disponível;
- medicamento inexistente;
- lote incompatível com a unidade.

---

# 15. Alertas automáticos

Os alertas serão calculados no frontend.

## 15.1 Estoque baixo

Regra:

```text
estoqueAtual <= estoqueMinimo
```

Exemplo:

```text
🟡 Estoque baixo

Paracetamol — UBS 02
Estoque atual: 95
Estoque mínimo: 100
```

## 15.2 Estoque crítico

Na primeira versão, utilizar uma regra simples e explícita, por exemplo:

```text
estoqueAtual <= estoqueMinimo * 0.30
```

Essa regra é uma decisão de implementação para o protótipo e deve ser fácil de alterar posteriormente.

## 15.3 Próximo do vencimento

Na primeira versão, usar uma janela configurável em código ou constante, por exemplo:

```ts
const DIAS_ALERTA_VENCIMENTO = 90
```

Regra:

```text
diasParaVencer <= 90
```

---

# 16. Sugestão de redistribuição

Esta é uma das funcionalidades de maior valor demonstrativo.

O sistema deve comparar estoques entre unidades e encontrar combinações como:

```text
Unidade de origem:
estoque alto

Unidade de destino:
estoque baixo/crítico
```

## Regra inicial simples

Exemplo:

```text
estoqueOrigem > estoqueMinimo * 2
E
estoqueDestino < estoqueMinimo
```

Quando a condição for verdadeira, gerar uma sugestão.

Exemplo:

```text
🔄 Possível redistribuição

Paracetamol 500 mg

UBS 01
Estoque: 1000

UBS 05
Estoque: 30

Consumo médio:
150 unidades/mês

Sugestão:
Transferir até 200 unidades.
```

## Importante

A sugestão **não executa a transferência automaticamente**.

O gestor deve decidir.

Fluxo:

```text
Sistema analisa
     ↓
Sugestão aparece
     ↓
Gestor visualiza
     ↓
Gestor decide
     ↓
Se desejar, realiza transferência
```

---

# 17. Análise de consumo

O sistema deve utilizar as movimentações de saída para gerar uma visão de consumo.

## Indicador

```text
Consumo médio mensal
```

Exemplo:

```text
Últimos 3 meses:

120 unidades/mês
```

## Estimativa de duração do estoque

Fórmula:

```text
mesesDeEstoque = estoqueAtual / consumoMedioMensal
```

Exemplo:

```text
Estoque atual: 360
Consumo médio: 120/mês

Estimativa:
3 meses de estoque
```

## Cuidados

Se o consumo médio for zero:

```text
Não calcular divisão por zero.
```

Exibir:

```text
Sem histórico de consumo suficiente.
```

---

# 18. Histórico

Toda movimentação deve ser registrada.

Tabela:

```text
Data | Operação | Medicamento | Quantidade | Unidade | Usuário
```

Exemplo:

```text
05/10 | Entrada       | Paracetamol | +500 | UBS 01 | João
06/10 | Saída         | Paracetamol | -100 | UBS 01 | Maria
07/10 | Transferência | Paracetamol | -200 | UBS 01 | João
```

Na primeira versão, o histórico não deve permitir exclusão pela interface comum.

---

# 19. Notificações

Criar área de notificações no header.

Exemplo:

```text
🔔

3 medicamentos em estoque crítico
7 medicamentos com estoque baixo
12 medicamentos próximos do vencimento
4 possibilidades de redistribuição
```

Ao clicar, navegar para a área correspondente.

---

# 20. Relatórios

Não é necessário criar um mecanismo complexo de geração no primeiro MVP.

O essencial é oferecer páginas visuais filtráveis.

## Relatório de estoque

Campos:

- medicamento;
- quantidade;
- unidade;
- estoque mínimo;
- situação.

## Relatório de validade

Campos:

- medicamento;
- lote;
- quantidade;
- unidade;
- validade.

## Relatório de movimentação

Campos:

- entradas;
- saídas;
- transferências;
- período;
- unidade.

## Relatório de consumo

Filtros:

- medicamento;
- unidade;
- período.

Mostrar:

- consumo;
- média;
- gráfico.

---

# 21. Busca e filtros

Pesquisar por:

- nome do medicamento;
- princípio ativo;
- código;
- lote.

Filtrar por:

- unidade;
- situação do estoque;
- validade;
- período;
- movimentação.

## UX

Filtros devem ser fáceis de limpar.

Exemplo:

```text
[ Pesquisar medicamento... ]

Unidade       [ Todas ]
Situação      [ Todas ]
Validade      [ Todas ]

[ Limpar filtros ]
```

---

# 22. Permissões no frontend

Mesmo sendo mockado, o sistema deve demonstrar permissões visualmente.

## ADMIN

Pode visualizar:

```text
Dashboard
Estoque
Medicamentos
Lotes
Movimentações
Transferências
Alertas
Relatórios
Unidades
Usuários
Histórico
```

## GESTOR

Pode visualizar:

```text
Dashboard
Estoque
Medicamentos
Lotes
Movimentações
Transferências
Alertas
Relatórios
```

Não precisa acessar administração.

## UBS

Pode visualizar:

```text
Dashboard
Estoque
Lotes
Movimentações
Transferências
Alertas
Histórico
```

A filtragem deve considerar a `unidadeId` do usuário.

---

# 23. Regras de validação

Impedir:

- saída maior que estoque disponível;
- quantidade negativa;
- quantidade zero em operações;
- cadastro sem campos obrigatórios;
- transferência para a mesma unidade;
- uso de lote inexistente;
- uso de lote que não pertence à unidade;
- acesso a unidade fora da permissão do usuário;
- exclusão de movimentação já realizada.

Erros devem ser explicativos.

Exemplo:

```text
Não foi possível registrar a saída.
A quantidade solicitada é maior que o estoque disponível.
```

---

# 24. Estado global

Usar Zustand.

O estado pode concentrar:

```text
usuário logado
medicamentos
unidades
lotes
estoques
movimentações
alertas
sugestões
```

Mas evitar transformar tudo em um store gigantesco.

Separar responsabilidades quando começar a ficar difícil de manter.

---

# 25. Mock API

Criar uma camada chamada:

```text
services/mockApi.ts
```

Exemplo conceitual:

```ts
getUsuarios()
getUnidades()
getMedicamentos()
getLotes()
getEstoque()
getMovimentacoes()
getAlertas()
getSugestoesRedistribuicao()

registrarEntrada(data)
registrarSaida(data)
registrarTransferencia(data)

criarMedicamento(data)
atualizarMedicamento(data)

criarUnidade(data)
atualizarUnidade(data)
```

As páginas não devem conhecer como os dados são armazenados.

---

# 26. Persistência com localStorage

A primeira execução carrega os dados mockados.

Depois disso, os dados podem ser persistidos em localStorage.

Estratégia:

```text
Primeira execução
    ↓
Carregar mocks
    ↓
Salvar no localStorage

Próximas execuções
    ↓
Ler localStorage
```

Exemplo de chaves:

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

Não utilizar localStorage como se fosse banco relacional. Ele é somente uma solução de persistência local para o protótipo.

---

# 27. Dados mockados

Os mocks precisam parecer dados reais de demonstração.

Evitar:

```text
Medicamento A
Medicamento B
Unidade X
Unidade Y
```

Usar exemplos como:

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

Criar dados distribuídos em situações diferentes:

```text
Normal
Baixo
Crítico
Próximo do vencimento
Estoque elevado
Sem histórico suficiente
```

## Objetivo

Os dados mockados devem alimentar:

- cards;
- gráficos;
- tabelas;
- alertas;
- transferências;
- sugestões;
- histórico;
- relatórios.

---

# 28. Diretriz visual

O ConectaSUS é um sistema institucional de saúde.

A interface deve transmitir:

- confiança;
- organização;
- clareza;
- modernidade;
- facilidade de uso.

## Identidade visual sugerida

Base:

```text
Azul institucional
Branco
Cinza claro
```

Estados:

```text
Verde  → Normal
Amarelo → Atenção/Baixo
Vermelho → Crítico
```

## Diretrizes de UI

Utilizar:

- sidebar;
- header;
- cards;
- tabelas;
- badges;
- modais;
- dropdowns;
- tooltips quando realmente necessários;
- toast de confirmação;
- estados vazios;
- loading;
- feedback de erro;
- boa hierarquia visual.

Evitar:

- excesso de gradientes;
- excesso de sombras;
- telas visualmente carregadas;
- animações desnecessárias;
- aparência de dashboard genérico de startup;
- textos excessivamente técnicos.

A prioridade é uma interface institucional moderna.

---

# 29. Componentes reutilizáveis

Criar componentes reutilizáveis, principalmente:

```text
PageHeader
StatCard
DataTable
StatusBadge
EmptyState
LoadingState
ConfirmDialog
FormModal
SearchInput
FilterSelect
NotificationPanel
StockStatusBadge
MedicationCard
AlertCard
TransferDialog
```

Não duplicar a mesma estrutura em várias páginas sem necessidade.

---

# 30. Responsividade

A aplicação deve funcionar em:

- desktop;
- notebook;
- tablet.

O desktop é a prioridade para a demonstração, mas a interface não deve quebrar em telas menores.

---

# 31. Rotas sugeridas

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

Rotas administrativas devem ser protegidas por role.

---

# 32. Fluxos principais que precisam funcionar

## Fluxo 1 — Login

```text
Abrir sistema
  ↓
Login
  ↓
Validar mock
  ↓
Salvar sessão
  ↓
Dashboard
```

## Fluxo 2 — Entrada

```text
Estoque
  ↓
Registrar entrada
  ↓
Preencher formulário
  ↓
Confirmar
  ↓
Atualizar estoque
  ↓
Atualizar histórico
  ↓
Atualizar alertas
```

## Fluxo 3 — Saída

```text
Estoque
  ↓
Registrar saída
  ↓
Validar disponibilidade
  ↓
Atualizar estoque
  ↓
Histórico
  ↓
Alertas
```

## Fluxo 4 — Transferência

```text
Transferências
  ↓
Selecionar origem
  ↓
Selecionar destino
  ↓
Selecionar medicamento/lote
  ↓
Informar quantidade
  ↓
Validar
  ↓
Atualizar origem
  ↓
Atualizar destino
  ↓
Registrar histórico
```

## Fluxo 5 — Redistribuição

```text
Dados do estoque
  ↓
Motor de regras
  ↓
Encontrar excesso + necessidade
  ↓
Gerar sugestão
  ↓
Gestor analisa
  ↓
Decisão manual
```

---

# 33. Ordem de implementação para 15 dias

## Dia 1

- criar projeto;
- instalar dependências;
- configurar Tailwind;
- configurar shadcn/ui;
- configurar estrutura de pastas.

## Dia 2

- layout;
- sidebar;
- header;
- login;
- roteamento;
- autenticação mockada.

## Dias 3–4

- dashboard;
- cards;
- gráficos;
- alertas;
- tabela de unidades;
- movimentações recentes.

## Dias 5–6

- medicamentos;
- CRUD mockado;
- pesquisa;
- filtros.

## Dias 7–8

- estoque;
- lotes;
- validade;
- status automático.

## Dias 9–10

- entrada;
- saída;
- validações;
- histórico.

## Dias 11–12

- transferência;
- redistribuição;
- alertas automáticos;
- consumo.

## Dia 13

- usuários;
- unidades;
- permissões;
- histórico administrativo.

## Dia 14

- relatórios;
- melhorias de filtros;
- revisão dos fluxos.

## Dia 15

Somente:

- correção de bugs;
- melhoria visual;
- responsividade;
- testes manuais;
- revisão;
- preparação da demonstração.

Não iniciar novas funcionalidades no último dia sem necessidade.

---

# 34. Prioridade do MVP

Se faltar tempo, implementar nesta ordem:

```text
P0 — Obrigatório

1. Login
2. Dashboard
3. Estoque
4. Entrada
5. Saída
6. Transferência
7. Alertas
8. Redistribuição
9. Histórico
10. Relatórios
```

```text
P1 — Importante

11. Medicamentos
12. Lotes
13. Unidades
14. Usuários
15. Permissões detalhadas
```

```text
P2 — Futuro

16. Backend
17. Banco
18. Autenticação real
19. Cloud
20. Backup
21. Auditoria real
22. Multiusuário real
```

---

# 35. Estratégia de uso das IAs

## Antigravity

Usar como principal agente de implementação.

Responsabilidades:

- criação de arquivos;
- implementação das páginas;
- componentes;
- integração com Zustand;
- integração com mock service;
- estilos;
- correções simples.

## Claude

Usar principalmente como:

- revisor;
- arquiteto;
- avaliador de UX;
- identificador de bugs;
- revisor de regras de negócio;
- revisor de organização do código.

## OpenCode

Usar principalmente para:

- debugging;
- alterações pontuais;
- refatorações pequenas;
- correções de arquivos;
- implementação localizada.

## Regra importante

Não deixar múltiplas IAs realizarem alterações estruturais simultaneamente.

Primeiro uma IA altera.

Depois outra IA revisa.

---

# 36. Instruções permanentes para a IA da IDE

A IA que trabalhar no projeto deve seguir estas regras:

### Regra 1

Antes de modificar código, ler este documento.

### Regra 2

Não implementar backend nesta primeira fase.

### Regra 3

Não criar dependências desnecessárias.

### Regra 4

Priorizar funcionalidades demonstráveis.

### Regra 5

Manter os dados desacoplados da UI.

### Regra 6

Usar TypeScript tipado.

### Regra 7

Criar componentes reutilizáveis.

### Regra 8

Não duplicar regras de negócio em diferentes páginas.

### Regra 9

Toda movimentação deve atualizar o estado relacionado.

### Regra 10

Toda operação deve possuir validação e feedback visual.

### Regra 11

Não destruir funcionalidades que já estão funcionando ao implementar uma nova.

### Regra 12

Antes de terminar uma tarefa, verificar se não houve regressão.

### Regra 13

Não adicionar funcionalidades fora do escopo sem necessidade.

### Regra 14

Quando existir uma decisão de arquitetura, preferir a solução simples.

### Regra 15

O sistema deve ficar preparado para futuramente consumir uma API sem obrigar a reescrever a camada visual.

---

# 37. Como a IA deve receber tarefas

Dar tarefas pequenas e verificáveis.

Bom:

```text
Implemente a tela de estoque.

Requisitos:
- tabela;
- busca por medicamento;
- filtro por situação;
- filtro por unidade;
- badge de status;
- botão de registrar entrada;
- botão de registrar saída;
- dados vindos do store/mock service;
- nenhuma chamada HTTP real.

Não altere outras telas além do necessário.
```

Evitar pedidos genéricos como:

```text
Faça o sistema inteiro.
```

---

# 38. Critérios de qualidade

Uma funcionalidade só deve ser considerada concluída quando:

- funciona sem erro;
- está integrada ao estado;
- possui feedback visual;
- possui validação;
- não quebra outras páginas;
- funciona com os dados mockados;
- possui aparência consistente;
- funciona após recarregar a página quando a persistência local for aplicável.

---

# 39. Critérios de conclusão do MVP

O MVP estará pronto quando for possível realizar esta demonstração:

```text
1. Fazer login como gestor
2. Abrir dashboard
3. Ver indicadores
4. Ver unidades
5. Abrir estoque
6. Pesquisar medicamento
7. Abrir lote
8. Registrar entrada
9. Ver estoque aumentar
10. Registrar saída
11. Ver estoque diminuir
12. Tentar saída acima do estoque e receber erro
13. Abrir transferências
14. Transferir medicamento de uma UBS para outra
15. Ver os dois estoques mudarem
16. Ver histórico
17. Ver alertas
18. Ver sugestão de redistribuição
19. Abrir relatório
20. Fazer logout
21. Entrar como usuário de uma UBS
22. Ver somente os dados permitidos
```

Esse fluxo deve funcionar de ponta a ponta com dados mockados.

---

# 40. Futuro backend

Somente após o MVP visual estar estável.

Arquitetura futura:

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

Possíveis futuras entidades:

```text
USUARIOS
UNIDADES
MEDICAMENTOS
LOTES
MOVIMENTACOES
ALERTAS
HISTORICO
```

Futuras funcionalidades de infraestrutura:

- autenticação real;
- autorização;
- banco centralizado;
- armazenamento em nuvem;
- acesso simultâneo;
- backup;
- auditoria;
- segurança;
- logs;
- API.

A estrutura atual deve facilitar essa evolução, mas isso **não é requisito para o MVP de 15 dias**.

---

# 41. Regra final de escopo

Sempre lembrar:

> **O ConectaSUS neste primeiro ciclo não precisa ser um sistema de produção.**
>
> Ele precisa ser um **protótipo funcional, bonito, navegável e convincente**, capaz de demonstrar que as principais dores de gestão de estoque de medicamentos podem ser resolvidas pela plataforma.

A prioridade é:

```text
FUNCIONAMENTO
    ↓
EXPERIÊNCIA DO USUÁRIO
    ↓
VISUAL
    ↓
REGRAS DE NEGÓCIO
    ↓
ARQUITETURA PREPARADA PARA EVOLUÇÃO
    ↓
BACKEND REAL (FASE FUTURA)
```

---

# 42. Estado desejado ao final dos 15 dias

```text
✅ Projeto React + TypeScript
✅ Interface moderna
✅ Login mockado
✅ Perfis de acesso simulados
✅ Dashboard
✅ Estoque
✅ Medicamentos
✅ Lotes
✅ Entradas
✅ Saídas
✅ Transferências
✅ Alertas
✅ Redistribuição
✅ Consumo
✅ Histórico
✅ Relatórios
✅ Busca e filtros
✅ localStorage
✅ Dados mockados
✅ Responsividade
✅ Componentes reutilizáveis
✅ Arquitetura preparada para futuro backend
```

---

# 43. Regra para qualquer nova implementação

Antes de adicionar uma funcionalidade, responder mentalmente:

```text
1. Ela está nos requisitos?
2. Ela ajuda a demonstrar o problema resolvido?
3. Ela é necessária para o MVP?
4. Existe uma solução mais simples?
5. Ela pode ser mockada?
6. Ela pode ser isolada para futura troca por API?
```

Se uma funcionalidade aumentar muito a complexidade sem melhorar a demonstração, ela deve ser deixada para uma fase futura.

---

# 44. Resumo executivo para a IA

```text
PROJETO:
ConectaSUS

TIPO:
Plataforma web para gestão de estoques de medicamentos de unidades de saúde.

FASE ATUAL:
MVP/protótipo funcional de 15 dias.

STACK:
React + TypeScript + Vite
Tailwind CSS + shadcn/ui
Lucide React
React Router
Zustand
React Hook Form + Zod
Recharts
date-fns
localStorage

BACKEND:
Não implementar agora.

DADOS:
Mockados em TypeScript e persistidos localmente quando necessário.

FOCO:
UI bonita + funcionalidades demonstráveis + regras de negócio básicas.

FUNCIONALIDADES PRINCIPAIS:
Login
Dashboard
Estoque
Medicamentos
Lotes
Entrada
Saída
Transferência
Alertas
Redistribuição
Consumo
Histórico
Relatórios
Busca/filtros
Usuários
Unidades
Permissões

PERFIS:
Administrador
Gestor
Responsável pela UBS

REGRA PRINCIPAL:
Simular o comportamento de um sistema real sem construir o backend real.

PRIORIDADE:
Não complicar.
Não criar infraestrutura desnecessária.
Não remover funcionalidades já funcionando.
Manter arquitetura organizada.
Preparar o código para futura integração com API.
```

---

## Fim do documento

Este arquivo é a fonte principal de contexto para desenvolvimento do MVP do ConectaSUS.
