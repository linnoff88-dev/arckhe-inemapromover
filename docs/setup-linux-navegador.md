# Setup do navegador no Linux (fase 2 — HeyGen via Claude in Chrome)

Lições do primeiro uso real (2026-07-18), nesta máquina ARM64 (aarch64, Ubuntu, Chromium snap).

## 1. Iniciar o Claude Code com `--chrome`

**Obrigatório neste Linux.** Sem a flag, a extensão Claude in Chrome NÃO é
reconhecida e as tools de browser (`mcp__claude-in-chrome__*`) não conectam:

```bash
claude --chrome
```

Contexto da máquina: em aarch64 o Chrome/Edge oficiais não instalam — o navegador
é o **Chromium (snap)** com a extensão Claude instalada. Se as tools não
aparecerem, reiniciar a sessão (com `--chrome`).

## 2. Mais de um navegador conectado — SEMPRE conferir

A extensão pode estar conectada em várias máquinas ao mesmo tempo (aqui: Chromium
Linux + Chrome Windows). Sintoma clássico de estar no navegador errado:

- abas são criadas mas o usuário não vê nada;
- `document.visibilityState` fica `hidden` pra sempre;
- screenshots vêm em branco.

**Fix:** `list_connected_browsers` → escolher o certo (perguntar em texto livre,
nunca menu) → `select_browser` com o deviceId → `tabs_context_mcp` de novo (o
grupo de abas é outro no novo navegador).

## 3. Aba visível é pré-requisito

Mesmo no navegador certo, a aba do HeyGen precisa estar **em primeiro plano e
janela não minimizada** (`document.visibilityState === 'visible'`), senão
digitação/cliques não funcionam. Sem wmctrl/xdotool nesta máquina não dá pra
trazer a janela pra frente por comando — pedir pro usuário clicar na aba.
Truque útil: renomear a aba via JS (`document.title='🟠 CLAUDE — É ESTA ABA'`)
pra ele achar.

## 4. Login por navegador

A sessão do HeyGen é por navegador: estar logado no Windows não loga o Chromium
do Linux. Login é do usuário (nunca do agente). Depois de logado, o fluxo da
skill `heygen-video-nei` funciona normal.

## 5. Defaults podem vir errados no navegador novo

No primeiro uso no Chromium Linux, o editor abriu com avatar "Annie" / voz
"Annie - Lifelike" / motor Avatar IV (Premium!). Conferir e corrigir SEMPRE:

- Avatar: **Nei Maldaner** (Choose Avatar → Recently Used/My Avatars)
- Voz: **INEMA TIME**
- Motion Engine: **Avatar III** (o único ilimitado — IV/V são Premium)

## 6. Rastro do setup

Rascunhos "Vídeo sem título" órfãos podem sobrar das tentativas — apagar
manualmente (o agente não deleta nada no HeyGen).

## 7. Aba `hidden` — a causa nº1 de a fase 2 travar (e a estratégia A→B)

**Sintoma:** a fase 2 (automática, via `/promoclub` do inemaccvbot) acha o avatar,
extrai as falas, navega até o editor — e para em "0 vídeos", reportando a aba
presa em `document.visibilityState === 'hidden'`. O editor tiptap do HeyGen NÃO
sincroniza digitação numa aba oculta, então a skill se recusa a gerar (e a
verificação na API confirma 0/N).

**Causa raiz (confirmada em produção 2026-07-19):** `visibilityState` é POR ABA,
não por janela — uma aba só é `visible` quando é a **aba selecionada** E a janela
está **focada em primeiro plano**. Dois furos somam nesse ambiente (Chromium via
xrdp/display virtual):
1. a automação abria uma **aba nova**, que nasce `hidden`; e
2. a janela não fica focada de forma confiável (o mutter ignora `wmctrl -a`, que
   mexe na janela e não na aba).

### Opção A — automático reusando a aba aberta (fix atual)

A skill `heygen-avatar-nei-III` foi ajustada (2026-07-19) para **REUSAR a aba do
HeyGen já aberta e ATIVÁ-LA**, nunca abrir aba nova, e trabalhar só nela pros N
vídeos. Com isso, se você **mantém a janela do Chromium em primeiro plano** com a
aba do HeyGen selecionada, a fase 2 automática funciona (foi assim que saiu o
primeiro lote 11/11). Limitação: ainda depende de a janela estar em foco no
momento em que digita — se outra janela roubar o foco, a aba vira `hidden`.

### Opção B — Chromium dedicado em display virtual Xvfb ✔ VALIDADA (2026-07-19)

A solução definitiva, que remove a dependência de manter janela em foco: um
Chromium próprio num **display virtual Xvfb** (`:99`) com WM mínimo (openbox),
janela única maximizada — sempre focada, `visibilityState === 'visible'` e
`hasFocus() === true` comprovados, isolado do desktop real.

**Prova em produção (2026-07-19):** uma rodada real da fase 2 (`claude --chrome
-p`, prompt idêntico ao do bot) gerou **11/11 vídeos** do assunto
"o-ceo-da-anthropic" no HeyGen, confirmados pela API (`video.list`), **sem
nenhum toque humano** — navegando o editor na MESMA aba, com o desktop fechado.

**Estratégia atual:** a **B é o caminho automático oficial**. A A (janela do
desktop em foco) vira só backup manual de emergência — a janela do desktop NÃO
precisa mais ficar em foco pra fase 2 rodar.

### 7.1. Opção B em operação (como ficou montada — validada 2026-07-19)

**Peças:**

| Peça | Onde |
|---|---|
| Service (sobe tudo, auto-start no boot) | `~/.config/systemd/user/stack99.service` → `~/stack99/stack99-run.sh` |
| Scripts manuais (start/stop/check) | `~/stack99/stack99-{start,stop,check}.sh` |
| Perfil do Chromium dedicado | `~/snap/chromium/common/chromium-xvfb` (CÓPIA do perfil do desktop) |
| Espiar a tela | `x11vnc` já incluso — VNC viewer em `localhost:5900` (ex.: Remmina) |

**Operar:**
```bash
systemctl --user status stack99      # está de pé?
systemctl --user restart stack99     # reinicia a stack inteira (Xvfb+openbox+vnc+chromium)
bash ~/stack99/stack99-check.sh      # processos + JANELA MAPEADA (o ponto que falhava)
```

**Como a fase 2 usa:** o `fase2Runner` do inemaccvbot roda `claude --chrome -p`
normal — a extensão do `:99` aparece como navegador conectado e o prompt manda
auto-selecionar o local/Linux sem perguntar. Não precisa de `DISPLAY` no runner.
O subagente resolve `hidden` sozinho dentro do `:99` (xdotool windowactivate)
e trabalha os N vídeos numa aba só.

**Lições que custaram caro (não repetir):**
- **Chrome Web Store RECUSA instalar extensão em Chromium** ("Mude para o
  Chrome"). A saída é **copiar o perfil inteiro do desktop** (com Chromium
  fechado! copiar com ele aberto corrompe): extensão + pareamento + login do
  HeyGen vêm juntos.
- **`pkill -f`/`pgrep -f` com "chromium-xvfb" no padrão MATAM/CASAM o próprio
  wrapper bash** (o cmdline do `bash -c` contém a string) — foi a causa da
  "flakiness" de janela preta (o launcher morria no meio, exit 144). Usar o
  truque do colchete (`chromium-xvf[b]`) ou scripts em arquivo.
- Flags que mantêm a aba `visible` no Xvfb:
  `--disable-features=CalculateNativeWinOcclusion`,
  `--disable-backgrounding-occluded-windows`, `--disable-renderer-backgrounding`.
  Comprovado com página de teste: `VIS_visible_hasFocus_true`.
- O native messaging (manifesto na pasta do snap, seção 1) vale pra qualquer
  perfil do mesmo snap — o `:99` herdou sem ajuste.

**Caveats abertos:**
- **Perfil é uma CÓPIA**: se o login do HeyGen expirar no `:99`, refazer a cópia
  (desktop fechado) ou logar via VNC. A cópia também clona o estado da extensão —
  com o Chromium do desktop aberto AO MESMO TEMPO, dois navegadores "Linux local"
  aparecem pareados; a heurística da fase 2 escolhe o que tem `app.heygen.com`
  aberto (o `:99` sempre tem). Se o desktop também estiver com HeyGen aberto,
  pode haver ambiguidade — melhoria futura: fixar o ID do navegador `:99`.
- Rascunhos "Untitled Video" órfãos podem sobrar de runs — apagar manualmente.
