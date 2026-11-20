# inemapromover

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="48" />
  <p><strong>Arckhé AI</strong></p>
</div>


FÃ¡brica de reels de divulgaÃ§Ã£o do **INEMA.club**, segmentados por pÃºblico:
**texto â†’ avatar HeyGen â†’ reel empilhado (capa de impacto) â†’ canal YouTube do
pÃºblico correspondente.**

Um Ãºnico assunto entra de um lado do pipeline; do outro saem atÃ© 11 reels
verticais prontos â€” um por pÃºblico, cada um com gancho, exemplo e promessa
prÃ³prios â€” enfileirados automaticamente no canal certo. Todo o pipeline roda
como skills do [Claude Code](https://claude.com/product/claude-code) sobre
serviÃ§os que jÃ¡ existem no ambiente do operador (HeyGen, bot de ediÃ§Ã£o,
canais do YouTube).

ðŸ“– Guia de uso publicado: **https://inematds.github.io/inemapromover/guia/**

## SumÃ¡rio

- [VisÃ£o geral](#visÃ£o-geral)
- [Componentes do sistema](#componentes-do-sistema)
- [InstalaÃ§Ã£o / prÃ©-requisitos](#instalaÃ§Ã£o--prÃ©-requisitos)
- [As 4 fases do pipeline](#as-4-fases-do-pipeline)
- [PÃºblicos e canais](#pÃºblicos-e-canais)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Dicas e pontos de atenÃ§Ã£o](#dicas-e-pontos-de-atenÃ§Ã£o)
  - [Fase 2 e o navegador: requisitos e automaÃ§Ã£o](#fase-2-e-o-navegador-requisitos-e-automaÃ§Ã£o)
- [Regras duras](#regras-duras)
- [Roadmap](#roadmap)

## VisÃ£o geral

O `inemapromover` nÃ£o Ã© um app com interface prÃ³pria â€” Ã© um **pipeline
orquestrado por skills do Claude Code**, cada fase acionada como um pedido em
linguagem natural (ou o comando de skill correspondente) numa sessÃ£o do
Claude Code. Cada fase lÃª a saÃ­da da fase anterior e grava a sua prÃ³pria,
sempre dentro deste repositÃ³rio (`textos/`, `output/`, `state/`) â€” nenhum
dado do pipeline vive fora daqui.

```
assunto
  â”‚
  â–¼
1. TEXTOS (inemaclub-textos)        â†’ textos/<assunto>/<publico>.md (3 versÃµes cada)
  â”‚
  â–¼
2. AVATAR (heygen-avatar-nei-III)   â†’ vÃ­deo de avatar no HeyGen (navegador)
  â”‚
  â–¼
2.5 DOWNLOAD (heygen-download-nei)  â†’ output/<assunto>/avatares/*.mp4
  â”‚
  â–¼
3. REEL (inemaclub-reel)            â†’ enfileirado no mkivideos, 9:16 empilhado
  â”‚
  â–¼
4. PUBLICAÃ‡ÃƒO (automÃ¡tica)          â†’ canal YouTube do pÃºblico (yt-pub-livesN)
```

## Componentes do sistema

O pipeline nÃ£o roda sozinho: ele orquestra peÃ§as que jÃ¡ precisam existir no
ambiente do operador.

| Componente | Papel | Onde mora |
|---|---|---|
| **Claude Code** | Executa cada fase como skill, a partir de um pedido em texto | CLI local |
| **ExtensÃ£o Claude in Chrome/Edge** | DÃ¡ ao Claude Code controle do navegador logado no HeyGen | navegador do operador |
| **HeyGen (estÃºdio web)** | Gera o vÃ­deo de avatar falando o roteiro da fase 1 | `app.heygen.com`, sessÃ£o logada |
| **inemaccvbot** | Bot de Telegram; comando `/promoclub` orquestra o pipeline inteiro (fase 1 â†’ fase 2 automÃ¡tica â†’ watcher â†’ fase 3) | `~/projetos/inemaccvbot` |
| **`wmctrl`** | Foca a janela do Chromium automaticamente antes da fase 2 (sem isso, a aba fica `hidden` e trava) | pacote do sistema (`apt install wmctrl`) |
| **mkivideos** | Daemon/fila que efetivamente monta e renderiza os reels | `~/projetos/mkivideos`, dashboard `:3142`/`:3143` |
| **skill `reel-edita-inema`** | Motor de composiÃ§Ã£o do reel (modo "capa de impacto") usado pelo mkivideos | `~/.claude/skills/reel-edita-inema` |
| **yt-pub-livesN** (N = 21â€“31) | Um pipeline por pÃºblico que publica o reel no canal YouTube correspondente | `~/projetos/yt-pub-lives21` â€¦ `31` |

## InstalaÃ§Ã£o / prÃ©-requisitos

Este repositÃ³rio nÃ£o precisa de `npm install` nem build â€” Ã© composto de
skills (markdown) + um script Node standalone. O que precisa estar pronto
**fora** dele:

1. **Claude Code com acesso ao navegador.** Nesta configuraÃ§Ã£o (Linux/ARM64,
   Chromium via snap), a extensÃ£o sÃ³ Ã© reconhecida iniciando com a flag:
   ```bash
   claude --chrome
   ```
   Sem isso as tools de navegador nÃ£o conectam â€” ver detalhes e workarounds
   em [`docs/setup-linux-navegador.md`](docs/setup-linux-navegador.md).

2. **Conta HeyGen logada** no navegador usado pela extensÃ£o, com o avatar
   **"Nei Maldaner"**, voz **"INEMA TIME"** e motor **Avatar III** (o Ãºnico
   ilimitado na assinatura â€” Avatar IV/V sÃ£o Premium e cobram por render).

3. **`inemaccvbot` + `mkivideos` no ar** (o worker que efetivamente monta o
   reel):
   ```bash
   pgrep -af 'dist/cli.js run'          # confere se os workers do mkivideos estÃ£o de pÃ©
   curl -s localhost:3142/api/stats     # ping na fila antes de enfileirar
   ```

4. **Pastas de canal por pÃºblico** (`~/projetos/yt-pub-lives21` a `31`, uma
   por pÃºblico â€” ver tabela abaixo). Se faltar alguma na hora de enfileirar,
   a fase 3 cria o mÃ­nimo `imports/videos/` para nÃ£o travar o job, mas a
   configuraÃ§Ã£o do canal em si (credenciais/YouTube) Ã© feita pelo operador:
   ```bash
   mkdir -p ~/projetos/yt-pub-lives21/imports/videos
   ```

5. **Chave da API HeyGen** (usada sÃ³ na fase 2.5, para baixar renders sem
   custo, via `scripts/list-videos.mjs`) â€” nunca fica neste repo; Ã© lida de
   um `.env` externo:
   ```bash
   export HEYGEN_ENV_PATH=~/.config/heygen/.env   # arquivo com HEYGEN_API_KEY=...
   node scripts/list-videos.mjs --title "<assunto>"
   ```

## As 4 fases do pipeline

Cada fase Ã© pedida ao Claude Code em linguagem natural (ou pelo nome da
skill); nÃ£o sÃ£o comandos de shell separados.

### Fase 1 â€” Textos (`inemaclub-textos`)

Um assunto vira **3 versÃµes de roteiro falado** (~35-40s cada) por pÃºblico â€”
mesmo conteÃºdo, gancho/linguagem/exemplo diferentes. Sai em
`textos/<slug-do-assunto>/<publico>.md`, com seÃ§Ãµes `FALA` (o que o avatar
vai falar), `SOBREPOSIÃ‡Ã•ES` (cards/legendas do reel) e `ESTRUTURA`.

```
/inemaclub-textos "assunto da campanha"
```

Se nÃ£o disser os pÃºblicos, o default Ã© `pessoa-comum`; "todos" gera para os
11.

### Fase 2 â€” Avatar no HeyGen (`heygen-avatar-nei-III`)

Pega a seÃ§Ã£o `FALA` do roteiro escolhido e gera o vÃ­deo de avatar **sempre
pelo navegador** (nunca API â€” API tem custo por render e sÃ³ Ã© usada com
pedido explÃ­cito). TÃ­tulo padronizado `<assunto>-<publico>-v<versÃ£o>`, saÃ­da
16:9 1080p sem marca d'Ã¡gua, com um **look diferente por pÃºblico** (tabela
de slugs na skill â€” nunca `avatar_id`/`voice_id` em arquivo).

```
Use a skill heygen-avatar-nei-III para o assunto "<slug>"
```

**AutomÃ¡tica, via `/promoclub` do inemaccvbot**: o bot dispara a fase 1 e,
assim que ela termina, emenda a fase 2 sozinho (`claude --chrome -p`) â€”
sem precisar pedir de novo. Ver [Fase 2 e o navegador](#fase-2-e-o-navegador-requisitos-e-automaÃ§Ã£o)
para os requisitos e o que fazer quando ela travar. Chamar a skill acima
diretamente (como no exemplo) continua funcionando pra rodar a fase 2 na
mÃ£o, fora do bot.

### Fase 2.5 â€” Download (`heygen-download-nei`)

Baixar nÃ£o gasta crÃ©dito, entÃ£o usa API quando possÃ­vel (rota A, via
`scripts/list-videos.mjs` + `deliver.mjs --no-send`) e cai para o navegador
(rota B) se o vÃ­deo nÃ£o aparecer na API. Deixa o MP4 pronto em
`output/<assunto>/avatares/<assunto>-<publico>-v<versÃ£o>.mp4`.

```
Use a skill heygen-download-nei para o assunto "<slug>"
```

### Fase 3 â€” Reel (`inemaclub-reel`)

Enfileira cada avatar no `mkivideos`, em **modo "capa de impacto"**: topo com
headline-choque (o gatilho do pÃºblico) + imagem trocando, meio com o avatar,
base com o explicativo, legenda palavra-a-palavra e CTA fixo. Destino:
`yt-pub-lives<N>/imports/videos` do pÃºblico.

```
Use a skill inemaclub-reel para o assunto "<slug>"
```

Sintaxe direta na fila (o que o bot faz por trÃ¡s):
```bash
cd ~/projetos/mkivideos && node dist/cli.js add reel \
  "<path-do-avatar>.mp4 | capa impacto | headline-gancho: <GATILHO> | palavra-chave Ã¢mbar: <X> | CTA fixo: Saiba mais no inema.club" \
  --pasta ~/projetos/yt-pub-lives<N>/imports/videos
```

### Fase 4 â€” PublicaÃ§Ã£o (automÃ¡tica)

Nenhuma aÃ§Ã£o aqui: o pipeline `yt-pub-livesN` de cada pÃºblico monitora a
pasta de import, publica no YouTube e o bot avisa no Telegram quando termina.

## PÃºblicos e canais

| slug | pÃºblico | lives (canal) |
|---|---|---|
| `pessoa-comum` | Pessoa comum / leigo | lives21 |
| `jovens` | Jovens | lives22 |
| `profissionais` | Profissionais | lives23 |
| `mulheres` | Mulheres | lives24 |
| `empreendedores` | Empreendedores | lives25 |
| `tecnicos` | TÃ©cnicos | lives26 |
| `40mais` | 40+ | lives27 |
| `60mais` | 60+ e aposentados | lives28 |
| `educadores` | Professores e educadores | lives29 |
| `criadores` | Criadores de conteÃºdo | lives30 |
| `recolocacao` | RecolocaÃ§Ã£o / transiÃ§Ã£o de carreira | lives31 |

Gatilho/promessa de cada pÃºblico (usado como gancho da fase 1 e headline da
capa de impacto na fase 3) estÃ¡ na tabela completa da skill
`inemaclub-textos`.

## Estrutura de pastas

```
inemapromover/
â”œâ”€â”€ CLAUDE.md              # documentaÃ§Ã£o canÃ´nica do pipeline (para o Claude Code)
â”œâ”€â”€ README.md              # este arquivo
â”œâ”€â”€ .claude/skills/        # as 4 skills do pipeline (fases 1, 2, 2.5, 3)
â”œâ”€â”€ scripts/
â”‚   â””â”€â”€ list-videos.mjs    # lista vÃ­deos prontos no HeyGen via API (fase 2.5, rota A)
â”œâ”€â”€ docs/
â”‚   â””â”€â”€ setup-linux-navegador.md   # liÃ§Ãµes de setup do navegador em Linux/ARM64
â”œâ”€â”€ textos/                # saÃ­da da fase 1 (roteiros por assunto/pÃºblico)
â”œâ”€â”€ output/                # saÃ­da da fase 2.5 (avatares baixados) â€” fora do git
â”œâ”€â”€ state/                 # estado de execuÃ§Ã£o por assunto (jobs, status) â€” fora do git
â””â”€â”€ guia/                  # landing + guia de uso publicado em GitHub Pages
```

`output/` e `state/` ficam fora do controle de versÃ£o (vÃ­deos sÃ£o grandes e
regenerÃ¡veis; o estado de execuÃ§Ã£o Ã© dado de runtime, nÃ£o cÃ³digo).

### Mapa: onde cada arquivo mora, do avatar ao canal

O avatar e o reel **nÃ£o moram neste repositÃ³rio** â€” sÃ³ os textos/estado do
pipeline moram aqui. Os binÃ¡rios (vÃ­deo) vivem nos projetos que efetivamente
renderizam:

```
1. AVATAR (fase 2, HeyGen)
   gerado em: HeyGen "Meus Projetos" (nuvem, tÃ­tulo <assunto>-<publico>-v<versÃ£o>)
        â”‚
        â–¼ fase 2.5 (heygen-download-nei / watcher automÃ¡tico do inemaccvbot)
   baixado em: inemapromover/output/<assunto>/avatares/<titulo>.mp4

2. REEL (fase 3, mkivideos)
   renderizado em: ~/projetos/mkivideos/renders/mkivideo-<jobId>-16.mp4
   (MKIVIDEOS_RENDER_DIR do mkivideos â€” precisa ser ABSOLUTO, ver aviso abaixo)
        â”‚
        â–¼ watcher do inemaccvbot (applyReelDest, a partir do result_path do job)
   copiado para: ~/projetos/yt-pub-lives<N>/imports/videos/mkivideo-<jobId>-16.mp4
   (cÃ³pia por padrÃ£o â€” o original fica em renders/; sÃ³ apaga se o job pedir "mover")

3. PUBLICAÃ‡ÃƒO (fase 4, automÃ¡tica â€” fora deste pipeline)
   yt-pub-lives<N>/imports/videos/ â†’ pipeline yt-pub-livesN â†’ canal YouTube do pÃºblico
```

> âš ï¸ **O mkivideos sÃ³ deve subir via `systemctl --user restart mkivideos.service`,
> nunca `nohup`/`node dist/cli.js` cru.** O unit systemd define `MKIVIDEOS_RENDER_DIR`
> absoluto; sem ele o worker grava `result_path` relativo no banco â€” ele mesmo resolve
> esse caminho (mesmo cwd), mas o watcher do `inemaccvbot` nÃ£o (cwd diferente), e a
> cÃ³pia pro `yt-pub-lives<N>` falha com `ENOENT` mesmo com o `.mp4` intacto em
> `renders/`. **Incidente real (2026-07-19)**: exatamente isso aconteceu com 5 reels em
> sequÃªncia (jobs #120â€“124) depois de um restart manual via `nohup` â€” corrigido
> voltando ao restart via systemd; os 5 arquivos foram recuperados e copiados na mÃ£o
> (estavam intactos, sÃ³ nÃ£o tinham sido entregues). Detalhes tÃ©cnicos completos nos
> READMEs de [`mkivideos`](https://github.com/inematds/mkivideos#readme) e
> [`inemaccvbot`](https://github.com/inematds/inemaccvbot#readme) (seÃ§Ã£o 7.1).

## Dicas e pontos de atenÃ§Ã£o

- **Navegador em Linux/ARM64 Ã© a parte mais frÃ¡gil do pipeline.** Sem
  `claude --chrome`, a extensÃ£o simplesmente nÃ£o conecta. Se as abas criadas
  ficam "invisÃ­veis" (`document.visibilityState === 'hidden'`) ou os
  screenshots vÃªm em branco, normalmente Ã© porque hÃ¡ mais de um navegador
  pareado com a extensÃ£o â€” usar `list_connected_browsers` + `select_browser`
  para escolher o certo. Detalhes completos em
  [`docs/setup-linux-navegador.md`](docs/setup-linux-navegador.md).
- **O manifesto de pareamento (native messaging) precisa existir na pasta
  certa do navegador.** Com Chromium instalado via **snap**, o Claude Code
  costuma gravar o manifesto em `~/.config/chromium/NativeMessagingHosts/`,
  mas o Chromium snap sÃ³ lÃª `~/snap/chromium/common/chromium/NativeMessagingHosts/`
  â€” se a extensÃ£o nunca conectar mesmo com `--chrome`, copiar o arquivo
  `com.anthropic.claude_code_browser_extension.json` pra essa segunda pasta
  resolve.
- **Confira os defaults do editor HeyGen a cada navegador novo.** JÃ¡
  aconteceu de abrir com avatar "Annie" / voz "Annie - Lifelike" / motor
  Avatar IV (Premium!) em vez do padrÃ£o do estÃºdio â€” sempre trocar para o
  look do pÃºblico (tabela da skill) / INEMA TIME / Avatar III antes de gerar.
- **Renders de avatar tÃªm custo/tempo** â€” a fase 2 nunca gera as 3 versÃµes
  de um pÃºblico de uma vez sem pedido explÃ­cito, e nunca usa a rota API
  (sÃ³ a rota navegador, sem custo por estar na assinatura).
- **Ping na fila antes de enfileirar** (`GET :3142/api/stats`) â€” se o daemon
  do mkivideos estiver fora, a fase 3 avisa e nÃ£o enfileira, em vez de
  falhar silenciosamente.
- **Canais `yt-pub-lives21..31` podem nÃ£o existir ainda.** A fase 3 cria o
  mÃ­nimo (`imports/videos/`) para nÃ£o travar o job, mas isso nÃ£o configura o
  canal â€” a configuraÃ§Ã£o real (credenciais do YouTube) Ã© responsabilidade do
  operador.

### Fase 2 e o navegador: requisitos e automaÃ§Ã£o

A fase 2 Ã© a parte mais sensÃ­vel do pipeline porque depende de um Chromium
**de verdade** (nÃ£o headless) controlado pela extensÃ£o. Pontos validados em
produÃ§Ã£o (2026-07-19):

- **A aba do HeyGen sÃ³ aceita digitaÃ§Ã£o quando Ã© a aba ATIVA de uma janela em
  primeiro plano** (`document.visibilityState === 'visible'`) â€” `visibilityState`
  Ã© POR ABA, nÃ£o por janela. O editor tiptap do HeyGen nÃ£o sincroniza digitaÃ§Ã£o
  numa aba oculta, e a skill se recusa a gerar nesse estado (reporta o bloqueio
  em vez de fingir sucesso). Causa nÂº1 de a fase 2 travar em "0 vÃ­deos".
- **`wmctrl` NÃƒO resolve de forma confiÃ¡vel.** Testado: o `wmctrl -a Chromium`
  mexe na *janela*, nÃ£o na *aba*, e ainda por cima o GNOME/mutter ignora o pedido
  de ativaÃ§Ã£o (focus-stealing prevention) â€” a janela nem vem pra frente. Dois
  furos somam: (a) a automaÃ§Ã£o abria uma **aba nova** (nasce `hidden`) e (b) a
  janela nÃ£o fica focada por comando.
- **OpÃ§Ã£o A (fix atual) â€” automÃ¡tico reusando a aba aberta.** A skill
  `heygen-avatar-nei-III` foi ajustada pra **REUSAR a aba do HeyGen jÃ¡ aberta e
  ativÃ¡-la**, nunca abrir aba nova, e trabalhar sÃ³ nela. Com a janela do Chromium
  em primeiro plano, a fase 2 automÃ¡tica funciona (foi assim que saiu o 1Âº lote
  11/11). LimitaÃ§Ã£o: ainda depende de a janela nÃ£o perder o foco enquanto digita.
- **OpÃ§Ã£o B (plano) â€” Chromium dedicado em Xvfb.** Display virtual `:99` com WM
  mÃ­nimo, uma janela Ãºnica e uma aba sÃ³ â€” sempre focada/ativa, `visible` de forma
  confiÃ¡vel, isolado do desktop real. O bot aponta a fase 2 pra esse display e
  seleciona esse navegador. **EstratÃ©gia: rodar com a A agora; montar a B e,
  quando validada, desativar a A** (B vira o caminho automÃ¡tico; A vira backup
  manual). Instalar Xvfb/WM/x11vnc exige `sudo` (feito pelo operador).
- **"SessÃ£o desconectada" (RDP fechado sem logout) â‰  "nada rodando".** Com xrdp,
  o Xorg + Chromium continuam de pÃ© mesmo com o cliente RDP fechado â€” sÃ³ um
  **logout** encerra a sessÃ£o.
- **VerificaÃ§Ã£o real, nÃ£o confianÃ§a cega no subagente.** JÃ¡ aconteceu (produÃ§Ã£o)
  do `claude --chrome -p` **reportar sucesso sem ter controlado o navegador** â€” um
  falso positivo. Por isso a automaÃ§Ã£o sempre confere na API do HeyGen se os
  tÃ­tulos realmente apareceram antes de dizer "concluÃ­do".

**Numa mÃ¡quina sem ambiente grÃ¡fico nenhum** (nem virtual), o esquema nÃ£o roda â€”
a extensÃ£o precisa de um Chromium real. Ã‰ exatamente o caso da OpÃ§Ã£o B (Xvfb)
acima. Alternativa: **rota de API/crÃ©dito** (`heygen-cli`) â€” nÃ£o precisa de
navegador, mas **gasta crÃ©dito por render** (hoje evitado de propÃ³sito, ver
Regras duras).

## Regras duras

- **IDs de avatar/voz do HeyGen nunca em arquivo deste repo.** Moram em
  `~/.config/heygen/looks.json` ou na sessÃ£o logada do navegador â€” sÃ³ slugs
  legÃ­veis (ex.: "Nei Maldaner") aparecem em texto.
- **Render de avatar sÃ³ pelo navegador** (uso incluÃ­do na assinatura); a
  rota de API/CLI existe sÃ³ como emergÃªncia documentada, nunca por padrÃ£o.
- **Posicionamento de marca**: sempre "uma das plataformas gratuitas de
  formaÃ§Ã£o prÃ¡tica em IA mais completas do Brasil" â€” nunca "a Ãºnica".
  Frase-mÃ£e: *"NÃ£o importa sua idade ou profissÃ£o. Existe uma trilha de IA
  para vocÃª no INEMA.club."*

## Roadmap

- ~~Look por pÃºblico~~ âœ” feito (2026-07-19) â€” cada pÃºblico tem seu look
  (tabela na skill `heygen-avatar-nei-III`), sÃ³ slugs, sem `avatar_id`.
- ~~Fase 2 automÃ¡tica (disparo)~~ âœ” feito (2026-07-19) â€” `/promoclub` do
  `inemaccvbot` dispara a fase 2 sozinha apÃ³s a fase 1, com verificaÃ§Ã£o real
  na API do HeyGen antes de declarar sucesso.
- **Fase 2 confiÃ¡vel (aba `visible`).** â³ em andamento â€” OpÃ§Ã£o A (reusar a aba
  aberta, feito) funciona com a janela em foco; OpÃ§Ã£o B (Chromium dedicado em
  Xvfb) Ã© o plano pra tornar 100% automÃ¡tico sem depender de foco. Ver
  [Fase 2 e o navegador](#fase-2-e-o-navegador-requisitos-e-automaÃ§Ã£o).
- **Sintaxe da capa de impacto.** Refinar como o gatilho do pÃºblico vira
  headline e como as sobreposiÃ§Ãµes da fase 1 entram automaticamente no job
  da fase 3.
- **MÃ¡quina sem ambiente grÃ¡fico.** Hoje a fase 2 depende de um Chromium
  real (com display X, real ou virtual). Se for preciso rodar numa mÃ¡quina
  totalmente headless, falta decidir entre Xvfb (mantÃ©m a rota gratuita) ou
  a rota de API paga â€” ver [Fase 2 e o navegador](#fase-2-e-o-navegador-requisitos-e-automaÃ§Ã£o).

---

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="32" />
  <p><strong>Arckhé AI</strong></p>
</div>