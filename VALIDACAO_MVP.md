# Validação da Etapa 16

Revisão em 07/10/2026, no ambiente local `http://127.0.0.1:5174`, preservando os dados da origem habitual.

## Verificações no navegador

- Login GESTOR, navegação dashboard/estoque/movimentações/transferências/histórico/alertas/redistribuição/relatórios e logout.
- Dipirona UBS 02: entrada de 50 alterou saldo 80 → 130; saída de 20 alterou 130 → 110. Saldos mantidos após recarregar.
- Saída de 9.999 bloqueada com saldo disponível e quantidade solicitada na mensagem; sem movimentação inválida.
- Transferência de 25 de Paracetamol UBS 01 → UBS 05: origem 990 → 965, destino 20 → 45, persistidos após recarregar. A base já continha outra transferência de 10 para UBS 03.
- Histórico preservou as operações e consolidou cada transferência em uma linha. GESTOR passou a ter acesso ao histórico.
- Alertas passaram a mostrar UBS 05 como baixo; Dipirona deixou o alerta de baixo. Redistribuição sugeriu 55 para UBS 05, sem executar operação.
- Relatório filtrado por Dipirona conciliou saldo 110, média mensal 15 e cobertura 7,3 meses.
- Filtro de período do histórico, combinado com Dipirona, retornou apenas a saída de setembro. Conferido com edição nativa por teclado; o preenchimento automatizado isolado de datas não disparou a atualização React no navegador de teste.
- Login UBS 01: dashboard com uma unidade, estoque com quatro medicamentos somente da UBS 01; persistência da sessão e saldo 965 após recarregar. Acesso direto a usuários bloqueado.
- Responsividade em 390 × 844: dashboard em coluna, menu móvel funcional e tabela com rolagem; largura do documento não excedeu a viewport. Viewport restaurada.
- Modal de medicamento com foco inicial visível, labels, fechamento e mensagens de obrigatoriedade; pesquisa inexistente exibiu estado vazio e limpeza de filtros.
- Carregamento das rotas observado. Console sem erros ou warnings nas páginas percorridas. Não é uma auditoria completa de acessibilidade.

## Revisão técnica

- Removido o placeholder de módulos, pois todas as rotas previstas possuem página implementada.
- TypeScript strict/noUnusedLocals/noUnusedParameters e ESLint verificam imports e símbolos não utilizados.
- Busca sem TODO/FIXME ou console temporário; páginas/componentes sem acesso direto a localStorage ou mocks.
- Testes cobrem saldo não negativo, rejeição de saída excedente, consistência de transferências, rollback em falha, persistência, permissões, isolamento UBS, filtros e recálculo de indicadores/alertas/sugestões.
- README atualizado com instalação, usuários, funcionalidades, arquitetura, roteiro e limitações.

## Limitações mantidas

Backend e autenticação simulados; armazenamento por navegador, sem coordenação multiaba. Consumo usa três meses completos. Relatórios em tela, sem PDF complexo. Não houve instalação de dependências nem alteração de arquitetura.

## Resultado final dos comandos

- npm run lint: aprovado, zero warnings do ESLint.
- npm run build (inclui npm run typecheck): aprovado; dist gerado em 12,64 s. Aviso PLUGIN_TIMINGS apenas sobre tempo do processamento CSS, sem erro ou alerta de tamanho de bundle.
- npm test: 51 testes aprovados, zero falhas.
- Build e testes precisaram executar fora do sandbox após spawn EPERM; nenhuma dependência foi alterada para contornar essa restrição.
