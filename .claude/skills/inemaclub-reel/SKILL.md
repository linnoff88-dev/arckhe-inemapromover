---
name: inemaclub-reel
description: Fase 3 do pipeline inemaclubpromover — pega os avatares baixados na fase 2.5 (output/inemaclubpromover/<assunto>/avatares/*.mp4) e enfileira cada um no sistema inemaccvbot/mkivideos como "reel ... modo capa impacto" (skill reel-edita-inema), com destino no CANAL livesN do público correspondente (yt-pub-livesN/imports/videos). Use quando o usuário disser "fase 3", "gera os reels", "manda pros lives", "enfileira os reels", ou após a fase 2.5 concluir os downloads.
---

# inemaclub-reel — Fase 3: avatar → reel → canal do público

O render do reel é do sistema existente: **inemaccvbot** (`~/projetos/inemaccvbot`,
cliente fino) → fila **mkivideos** (`~/projetos/mkivideos`, daemon systemd
`mkivideos.service`, dashboard :3142) → skill **`reel-edita-inema`** (modo CAPA DE
IMPACTO: topo com headline-choque + imagem trocando, meio avatar, legenda
palavra-a-palavra, CTA inema.club). O destino `livesN` resolve para
`~/projetos/yt-pub-lives<N>/imports/videos` — a pasta de import do pipeline
yt-pub-livesx, que dali publica no canal do YouTube daquele lives (fase 4 é
automática do lives). Cada público tem seu canal.

## Mapeamento público → lives (canal)

Faixa reservada pelo usuário (2026-07-18): **lives21 a lives31**, na ordem da
tabela — 11 vagas, uma por público.

| slug do público | lives (destino) |
|---|---|
| pessoa-comum | lives21 |
| jovens | lives22 |
| profissionais | lives23 |
| mulheres | lives24 |
| empreendedores | lives25 |
| tecnicos | lives26 |
| 40mais | lives27 |
| 60mais | lives28 |
| educadores | lives29 |
| criadores | lives30 |
| recolocacao | lives31 |

**Atenção — pastas faltantes:** hoje só existem `yt-pub-lives1..13` no disco;
**lives21 a lives31 ainda não existem** e o bot RECUSA destino inexistente
(`resolveDest`). Antes do 1º uso, criar/clonar as pastas `yt-pub-lives21..31`
(pelo padrão do yt-pub-livesx, cada uma configurada com o canal YouTube do
respectivo público) — a CONFIGURAÇÃO do canal é setup do usuário/livesx. Se um
destino não existir na hora de enfileirar: o usuário já autorizou (2026-07-18)
criar o MÍNIMO `~/projetos/yt-pub-lives<N>/imports/videos/` (mkdir -p) só pra
receber o arquivo — criar, avisar que foi criado sem configuração de canal, e
seguir; a config do pipeline daquele lives continua pendente com o usuário.

## Entrada

`~/projetos/inemaclubpromover/output/<assunto>/avatares/<assunto>-<publico>-v<versão>.mp4`
(da fase 2.5; o público vem do nome do arquivo). Cruzar com `textos/<assunto>/renders.md`.

## Enfileirar

Instrução no formato do bot, uma por vídeo:

```
reel: /home/nmaldaner/projetos/output/inemaclubpromover/<assunto>/avatares/<arquivo>.mp4 | lives<N> | capa impacto
```

- **Via Telegram** (preferido quando o usuário estiver operando): ele manda a linha
  no chat do `@inemaccvbot`, que valida a skill em `config/skills.json`, enfileira
  no mkivideos e avisa quando pronto.
- **Direto na fila** (quando o agente estiver executando): usar o CLI `mkivideos add`
  com a skill `reel` e o dest resolvido — replicando o que o bot faria; conferir a
  sintaxe exata em `~/projetos/mkivideos` no 1º uso real.
- Antes de enfileirar: `ping` nas filas (GET :3142/api/stats) — se o daemon estiver
  fora, avisar e não enfileirar.
- **Sintaxe validada no 1º uso real (2026-07-18, job #109)** — CLI direto:
  ```
  cd ~/projetos/mkivideos && node dist/cli.js add reel \
    "<path-do-avatar>.mp4 | capa impacto | headline-gancho: <GATILHO> | cards mecânica: <A → B → C> | palavra-chave âmbar: <X> | público: <desc> | CTA fixo: Saiba mais no inema.club" \
    --pasta /home/nmaldaner/projetos/yt-pub-lives<N>/imports/videos
  ```
  O input do `reel` é texto livre (path + instruções, separadas por `|`); "capa
  impacto" vai como palavra-chave no texto e o destino é `--pasta` (dir absoluto).
  Daemon: porta 3142, token do dashboard em `deploy/mkivideos.service`
  (`/api/stats?token=...`). Status: `node dist/cli.js status <id>`.

## Personalização por público no reel

A capa de impacto deve usar o GATILHO do público (tabela da skill
`inemaclub-textos`) como headline-choque do topo, e as SOBREPOSIÇÕES do arquivo
`textos/<assunto>/<publico>.md` (cards nota 6→7,5→9 etc.). Passar esse contexto no
job quando o formato da instrução permitir (validar no 1º uso).

## Saída

- MP4 final 9:16 em `yt-pub-lives<N>/imports/videos/` → o pipeline do lives publica
  no canal do público (fase 4).
- Atualizar `textos/<assunto>/renders.md`: público → lives → status do job.

## Não fazer

- Não renderizar o reel manualmente aqui (o dono do render é o mkivideos).
- Não criar/alterar pastas yt-pub-lives* nem publicar direto no YouTube.
- Não enfileirar sem confirmar com o usuário a lista (vídeo × lives) quando for lote.
