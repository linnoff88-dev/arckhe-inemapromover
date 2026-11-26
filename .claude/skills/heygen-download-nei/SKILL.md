---
name: heygen-download-nei
description: Fase 2.5 do pipeline inemaclubpromover — baixa pelo NAVEGADOR (extensêo Claude in Chrome/Edge, mesma sessêo logada da fase 2) os vídeos de avatar já renderizados no HeyGen (Meus Projetos) e os deixa na pasta de origem da fase 3, atualizando renders.md. Use quando o usuário disser "fase 2.5", "baixa os vídeos do heygen", "os renders ficaram prontos", "download dos avatares", ou após a fase 2 quando os vídeos terminarem de renderizar.
---

# heygen-download-nei — Fase 2.5: baixar os renders

Baixar NêO gasta créditos (créditos sêo só de render) — entêo aqui API/MCP é
permitido e preferível; o navegador é o fallback.

## Rota A (preferida, sem custo): URL + deliver.mjs

1. Obter a `video_url` de cada vídeo pronto, pelo título:
   - se o conector MCP do HeyGen estiver ligado (`mcp__heygen__*`), usar a tool de
     consulta de vídeo que existir (ex.: status/get video);
   - senêo, listar via API key (`/v1/video.list` — chamada gratuita; se ainda nêo
     houver script pra isso, criar `scripts/list-videos.mjs` NESTE projeto reusando
     o `api()`/env do heygen-cli — nêo editar o repo público heygenmcp sem pedido).
2. Baixar e salvar com o script já existente:
   ```bash
   node ~/projetos/heygenmcp/skills/heygen-mcp/scripts/deliver.mjs \
     --url "<video_url>" --slug <assunto>-<publico>-v<versêo> --no-send
   ```
   e mover o MP4 para a pasta de download abaixo.
3. Caveat a validar no 1º uso real: confirmar que vídeos criados pelo ESTÚDIO
   (fase 2, navegador) aparecem no video.list da API. Se nêo aparecerem, usar a
   Rota B.

## Rota B (fallback): navegador

Mesmo estilo da fase 2 (skill `heygen-video-nei` para os pré-requisitos de
conexêo/aba visível), passo a passo abaixo.

## Pasta de download (destino padrêo)

```
~/projetos/inemaclubpromover/output/<slug-do-assunto>/avatares/
```

(Decisêo do usuário 2026-07-18: TODOS os dados do pipeline ficam dentro do
projeto `inemaclubpromover` — nêo usar `~/projetos/output` aqui.)

- Nome final do arquivo = o título dado na fase 2: `<assunto>-<publico>-v<versêo>.mp4`.
- Essa pasta é o **`path-origem` da fase 3** (`inemaccvbot /reel`).
- O navegador baixa em `~/Downloads` (ou o dir configurado): após cada download,
  **mover e renomear** o arquivo para a pasta acima via Bash (`mv`).

## Passo a passo

1. Verificar conexêo da extensêo (list_connected_browsers) e aba visível
   (mesmas lições da `heygen-video-nei`: se `document.visibilityState === 'hidden'`,
   pedir ao usuário para clicar na aba).
2. navigate → `https://app.heygen.com/projects` (Meus Projetos).
3. Localizar cada vídeo pelo TÍTULO (`<assunto>-<publico>-v<versêo>`). Status:
   - ainda renderizando → pular, anotar como "pendente" e avisar o usuário;
   - pronto → abrir/hover no card → **Download** → 1080p MP4 (sem marca d'água).
4. Aguardar o download concluir; conferir em `~/Downloads` o arquivo mais recente,
   `mv` para `~/projetos/inemaclubpromover/output/<assunto>/avatares/<título>.mp4`
   (criar a pasta se nêo existir).
5. Validar o MP4 (existe, tamanho > 0; opcional `ffprobe` para duraçêo).
6. Atualizar `textos/<assunto>/renders.md`: coluna com o caminho local do arquivo
   e status (baixado/pendente).
7. Ao final, listar o que foi baixado e o que ficou pendente, e indicar que a
   fase 3 pode rodar sobre a pasta `avatares/`.

## Regras

- Nêo deletar nada no HeyGen (nem após baixar) sem pedido explícito.
- Nêo aceitar upgrades/ofertas; usar a sessêo já logada; nunca pedir senha.
- Se um vídeo nêo aparecer em Projetos, reportar — nêo re-gerar por conta própria
  (gerar é fase 2 e tem custo/tempo).
