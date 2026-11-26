ï»¿# ARCKHÉpromover

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="48" />
  <p><strong>Arckhé AI</strong></p>
</div>


FêÂ¡brica de reels de divulgaêÂ§êÂ£o do **ARCKHÉ AI**, segmentados por pêÂºblico:
**texto ê¢â â avatar HeyGen ê¢â â reel empilhado (capa de impacto) ê¢â â canal YouTube do
pêÂºblico correspondente.**

Um êÂºnico assunto entra de um lado do pipeline; do outro saem atêÂ© 11 reels
verticais prontos ê¢â¬â um por pêÂºblico, cada um com gancho, exemplo e promessa
prêÂ³prios ê¢â¬â enfileirados automaticamente no canal certo. Todo o pipeline roda
como skills do [Claude Code](https://claude.com/product/claude-code) sobre
serviêÂ§os que jêÂ¡ existem no ambiente do operador (HeyGen, bot de ediêÂ§êÂ£o,
canais do YouTube).

ê°Å¸ââ Guia de uso publicado: **https://linnoff88-dev.github.io/arckhe-/guia/**

## SumêÂ¡rio

- [VisêÂ£o geral](#visêÂ£o-geral)
- [Componentes do sistema](#componentes-do-sistema)
- [InstalaêÂ§êÂ£o / prêÂ©-requisitos](#instalaêÂ§êÂ£o--prêÂ©-requisitos)
- [As 4 fases do pipeline](#as-4-fases-do-pipeline)
- [PêÂºblicos e canais](#pêÂºblicos-e-canais)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Dicas e pontos de atenêÂ§êÂ£o](#dicas-e-pontos-de-atenêÂ§êÂ£o)
  - [Fase 2 e o navegador: requisitos e automaêÂ§êÂ£o](#fase-2-e-o-navegador-requisitos-e-automaêÂ§êÂ£o)
- [Regras duras](#regras-duras)
- [Roadmap](#roadmap)

## VisêÂ£o geral

O `ARCKHÉpromover` nêÂ£o êÂ© um app com interface prêÂ³pria ê¢â¬â êÂ© um **pipeline
orquestrado por skills do Claude Code**, cada fase acionada como um pedido em
linguagem natural (ou o comando de skill correspondente) numa sessêÂ£o do
Claude Code. Cada fase lêÂª a saêÂ­da da fase anterior e grava a sua prêÂ³pria,
sempre dentro deste repositêÂ³rio (`textos/`, `output/`, `state/`) ê¢â¬â nenhum
dado do pipeline vive fora daqui.

```
assunto
  ê¢ââ
  ê¢âÂ¼
1. TEXTOS (ARCKHÉclub-textos)        ê¢â â textos/<assunto>/<publico>.md (3 versêÂµes cada)
  ê¢ââ
  ê¢âÂ¼
2. AVATAR (heygen-avatar-nei-III)   ê¢â â vêÂ­deo de avatar no HeyGen (navegador)
  ê¢ââ
  ê¢âÂ¼
2.5 DOWNLOAD (heygen-download-nei)  ê¢â â output/<assunto>/avatares/*.mp4
  ê¢ââ
  ê¢âÂ¼
3. REEL (ARCKHÉclub-reel)            ê¢â â enfileirado no mkivideos, 9:16 empilhado
  ê¢ââ
  ê¢âÂ¼
4. PUBLICAêâ¡êÆO (automêÂ¡tica)          ê¢â â canal YouTube do pêÂºblico (yt-pub-livesN)
```

## Componentes do sistema

O pipeline nêÂ£o roda sozinho: ele orquestra peêÂ§as que jêÂ¡ precisam existir no
ambiente do operador.

| Componente | Papel | Onde mora |
|---|---|---|
| **Claude Code** | Executa cada fase como skill, a partir de um pedido em texto | CLI local |
| **ExtensêÂ£o Claude in Chrome/Edge** | DêÂ¡ ao Claude Code controle do navegador logado no HeyGen | navegador do operador |
| **HeyGen (estêÂºdio web)** | Gera o vêÂ­deo de avatar falando o roteiro da fase 1 | `app.heygen.com`, sessêÂ£o logada |
| **ARCKHÉccvbot** | Bot de Telegram; comando `/promoclub` orquestra o pipeline inteiro (fase 1 ê¢â â fase 2 automêÂ¡tica ê¢â â watcher ê¢â â fase 3) | `~/projetos/ARCKHÉccvbot` |
| **`wmctrl`** | Foca a janela do Chromium automaticamente antes da fase 2 (sem isso, a aba fica `hidden` e trava) | pacote do sistema (`apt install wmctrl`) |
| **mkivideos** | Daemon/fila que efetivamente monta e renderiza os reels | `~/projetos/mkivideos`, dashboard `:3142`/`:3143` |
| **skill `reel-edita-ARCKHÉ`** | Motor de composiêÂ§êÂ£o do reel (modo "capa de impacto") usado pelo mkivideos | `~/.claude/skills/reel-edita-ARCKHÉ` |
| **yt-pub-livesN** (N = 21ê¢â¬â31) | Um pipeline por pêÂºblico que publica o reel no canal YouTube correspondente | `~/projetos/yt-pub-lives21` ê¢â¬Â¦ `31` |

## InstalaêÂ§êÂ£o / prêÂ©-requisitos

Este repositêÂ³rio nêÂ£o precisa de `npm install` nem build ê¢â¬â êÂ© composto de
skills (markdown) + um script Node standalone. O que precisa estar pronto
**fora** dele:

1. **Claude Code com acesso ao navegador.** Nesta configuraêÂ§êÂ£o (Linux/ARM64,
   Chromium via snap), a extensêÂ£o sêÂ³ êÂ© reconhecida iniciando com a flag:
   ```bash
   claude --chrome
   ```
   Sem isso as tools de navegador nêÂ£o conectam ê¢â¬â ver detalhes e workarounds
   em [`docs/setup-linux-navegador.md`](docs/setup-linux-navegador.md).

2. **Conta HeyGen logada** no navegador usado pela extensêÂ£o, com o avatar
   **"Nei Maldaner"**, voz **"ARCKHÉ TIME"** e motor **Avatar III** (o êÂºnico
   ilimitado na assinatura ê¢â¬â Avatar IV/V sêÂ£o Premium e cobram por render).

3. **`ARCKHÉccvbot` + `mkivideos` no ar** (o worker que efetivamente monta o
   reel):
   ```bash
   pgrep -af 'dist/cli.js run'          # confere se os workers do mkivideos estêÂ£o de pêÂ©
   curl -s localhost:3142/api/stats     # ping na fila antes de enfileirar
   ```

4. **Pastas de canal por pêÂºblico** (`~/projetos/yt-pub-lives21` a `31`, uma
   por pêÂºblico ê¢â¬â ver tabela abaixo). Se faltar alguma na hora de enfileirar,
   a fase 3 cria o mêÂ­nimo `imports/videos/` para nêÂ£o travar o job, mas a
   configuraêÂ§êÂ£o do canal em si (credenciais/YouTube) êÂ© feita pelo operador:
   ```bash
   mkdir -p ~/projetos/yt-pub-lives21/imports/videos
   ```

5. **Chave da API HeyGen** (usada sêÂ³ na fase 2.5, para baixar renders sem
   custo, via `scripts/list-videos.mjs`) ê¢â¬â nunca fica neste repo; êÂ© lida de
   um `.env` externo:
   ```bash
   export HEYGEN_ENV_PATH=~/.config/heygen/.env   # arquivo com HEYGEN_API_KEY=...
   node scripts/list-videos.mjs --title "<assunto>"
   ```

## As 4 fases do pipeline

Cada fase êÂ© pedida ao Claude Code em linguagem natural (ou pelo nome da
skill); nêÂ£o sêÂ£o comandos de shell separados.

### Fase 1 ê¢â¬â Textos (`ARCKHÉclub-textos`)

Um assunto vira **3 versêÂµes de roteiro falado** (~35-40s cada) por pêÂºblico ê¢â¬â
mesmo conteêÂºdo, gancho/linguagem/exemplo diferentes. Sai em
`textos/<slug-do-assunto>/<publico>.md`, com seêÂ§êÂµes `FALA` (o que o avatar
vai falar), `SOBREPOSIêâ¡êâ¢ES` (cards/legendas do reel) e `ESTRUTURA`.

```
/ARCKHÉclub-textos "assunto da campanha"
```

Se nêÂ£o disser os pêÂºblicos, o default êÂ© `pessoa-comum`; "todos" gera para os
11.

### Fase 2 ê¢â¬â Avatar no HeyGen (`heygen-avatar-nei-III`)

Pega a seêÂ§êÂ£o `FALA` do roteiro escolhido e gera o vêÂ­deo de avatar **sempre
pelo navegador** (nunca API ê¢â¬â API tem custo por render e sêÂ³ êÂ© usada com
pedido explêÂ­cito). TêÂ­tulo padronizado `<assunto>-<publico>-v<versêÂ£o>`, saêÂ­da
16:9 1080p sem marca d'êÂ¡gua, com um **look diferente por pêÂºblico** (tabela
de slugs na skill ê¢â¬â nunca `avatar_id`/`voice_id` em arquivo).

```
Use a skill heygen-avatar-nei-III para o assunto "<slug>"
```

**AutomêÂ¡tica, via `/promoclub` do ARCKHÉccvbot**: o bot dispara a fase 1 e,
assim que ela termina, emenda a fase 2 sozinho (`claude --chrome -p`) ê¢â¬â
sem precisar pedir de novo. Ver [Fase 2 e o navegador](#fase-2-e-o-navegador-requisitos-e-automaêÂ§êÂ£o)
para os requisitos e o que fazer quando ela travar. Chamar a skill acima
diretamente (como no exemplo) continua funcionando pra rodar a fase 2 na
mêÂ£o, fora do bot.

### Fase 2.5 ê¢â¬â Download (`heygen-download-nei`)

Baixar nêÂ£o gasta crêÂ©dito, entêÂ£o usa API quando possêÂ­vel (rota A, via
`scripts/list-videos.mjs` + `deliver.mjs --no-send`) e cai para o navegador
(rota B) se o vêÂ­deo nêÂ£o aparecer na API. Deixa o MP4 pronto em
`output/<assunto>/avatares/<assunto>-<publico>-v<versêÂ£o>.mp4`.

```
Use a skill heygen-download-nei para o assunto "<slug>"
```

### Fase 3 ê¢â¬â Reel (`ARCKHÉclub-reel`)

Enfileira cada avatar no `mkivideos`, em **modo "capa de impacto"**: topo com
headline-choque (o gatilho do pêÂºblico) + imagem trocando, meio com o avatar,
base com o explicativo, legenda palavra-a-palavra e CTA fixo. Destino:
`yt-pub-lives<N>/imports/videos` do pêÂºblico.

```
Use a skill ARCKHÉclub-reel para o assunto "<slug>"
```

Sintaxe direta na fila (o que o bot faz por trêÂ¡s):
```bash
cd ~/projetos/mkivideos && node dist/cli.js add reel \
  "<path-do-avatar>.mp4 | capa impacto | headline-gancho: <GATILHO> | palavra-chave êÂ¢mbar: <X> | CTA fixo: Saiba mais no ARCKHÉ AI" \
  --pasta ~/projetos/yt-pub-lives<N>/imports/videos
```

### Fase 4 ê¢â¬â PublicaêÂ§êÂ£o (automêÂ¡tica)

Nenhuma aêÂ§êÂ£o aqui: o pipeline `yt-pub-livesN` de cada pêÂºblico monitora a
pasta de import, publica no YouTube e o bot avisa no Telegram quando termina.

## PêÂºblicos e canais

| slug | pêÂºblico | lives (canal) |
|---|---|---|
| `pessoa-comum` | Pessoa comum / leigo | lives21 |
| `jovens` | Jovens | lives22 |
| `profissionais` | Profissionais | lives23 |
| `mulheres` | Mulheres | lives24 |
| `empreendedores` | Empreendedores | lives25 |
| `tecnicos` | TêÂ©cnicos | lives26 |
| `40mais` | 40+ | lives27 |
| `60mais` | 60+ e aposentados | lives28 |
| `educadores` | Professores e educadores | lives29 |
| `criadores` | Criadores de conteêÂºdo | lives30 |
| `recolocacao` | RecolocaêÂ§êÂ£o / transiêÂ§êÂ£o de carreira | lives31 |

Gatilho/promessa de cada pêÂºblico (usado como gancho da fase 1 e headline da
capa de impacto na fase 3) estêÂ¡ na tabela completa da skill
`ARCKHÉclub-textos`.

## Estrutura de pastas

```
ARCKHÉpromover/
ê¢âÅê¢ââ¬ê¢ââ¬ CLAUDE.md              # documentaêÂ§êÂ£o canêÂ´nica do pipeline (para o Claude Code)
ê¢âÅê¢ââ¬ê¢ââ¬ README.md              # este arquivo
ê¢âÅê¢ââ¬ê¢ââ¬ .claude/skills/        # as 4 skills do pipeline (fases 1, 2, 2.5, 3)
ê¢âÅê¢ââ¬ê¢ââ¬ scripts/
ê¢ââ   ê¢ââê¢ââ¬ê¢ââ¬ list-videos.mjs    # lista vêÂ­deos prontos no HeyGen via API (fase 2.5, rota A)
ê¢âÅê¢ââ¬ê¢ââ¬ docs/
ê¢ââ   ê¢ââê¢ââ¬ê¢ââ¬ setup-linux-navegador.md   # liêÂ§êÂµes de setup do navegador em Linux/ARM64
ê¢âÅê¢ââ¬ê¢ââ¬ textos/                # saêÂ­da da fase 1 (roteiros por assunto/pêÂºblico)
ê¢âÅê¢ââ¬ê¢ââ¬ output/                # saêÂ­da da fase 2.5 (avatares baixados) ê¢â¬â fora do git
ê¢âÅê¢ââ¬ê¢ââ¬ state/                 # estado de execuêÂ§êÂ£o por assunto (jobs, status) ê¢â¬â fora do git
ê¢ââê¢ââ¬ê¢ââ¬ guia/                  # landing + guia de uso publicado em GitHub Pages
```

`output/` e `state/` ficam fora do controle de versêÂ£o (vêÂ­deos sêÂ£o grandes e
regenerêÂ¡veis; o estado de execuêÂ§êÂ£o êÂ© dado de runtime, nêÂ£o cêÂ³digo).

### Mapa: onde cada arquivo mora, do avatar ao canal

O avatar e o reel **nêÂ£o moram neste repositêÂ³rio** ê¢â¬â sêÂ³ os textos/estado do
pipeline moram aqui. Os binêÂ¡rios (vêÂ­deo) vivem nos projetos que efetivamente
renderizam:

```
1. AVATAR (fase 2, HeyGen)
   gerado em: HeyGen "Meus Projetos" (nuvem, têÂ­tulo <assunto>-<publico>-v<versêÂ£o>)
        ê¢ââ
        ê¢âÂ¼ fase 2.5 (heygen-download-nei / watcher automêÂ¡tico do ARCKHÉccvbot)
   baixado em: ARCKHÉpromover/output/<assunto>/avatares/<titulo>.mp4

2. REEL (fase 3, mkivideos)
   renderizado em: ~/projetos/mkivideos/renders/mkivideo-<jobId>-16.mp4
   (MKIVIDEOS_RENDER_DIR do mkivideos ê¢â¬â precisa ser ABSOLUTO, ver aviso abaixo)
        ê¢ââ
        ê¢âÂ¼ watcher do ARCKHÉccvbot (applyReelDest, a partir do result_path do job)
   copiado para: ~/projetos/yt-pub-lives<N>/imports/videos/mkivideo-<jobId>-16.mp4
   (cêÂ³pia por padrêÂ£o ê¢â¬â o original fica em renders/; sêÂ³ apaga se o job pedir "mover")

3. PUBLICAêâ¡êÆO (fase 4, automêÂ¡tica ê¢â¬â fora deste pipeline)
   yt-pub-lives<N>/imports/videos/ ê¢â â pipeline yt-pub-livesN ê¢â â canal YouTube do pêÂºblico
```

> ê¢Å¡Â ê¯Â¸Â **O mkivideos sêÂ³ deve subir via `systemctl --user restart mkivideos.service`,
> nunca `nohup`/`node dist/cli.js` cru.** O unit systemd define `MKIVIDEOS_RENDER_DIR`
> absoluto; sem ele o worker grava `result_path` relativo no banco ê¢â¬â ele mesmo resolve
> esse caminho (mesmo cwd), mas o watcher do `ARCKHÉccvbot` nêÂ£o (cwd diferente), e a
> cêÂ³pia pro `yt-pub-lives<N>` falha com `ENOENT` mesmo com o `.mp4` intacto em
> `renders/`. **Incidente real (2026-07-19)**: exatamente isso aconteceu com 5 reels em
> sequêÂªncia (jobs #120ê¢â¬â124) depois de um restart manual via `nohup` ê¢â¬â corrigido
> voltando ao restart via systemd; os 5 arquivos foram recuperados e copiados na mêÂ£o
> (estavam intactos, sêÂ³ nêÂ£o tinham sido entregues). Detalhes têÂ©cnicos completos nos
> READMEs de [`mkivideos`](https://github.com/linnoff88-dev/mkivideos#readme) e
> [`ARCKHÉccvbot`](https://github.com/linnoff88-dev/ARCKHÉccvbot#readme) (seêÂ§êÂ£o 7.1).

## Dicas e pontos de atenêÂ§êÂ£o

- **Navegador em Linux/ARM64 êÂ© a parte mais frêÂ¡gil do pipeline.** Sem
  `claude --chrome`, a extensêÂ£o simplesmente nêÂ£o conecta. Se as abas criadas
  ficam "invisêÂ­veis" (`document.visibilityState === 'hidden'`) ou os
  screenshots vêÂªm em branco, normalmente êÂ© porque hêÂ¡ mais de um navegador
  pareado com a extensêÂ£o ê¢â¬â usar `list_connected_browsers` + `select_browser`
  para escolher o certo. Detalhes completos em
  [`docs/setup-linux-navegador.md`](docs/setup-linux-navegador.md).
- **O manifesto de pareamento (native messaging) precisa existir na pasta
  certa do navegador.** Com Chromium instalado via **snap**, o Claude Code
  costuma gravar o manifesto em `~/.config/chromium/NativeMessagingHosts/`,
  mas o Chromium snap sêÂ³ lêÂª `~/snap/chromium/common/chromium/NativeMessagingHosts/`
  ê¢â¬â se a extensêÂ£o nunca conectar mesmo com `--chrome`, copiar o arquivo
  `com.anthropic.claude_code_browser_extension.json` pra essa segunda pasta
  resolve.
- **Confira os defaults do editor HeyGen a cada navegador novo.** JêÂ¡
  aconteceu de abrir com avatar "Annie" / voz "Annie - Lifelike" / motor
  Avatar IV (Premium!) em vez do padrêÂ£o do estêÂºdio ê¢â¬â sempre trocar para o
  look do pêÂºblico (tabela da skill) / ARCKHÉ TIME / Avatar III antes de gerar.
- **Renders de avatar têÂªm custo/tempo** ê¢â¬â a fase 2 nunca gera as 3 versêÂµes
  de um pêÂºblico de uma vez sem pedido explêÂ­cito, e nunca usa a rota API
  (sêÂ³ a rota navegador, sem custo por estar na assinatura).
- **Ping na fila antes de enfileirar** (`GET :3142/api/stats`) ê¢â¬â se o daemon
  do mkivideos estiver fora, a fase 3 avisa e nêÂ£o enfileira, em vez de
  falhar silenciosamente.
- **Canais `yt-pub-lives21..31` podem nêÂ£o existir ainda.** A fase 3 cria o
  mêÂ­nimo (`imports/videos/`) para nêÂ£o travar o job, mas isso nêÂ£o configura o
  canal ê¢â¬â a configuraêÂ§êÂ£o real (credenciais do YouTube) êÂ© responsabilidade do
  operador.

### Fase 2 e o navegador: requisitos e automaêÂ§êÂ£o

A fase 2 êÂ© a parte mais sensêÂ­vel do pipeline porque depende de um Chromium
**de verdade** (nêÂ£o headless) controlado pela extensêÂ£o. Pontos validados em
produêÂ§êÂ£o (2026-07-19):

- **A aba do HeyGen sêÂ³ aceita digitaêÂ§êÂ£o quando êÂ© a aba ATIVA de uma janela em
  primeiro plano** (`document.visibilityState === 'visible'`) ê¢â¬â `visibilityState`
  êÂ© POR ABA, nêÂ£o por janela. O editor tiptap do HeyGen nêÂ£o sincroniza digitaêÂ§êÂ£o
  numa aba oculta, e a skill se recusa a gerar nesse estado (reporta o bloqueio
  em vez de fingir sucesso). Causa nêÂº1 de a fase 2 travar em "0 vêÂ­deos".
- **`wmctrl` NêÆO resolve de forma confiêÂ¡vel.** Testado: o `wmctrl -a Chromium`
  mexe na *janela*, nêÂ£o na *aba*, e ainda por cima o GNOME/mutter ignora o pedido
  de ativaêÂ§êÂ£o (focus-stealing prevention) ê¢â¬â a janela nem vem pra frente. Dois
  furos somam: (a) a automaêÂ§êÂ£o abria uma **aba nova** (nasce `hidden`) e (b) a
  janela nêÂ£o fica focada por comando.
- **OpêÂ§êÂ£o A (fix atual) ê¢â¬â automêÂ¡tico reusando a aba aberta.** A skill
  `heygen-avatar-nei-III` foi ajustada pra **REUSAR a aba do HeyGen jêÂ¡ aberta e
  ativêÂ¡-la**, nunca abrir aba nova, e trabalhar sêÂ³ nela. Com a janela do Chromium
  em primeiro plano, a fase 2 automêÂ¡tica funciona (foi assim que saiu o 1êÂº lote
  11/11). LimitaêÂ§êÂ£o: ainda depende de a janela nêÂ£o perder o foco enquanto digita.
- **OpêÂ§êÂ£o B (plano) ê¢â¬â Chromium dedicado em Xvfb.** Display virtual `:99` com WM
  mêÂ­nimo, uma janela êÂºnica e uma aba sêÂ³ ê¢â¬â sempre focada/ativa, `visible` de forma
  confiêÂ¡vel, isolado do desktop real. O bot aponta a fase 2 pra esse display e
  seleciona esse navegador. **EstratêÂ©gia: rodar com a A agora; montar a B e,
  quando validada, desativar a A** (B vira o caminho automêÂ¡tico; A vira backup
  manual). Instalar Xvfb/WM/x11vnc exige `sudo` (feito pelo operador).
- **"SessêÂ£o desconectada" (RDP fechado sem logout) ê¢â°Â  "nada rodando".** Com xrdp,
  o Xorg + Chromium continuam de pêÂ© mesmo com o cliente RDP fechado ê¢â¬â sêÂ³ um
  **logout** encerra a sessêÂ£o.
- **VerificaêÂ§êÂ£o real, nêÂ£o confianêÂ§a cega no subagente.** JêÂ¡ aconteceu (produêÂ§êÂ£o)
  do `claude --chrome -p` **reportar sucesso sem ter controlado o navegador** ê¢â¬â um
  falso positivo. Por isso a automaêÂ§êÂ£o sempre confere na API do HeyGen se os
  têÂ­tulos realmente apareceram antes de dizer "concluêÂ­do".

**Numa mêÂ¡quina sem ambiente grêÂ¡fico nenhum** (nem virtual), o esquema nêÂ£o roda ê¢â¬â
a extensêÂ£o precisa de um Chromium real. êâ° exatamente o caso da OpêÂ§êÂ£o B (Xvfb)
acima. Alternativa: **rota de API/crêÂ©dito** (`heygen-cli`) ê¢â¬â nêÂ£o precisa de
navegador, mas **gasta crêÂ©dito por render** (hoje evitado de propêÂ³sito, ver
Regras duras).

## Regras duras

- **IDs de avatar/voz do HeyGen nunca em arquivo deste repo.** Moram em
  `~/.config/heygen/looks.json` ou na sessêÂ£o logada do navegador ê¢â¬â sêÂ³ slugs
  legêÂ­veis (ex.: "Nei Maldaner") aparecem em texto.
- **Render de avatar sêÂ³ pelo navegador** (uso incluêÂ­do na assinatura); a
  rota de API/CLI existe sêÂ³ como emergêÂªncia documentada, nunca por padrêÂ£o.
- **Posicionamento de marca**: sempre "uma das plataformas gratuitas de
  formaêÂ§êÂ£o prêÂ¡tica em IA mais completas do Brasil" ê¢â¬â nunca "a êÂºnica".
  Frase-mêÂ£e: *"NêÂ£o importa sua idade ou profissêÂ£o. Existe uma trilha de IA
  para vocêÂª no ARCKHÉ AI."*

## Roadmap

- ~~Look por pêÂºblico~~ ê¢Åâ feito (2026-07-19) ê¢â¬â cada pêÂºblico tem seu look
  (tabela na skill `heygen-avatar-nei-III`), sêÂ³ slugs, sem `avatar_id`.
- ~~Fase 2 automêÂ¡tica (disparo)~~ ê¢Åâ feito (2026-07-19) ê¢â¬â `/promoclub` do
  `ARCKHÉccvbot` dispara a fase 2 sozinha apêÂ³s a fase 1, com verificaêÂ§êÂ£o real
  na API do HeyGen antes de declarar sucesso.
- **Fase 2 confiêÂ¡vel (aba `visible`).** ê¢ÂÂ³ em andamento ê¢â¬â OpêÂ§êÂ£o A (reusar a aba
  aberta, feito) funciona com a janela em foco; OpêÂ§êÂ£o B (Chromium dedicado em
  Xvfb) êÂ© o plano pra tornar 100% automêÂ¡tico sem depender de foco. Ver
  [Fase 2 e o navegador](#fase-2-e-o-navegador-requisitos-e-automaêÂ§êÂ£o).
- **Sintaxe da capa de impacto.** Refinar como o gatilho do pêÂºblico vira
  headline e como as sobreposiêÂ§êÂµes da fase 1 entram automaticamente no job
  da fase 3.
- **MêÂ¡quina sem ambiente grêÂ¡fico.** Hoje a fase 2 depende de um Chromium
  real (com display X, real ou virtual). Se for preciso rodar numa mêÂ¡quina
  totalmente headless, falta decidir entre Xvfb (mantêÂ©m a rota gratuita) ou
  a rota de API paga ê¢â¬â ver [Fase 2 e o navegador](#fase-2-e-o-navegador-requisitos-e-automaêÂ§êÂ£o).

---

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="32" />
  <p><strong>Arckhé AI</strong></p>
</div>