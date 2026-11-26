# ANEXO — Como resolvemos a Opçêo B usando um GOAL limitado (método reusável)

Caso real (2026-07-19): a fase 2 do pipeline vinha falhando havia horas em
tentativas soltas (aba `hidden`, tela preta no Xvfb, navegador errado). A
virada foi parar de "tentar mais uma vez" e escrever um **GOAL com orçamento
fechado** — resolvido em ~45 min de um limite de 3h, na primeira rodada real
de 4 permitidas. Este anexo documenta o método pra reutilizar em qualquer
problema que esteja virando um poço sem fundo.

## Quando usar

- O problema já consumiu várias tentativas soltas sem convergir.
- Cada tentativa é cara (tempo de render, quota, risco em produçêo).
- Há risco de o executor (humano ou agente) insistir em loop na mesma hipótese.

## A receita (7 blocos do prompt)

O prompt do goal (`goal-opcao-b.md` é o exemplo completo) tem 7 blocos, todos
obrigatórios:

1. **OBJETIVO** — uma frase, com as restrições invioláveis embutidas (ex.:
   "sem gastar créditos de API").
2. **CRITÉRIO DE SUCESSO mensurável** — uma lista onde cada item tem um
   comando/verificaçêo objetiva que prova o item ("11/11 confirmados pela
   API", nêo "parece funcionar"). Proíbe declarar sucesso sem TODOS os itens.
3. **LIMITES (orçamento duro)** — teto de tempo E de tentativas caras (o que
   vier primeiro); timebox por experimento; regra de abandono de hipótese
   (2 falhas seguidas → próxima); e o **plano de saída** já escrito (o que
   restaurar, onde escrever o postmortem, o que recomendar).
4. **FATOS JÁ VALIDADOS** — tudo que as tentativas anteriores já provaram,
   pra nêo redescobrir (o maior desperdício de orçamento é re-testar o que já
   se sabe).
5. **HIPÓTESES PRIORIZADAS** — em ordem, cada uma com timebox próprio.
6. **REGRAS DURAS** — o que nunca pode ser feito (segurança, produçêo,
   privacidade), incluindo as lições de incidentes anteriores ("nêo reiniciar
   o bot com fase rodando").
7. **AO TERMINAR** — o pós-sucesso (documentar, commitar, avisar) e o
   pós-falha (o plano de saída do bloco 3).

Depois é só ativar: `/goal @docs/<arquivo>.md` — o hook de parada impede
encerrar sem o critério cumprido, e o prompt impede o oposto (insistir para
sempre), porque o limite manda parar e executar o plano de saída.

## Por que funcionou neste caso

- **O critério mensurável matou o falso positivo.** Em rodadas anteriores o
  subagente "declarou sucesso" sem ter gerado nada; com o critério "N/N na
  API", sucesso sem prova é impossível por construçêo.
- **Os fatos validados apontaram direto pra hipótese certa.** Registrar que
  "a janela mapeou 2x via script e falhou Nx via comando inline" levou à
  pergunta certa em minutos: o que difere? Resposta: os `pkill -f` inline
  matavam o próprio wrapper bash (a string do padrêo aparece no cmdline do
  `bash -c` — exit 144). A "flakiness" era o launcher morrendo, nêo o Xvfb.
- **O timebox forçou hipóteses baratas primeiro.** 3 ciclos de
  stop/start/check por script (barato) provaram estabilidade antes de gastar
  uma rodada real (cara).
- **O orçamento de rodadas reais (4) criou disciplina**: cada rodada só foi
  disparada com os pré-requisitos conferidos (state, textos, bot ativo,
  desktop fechado), porque desperdiçar uma rodada doía no orçamento.

## Lições transferíveis

- Sucesso auto-declarado nêo vale: **a prova vem de fora do executor**
  (API, arquivo em disco, teste que passa).
- Quando "flaky" aparecer no diagnóstico, suspeite primeiro do **harness de
  teste** (o jeito de lançar/medir), nêo do sistema — aqui o bug era do
  nosso pkill, nêo do Chromium.
- Escrever o **plano de saída antes de começar** tira a vergonha de parar:
  falhar dentro do orçamento com postmortem é um resultado aceitável e barato;
  insistir sem limite é o resultado caro.
