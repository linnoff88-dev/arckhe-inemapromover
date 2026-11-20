# GOAL — Opção B: fase 2 100% automática via Chromium dedicado (Xvfb)

> Prompt pronto pra colar numa sessão nova do Claude Code (`claude` normal, no
> diretório `~/projetos/inemaclubpromover`). Auto-contido: não depende do
> histórico de nenhuma conversa anterior.

---

## OBJETIVO

Tornar a fase 2 do pipeline inemaclubpromover (render de avatares no HeyGen via
navegador) **100% automática e confiável**, usando um Chromium dedicado num
display virtual (Opção B), **sem depender de janela em foco no desktop do
usuário** e **sem gastar créditos de API** (rota navegador/assinatura apenas).

## CRITÉRIO DE SUCESSO (mensurável — só declare sucesso com TODOS atendidos)

1. **Estabilidade de arranque:** 3 lançamentos consecutivos da stack `:99`
   (script/units) em que a janela do Chromium MAPEIA e RENDERIZA (screenshot via
   `DISPLAY=:99 ffmpeg -f x11grab` mostra a página, não tela preta).
2. **Visibilidade comprovada:** com a página de teste
   `~/snap/chromium/common/vistest.html` (escreve o estado no título), o título
   da janela mostra `VIS_visible` de forma estável.
3. **Prova real de ponta a ponta:** UMA rodada real de fase 2 (disparada pelo
   bot `/promoclub` ou pelo runner equivalente `claude --chrome -p`) gera
   **11/11 vídeos confirmados pela API do HeyGen** (`/v1/video.list`, chave em
   `~/projetos/openpcbot/.env` → `HEYGEN_API_KEY`) **sem nenhuma intervenção
   humana** durante a execução.
4. **Persistência:** a stack `:99` sobe via systemd user units (sobrevive a
   logout/reboot) e o resultado 1-2 se mantém após um restart da stack.

## LIMITES (orçamento duro — estourou, PARE)

- **Tempo total: 3 horas de relógio** OU **4 rodadas reais de fase 2**, o que
  vier primeiro.
- **Cada experimento de infra: máx 20 minutos.** 2 falhas seguidas da MESMA
  hipótese → abandone a hipótese e passe pra próxima.
- **Máx 1 mudança de código** no `inemaccvbot` (se necessária), com
  `npm run build && npm test` passando (249+ testes).
- Ao **estourar o limite sem sucesso**: (a) restaurar a Opção A como operacional
  (derrubar/neutralizar o `:99` pra não competir com o Chromium do desktop),
  (b) escrever postmortem na seção 7 de `docs/setup-linux-navegador.md` com o
  que foi tentado e por que falhou, (c) commitar e (d) PARAR — recomendar
  formalmente A (semi-automática) ou API paga como alternativas.

## FATOS JÁ VALIDADOS EM PRODUÇÃO (2026-07-19 — não redescobrir, aproveitar)

- A extensão Claude **funciona headless** no `:99` (conectou de verdade).
- O **auto-select do navegador** local/Linux funciona (prompt da fase 2 já
  instrui; código em `~/projetos/inemaccvbot/src/promoclub.ts`).
- **Perfil copiado** (`~/snap/chromium/common/chromium` →
  `.../chromium-xvfb`) carrega extensão (v1.0.81) + login HeyGen juntos.
  A Chrome Web Store **recusa** instalar a extensão em Chromium — só a cópia
  de perfil funciona.
- Modo `--app` **renderizou perfeito uma vez** (janela única, sem barra de
  abas) — promissor.
- **Problema nº1: mapeamento de janela intermitente no Xvfb** — ~2/3 dos
  lançamentos ficam em tela preta (processo vivo, janela não mapeia; `xwininfo
  -root -children` mostra só o Openbox). É O bug a resolver.
- **Problema nº2: o editor do HeyGen abre em aba/janela de fundo** → nasce
  `visibilityState === 'hidden'` e o editor tiptap não aceita digitação. A
  skill `heygen-avatar-nei-III` já instrui reusar/ativar a aba — validar que
  obedece.
- `wmctrl` é inútil (mutter ignora no desktop; desnecessário no `:99`).
- Stack atual: `Xvfb :99 -screen 0 1920x1080x24` + `openbox` + `x11vnc`
  (`localhost:5900`) + chromium snap com
  `--user-data-dir=$HOME/snap/chromium/common/chromium-xvfb`. Script de reset:
  `~/reset99.sh`.

## HIPÓTESES PRIORIZADAS (nesta ordem, cada uma com timebox)

1. **Estabilizar o mapeamento (20-40 min):** diagnosticar a tela preta —
   `/tmp/chromium99*.log`, testar SEM WM nenhum, testar `--ozone-platform=x11`
   explícito, variar depth/resolução (24→16 bpp), remover `--start-maximized`,
   aumentar espera de arranque, testar ordem Xvfb→sleep→WM→sleep→chromium.
   Validar cada mudança com o vistest + screenshot 3x seguidas.
2. **App mode como padrão:** relançar sempre com
   `--app="https://app.heygen.com/projects"` (janela única). Verificar como o
   fluxo da skill se comporta sem tab strip (o editor abre onde?).
3. **Disciplina de abas na skill:** se multi-tab for inevitável, reforçar na
   skill que após QUALQUER navegação/abertura o passo imediato é ATIVAR a aba
   do editor (e fechar abas extras), verificando `visibilityState` antes de
   digitar.
4. **Fallbacks exóticos** (só se sobrar orçamento): outro WM leve disponível,
   Xephyr aninhado no `:10`, ou `Emulation.setFocusEmulationEnabled` via CDP se
   houver acesso.

## REGRAS DURAS (invioláveis)

- **NUNCA** escrever `avatar_id`/`voice_id`/API key em arquivo de repo (IDs
  moram só em `~/.config/heygen/looks.json`).
- **NUNCA** usar a rota de API paga do HeyGen pra renderizar (só a
  `video.list`, gratuita, pra VERIFICAR).
- **Antes de reiniciar o bot (`inemaccvbot.service`) ou os workers, SEMPRE
  conferir que não há fase 1/2 rodando** (`ps -eo args | grep -E 'claude
  (--chrome )?-p'`) nem job na fila (`:3142/api/stats?token=inemadash`).
  Já matamos um run por pular essa checagem.
- State files (`state/*.json`): renomear com sufixo `.bak-*`, nunca apagar.
- Git: autor `inematds <inematds@gmail.com>`; commitar mudanças de skill/doc
  nos DOIS repos (`inemaclubpromover` operacional + `inemapromover` holder,
  sem IDs); código do bot no `inemaccvbot`.
- Perguntas ao usuário só em texto livre (nunca menu interativo), e apenas se
  genuinamente bloqueado.
- Reportar progresso honesto: cada hipótese testada → 1 linha de resultado.
  Nunca declarar sucesso sem a verificação da API (critério 3).

## AO TERMINAR

- **Sucesso:** atualizar `docs/setup-linux-navegador.md` (seção 7: B validada,
  como operar), criar as units systemd, commitar tudo, e **desativar a
  dependência da Opção A** (documentar que a janela do desktop não precisa
  mais ficar em foco). Avisar o usuário com o resumo e a prova (11/11 na API).
- **Falha (limite estourado):** executar o plano de saída descrito em LIMITES.

---

## RESULTADO — GOAL ATINGIDO (2026-07-19, ~45 min dos 180 permitidos)

Todos os 4 critérios cumpridos, com prova:

| Critério | Prova |
|---|---|
| 1. Estabilidade | 3/3 arranques com janela mapeada (`stack99-check.sh`) |
| 2. Visibilidade | Título da janela: `VIS_visible_hasFocus_true` |
| 3. Prova real | 11/11 vídeos do assunto "o-ceo-da-anthropic" confirmados na API, zero toque humano (RUN 1 de 4) |
| 4. Persistência | `stack99.service` enabled; start + restart validados 2/2 |

**Causa raiz da "flakiness" (achada na hipótese 1, em ~20 min):** os
`pkill -f`/`pgrep -f` com "chromium-xvfb" no padrão matavam/casavam o PRÓPRIO
wrapper bash (o cmdline do `bash -c` contém a string — exit 144). A janela não
era flaky: o launcher morria no meio. Fix: truque do colchete
(`chromium-xvf[b]`) + scripts em arquivo. As demais hipóteses nem foram
necessárias — o subagente da fase 2 resolveu o `hidden` sozinho com xdotool
dentro do `:99`.

Guia operacional do que ficou montado: `setup-linux-navegador.md`, seção 7.1.
Método usado para chegar aqui: `metodo-goal.md`.
