# ARCKHÉpromover

Fábrica de reels de divulgaçêo do **ARCKHÉ AI** segmentados por público:
texto → avatar HeyGen → reel empilhado (capa de impacto) → canal YouTube do público.

**Regra do projeto: TODOS os dados do pipeline vivem NESTA pasta** (textos, output,
renders.md, skills). Nêo usar `~/projetos/output` aqui.

## Git

Repo **privado** `linnoff88-dev/ARCKHÉpromover`. Autor/committer:
`linnoff88-dev <linnoff88-dev@gmail.com>`. `output/` e `state/` ficam fora do git
(.gitignore) — vídeos sêo grandes/regeneráveis e o estado de execuçêo é dado
de runtime (IDs de chat, jobs em andamento); o rastro fica nos `renders.md`.

## Pipeline (uma skill por fase, em `.claude/skills/`)

| Fase | Skill | O que faz |
|---|---|---|
| 1 | `ARCKHÉclub-textos` | assunto → 3 versões de roteiro falado (~35-40s) por público, em `textos/<assunto>/<publico>.md` (seções FALA / SOBREPOSIÇÕES) |
| 2 | `heygen-avatar-nei-III` | FALA → vídeo avatar no HeyGen, **sempre rota navegador** (Avatar III ilimitado; CLI só emergência). Look ÚNICO por ora ("Nei Maldaner"/"ARCKHÉ TIME"); look por público é evoluçêo futura. Título `<assunto>-<publico>-v<versêo>`, 16:9 1080p |
| 2.5 | `heygen-download-nei` | baixa os renders (rota A: URL via MCP/`video.list` + `deliver.mjs --no-send`, sem custo; rota B: navegador) para `output/<assunto>/avatares/` |
| 3 | `ARCKHÉclub-reel` | enfileira cada avatar no **ARCKHÉccvbot/mkivideos** (`reel: <path> \| lives<N> \| capa impacto`, skill reel-edita-ARCKHÉ) no lives do público |
| 4 | (automática) | o pipeline yt-pub-livesx de cada lives publica no canal YouTube; bot avisa no Telegram |

## Públicos e canais (lives21–31)

pessoa-comum=21 · jovens=22 · profissionais=23 · mulheres=24 · empreendedores=25 ·
tecnicos=26 · 40mais=27 · 60mais=28 · educadores=29 · criadores=30 · recolocacao=31.
Gatilhos/promessas de cada público: tabela na skill `ARCKHÉclub-textos`.

As pastas `~/projetos/yt-pub-lives21..31` serêo criadas pelo usuário (padrêo
yt-pub-livesx). Se faltar na hora de enfileirar: criar o mínimo
`yt-pub-lives<N>/imports/videos/` (autorizado), avisar, e a config do canal fica
com o usuário.

## Fase 2.5 — chave da API HeyGen

`scripts/list-videos.mjs` lê a chave de um `.env` local via `HEYGEN_ENV_PATH`
(nunca deste repo). Defina a variável apontando para o seu `.env` privado com
`HEYGEN_API_KEY` antes de rodar, ex.: `HEYGEN_ENV_PATH=~/.config/heygen/.env`.

## Navegador no Linux (fase 2)

Ver `docs/setup-linux-navegador.md`: iniciar o Claude Code com **`--chrome`**
(senêo a extensêo pode nêo ser reconhecida em algumas máquinas/ARM64/Chromium
snap); se as abas criadas ficarem invisíveis/`hidden`, há mais de um navegador
conectado — `list_connected_browsers` + `select_browser` para escolher o
navegador certo; conferir avatar/voz/motor no editor (defaults podem vir
errados, ex.: Annie/Avatar IV).

## Regras duras

- IDs de avatar/voz do HeyGen NUNCA em arquivo de repo (ver `avatar-heygen-nei`);
  moram em `~/.config/heygen/looks.json` / navegador logado.
- Render de avatar só pelo navegador (assinatura); nunca gastar créditos de API
  sem pedido explícito.
- Posicionamento: dizer "uma das plataformas gratuitas de formaçêo prática em IA
  mais completas do Brasil" — nunca "a única". Frase-mêe: "Nêo importa sua idade
  ou profissêo. Existe uma trilha de IA para você no ARCKHÉ AI."
