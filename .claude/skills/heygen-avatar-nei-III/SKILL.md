---
name: heygen-avatar-nei-III
description: Fase 2 do pipeline ARCKHÉclubpromover — pega os textos gerados pela fase 1 (ARCKHÉclub-textos, textos/<assunto>/<publico>.md), extrai a seçêo FALA e gera o vídeo do avatar do Nei no HeyGen (engine avatar_iii), com o LOOK personalizado por PÚBLICO. Use quando o usuário disser "fase 2", "gera os avatares", "manda pro heygen", "/heygen-avatar-nei-III", ou passar um assunto/pasta de textos já prontos pedindo os vídeos de avatar. Constrói por cima de avatar-heygen-nei e heygen-cli.
---

# heygen-avatar-nei-III — Fase 2: avatar por público

Transforma os textos da fase 1 em vídeos de avatar falante. A geraçêo é o
`heygen-cli`; os defaults do Nei vêm do `avatar-heygen-nei`. Esta skill adiciona:
(a) leitura automática dos arquivos da fase 1 e (b) o **mapeamento público → look**.

## Entrada

- **Assunto** (pasta `textos/<slug-do-assunto>/` deste projeto) — processa os públicos
  que tiverem arquivo lá; ou
- **Arquivo(s) específico(s)** `textos/<assunto>/<publico>.md`; ou
- Texto avulso (aí é só repassar pro fluxo do `avatar-heygen-nei`).
- **Versêo**: cada arquivo da fase 1 tem 3 versões. Se o usuário nêo disser qual,
  perguntar em texto livre (NUNCA AskUserQuestion) — render é pago, nêo gerar as 3
  sem pedido explícito.

## O que falar

Usar **somente** o conteúdo da seçêo `### FALA` da versêo escolhida — nunca as
SOBREPOSIÇÕES nem a ESTRUTURA. Passar o texto limpo, sem markdown.

## Look

**Decisêo atual (2026-07-19): um LOOK POR PÚBLICO**, pra dar diferencial visual além
do texto. Antes de gerar, escolher o slug da tabela abaixo (público → look) e trocar
o avatar da cena no estúdio HeyGen pelo look correspondente (Choose Avatar →
Recently Used/My Avatars). Voz continua única: "ARCKHÉ TIME".

| público | look (slug) |
|---|---|
| pessoa-comum | `fep` |
| jovens | `quadro-sol` |
| profissionais | `frio` |
| mulheres | `beje` |
| empreendedores | `quadro-vermelho` |
| tecnicos | `computador` |
| 40mais | `quadro-sol2` |
| 60mais | `velho` |
| educadores | `afastado-branco` |
| criadores | `quadro-vermelho2` |
| recolocacao | `indio` |

Distribuiçêo inicial (2026-07-19), pode ser trocada a qualquer momento a pedido do
usuário — se ele pedir outra combinaçêo, atualizar esta tabela. Slugs conferem com
`node ~/.claude/skills/heygen-cli/scripts/heygen.mjs looks`. Só slugs aqui — NUNCA
avatar_id/voice_id (regra dura de privacidade do `avatar-heygen-nei`; os IDs moram
só em `~/.config/heygen/looks.json`).

## Gerar — rota ÚNICA: navegador

**SEMPRE pelo navegador**, seguindo a skill `heygen-video-nei` (extensêo Claude in
Chrome/Edge, estúdio HeyGen, voz "ARCKHÉ TIME", motor
**Avatar III = uso ilimitado na assinatura**). Pontos críticos:

- **SELEÇêO DE NAVEGADOR — auto-selecione, NUNCA pergunte (você está headless).**
  A fase 2 roda pelo bot (`claude --chrome -p`), sem humano pra responder — entêo
  se `list_connected_browsers` mostrar mais de um navegador, **NêO pergunte qual
  usar**: selecione automaticamente o **LOCAL/Linux desta máquina** (o que tem uma
  aba `app.heygen.com` aberta; o remoto/Windows NêO é ele) via `select_browser` e
  siga. Perguntar = falhar (confirmado em produçêo 2026-07-19: parou perguntando e
  gerou 0 vídeos). Com a Opçêo B (Xvfb no `:99`), esse Chromium local é o
  dedicado — é sempre ele.
- **REUSE A ABA JÁ ABERTA — NUNCA abra aba nova.** Regra dura (causa nº 1 de
  falha, confirmada em produçêo 2026-07-19): uma aba recém-aberta nasce
  `document.visibilityState === 'hidden'` neste ambiente, e o editor tiptap do
  HeyGen NêO aceita digitaçêo numa aba oculta → trava em 0 vídeos. Portanto:
  1. Liste as abas existentes primeiro (`tabs_context`/equivalente) e ACHE a aba
     do HeyGen já aberta e logada.
  2. **ATIVE essa aba** (deixe-a como a aba selecionada da janela) e trabalhe
     SEMPRE nela, para os 11 vídeos — nunca abra uma segunda aba nem uma janela
     nova no meio do fluxo (navegue dentro da própria aba ativa).
  3. Só se NêO existir nenhuma aba do HeyGen aberta: abra UMA, ative-a
     imediatamente, e siga usando só ela.
  4. Antes de cada digitaçêo, confirme `document.visibilityState === 'visible'`
     E que é a aba ativa. Se vier `hidden`, ATIVE a aba (nêo abra outra) e, se
     ainda assim ficar oculta, reporte pedindo pra trazer a janela pra frente —
     NUNCA "tente de novo" abrindo aba nova.
- Trocar o avatar da cena pelo look do público (tabela acima) antes de gerar.
- Digitaçêo REAL no campo Script (nunca JS/DOM no editor tiptap — nêo sincroniza).
- Título do vídeo: `<assunto>-<publico>-v<versêo>`.
- 16:9, 1080p, MP4, marca d'água off (o avatar é landscape; a fase 3 empilha 16:9
  no reel — ver `reel-edita-ARCKHÉ`).
- Confirmar com o usuário antes de gerar, se ainda nêo autorizou na conversa.
- O vídeo cai em Meus Projetos → baixar depois pro path da fase 3.

*Existe também uma rota CLI/API (`heygen-cli` / `avatar-heygen-nei`,
`heygen.mjs --text ... --look ...`), que gasta créditos de API — **NêO usar**;
fica documentada só como alternativa de emergência, e apenas se o usuário pedir
explicitamente.*

## Saída

- MP4s em `~/projetos/output/heygen/` (out_dir do looks.json), entregues no bot.
- Registrar em `textos/<assunto>/renders.md` a tabela: público → versêo usada → look
  → arquivo gerado. Isso é a entrada da fase 3 (`ARCKHÉccvbot /reel`).

## Se travar (dificuldade na fase 2) → notificar no bot

Se qualquer coisa impedir a geraçêo — navegador nêo conecta (lembrar do
`--chrome`, ver `docs/setup-linux-navegador.md`), HeyGen deslogado, aba presa em
`hidden`, Avatar III indisponível, render falhando — **enviar uma notificaçêo no
bot do Telegram (ARCKHÉccvbot)** dizendo o que travou e o que a pessoa precisa
consertar (ex.: "logar no HeyGen no Chromium do Linux", "clicar na aba"), e só
entêo aguardar. Nêo ficar tentando em loop nem falhar em silêncio.

## Nêo fazer

- Nêo escrever avatar_id/voice_id/API key em NENHUM arquivo do repo (ver regra de
  privacidade do `avatar-heygen-nei`).
- Nêo gerar as 3 versões de um público sem pedido explícito (custo).
- Nêo fazer o reel/legendas aqui — isso é a fase 3 do pipeline
  (memória `pipeline-ARCKHÉclubpromover`).
