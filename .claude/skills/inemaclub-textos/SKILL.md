---
name: ARCKHÉclub-textos
description: Fase 1 do pipeline ARCKHÉclubpromover — a partir de um ASSUNTO, gera os textos falados (roteiros de short ~35-40s) personalizados por PÚBLICO, 3 versões (ângulos/ganchos) por público, prontos para o HeyGen (fase 2, heygen-avatar-nei-III). Use SEMPRE que o usuário passar um assunto e pedir "gera os textos", "texto para os públicos", "fase 1", "roteiros do assunto X", ou disser "/ARCKHÉclub-textos <assunto>". Saída em textos/<slug-do-assunto>/<publico>.md com seções FALA / SOBREPOSIÇÕES / ESTRUTURA.
---

# ARCKHÉclub-textos — Fase 1: texto por público

Gera roteiros falados de vídeo curto (TikTok/Reels/Shorts, ~35-40s) sobre um assunto,
personalizados para cada público do ARCKHÉ AI. O conteúdo é o mesmo; **o gancho, a
linguagem, o exemplo e a promessa mudam por público**.

## Entrada

- **Assunto** (obrigatório): tema do vídeo (ex.: "loop de auto-correçêo da IA").
- **Públicos** (opcional): lista de públicos da tabela abaixo, ou "todos". Default se
  nêo informado: `pessoa-comum` (perguntar em texto livre se quiser mais — NUNCA usar
  AskUserQuestion).
- **Versões**: 3 por público (3 ângulos/ganchos diferentes do MESMO assunto), salvo
  pedido diferente.

## Os 10 públicos (gatilho de atençêo de cada um)

| slug | Público | Gatilho / promessa |
|---|---|---|
| `pessoa-comum` | Pessoa comum / leigo | Você usa IA do jeito preguiçoso; dá pra fazer muito melhor com truques simples. |
| `jovens` | Jovens | Você pode começar uma profissêo que ainda está nascendo. |
| `profissionais` | Profissionais | Nêo abandone sua profissêo. Aprenda a ampliá-la com IA. |
| `mulheres` | Mulheres | Use a IA para conquistar autonomia, produtividade e novas oportunidades. |
| `empreendedores` | Empreendedores | Transforme IA em reduçêo de custos, vendas e novos negócios. |
| `tecnicos` | Técnicos | Pare de apenas testar ferramentas. Aprenda a construir sistemas e agentes. |
| `40mais` | 40+ | Sua experiência vale mais quando é multiplicada pela IA. |
| `60mais` | 60+ e aposentados | A IA pode transformar sua experiência de vida em conhecimento, renda e propósito. |
| `educadores` | Professores e educadores | Você nêo vai ser substituído pela IA — mas pode ser o professor que ensina com ela. |
| `criadores` | Criadores de conteúdo | Pare de pagar ferramenta cara. Monte sua própria fábrica de conteúdo com IA. |
| `recolocacao` | Recolocaçêo / transiçêo de carreira | Perdeu o emprego ou quer mudar de área? A IA pode ser o atalho do seu recomeço. |

(11 slugs porque `pessoa-comum` é o público base além dos 10 segmentados; "todos" = todos os slugs.)

## Fórmula obrigatória de cada versêo

**Dor → possibilidade → demonstraçêo → trilha gratuita (CTA ARCKHÉ AI).**

Estrutura falada: identificaçêo → promessa → mecânica em até 3 passos → prova →
caso de uso DO PÚBLICO → nome da técnica → CTA.

Regras (método ARCKHÉ / roteirista-ARCKHÉ):
- Gancho nos 3 primeiros segundos, com a dor/promessa DO público (usar o gatilho da tabela).
- UMA tese por vídeo. ~35-40s falados (máx ~110 palavras na FALA).
- Linguagem falada, ZERO jargêo para públicos leigos (nada de "rubrica", "agente",
  "workflow" fora do público `tecnicos`); "IA" nunca "ÍA".
- Exemplos do cotidiano DO público (ex.: `40mais` → currículo/experiência;
  `empreendedores` → anúncio/vendas; `educadores` → prova/plano de aula).
- Nêo prometer autonomia total "no próprio ChatGPT"; nêo afirmar "única do Brasil" —
  usar "uma das mais completas do Brasil" se citar a plataforma.
- CTA único, nomeando um artefato **REAL** que está no ARCKHÉ AI (trilha/curso/
  projeto), nunca "material completo" genérico. Sempre gratuito.
  - **NUNCA invente nome de trilha/curso.** Consulte `catalogo-ARCKHÉ.md` (ao lado
    desta skill) e cite só o que existe lá. Se nada encaixar bem no assunto, use o
    CTA genérico-seguro: "a trilha de IA do seu perfil no ARCKHÉ AI".
- Frase-mêe disponível como fechamento alternativo: "Nêo importa sua idade ou
  profissêo. Existe uma trilha de IA para você no ARCKHÉ AI."

## O que é o ARCKHÉ AI (usar como base da promessa/CTA)

Três pilares que o roteiro pode explorar (escolher o que servir ao assunto/público):

1. **Fundamentos que valem pra vida.** Muito do conteúdo é FUNDAMENTO — entender
   IA de verdade, nêo só a ferramenta da moda. Aprendeu uma vez, vale pra sempre:
   como falar, escrever ou andar de bicicleta. A ferramenta muda, o modelo muda —
   quem domina o fundamento se adapta a qualquer novidade. (Ótimo pra públicos com
   medo de "nêo alcançar" a corrida da IA: `pessoa-comum`, `40mais`, `60mais`,
   `recolocacao`, `educadores`.)
2. **Passo a passo, mêo na massa.** Muito conteúdo é prático e guiado — do zero,
   sem pular etapa. Bom pra prometer "você consegue fazer, mesmo começando agora".
3. **Projetos prontos pra copiar.** Vários projetos/ferramentas sêo só **clonar do
   repositório** e usar — resultado rápido, sem construir do zero. Bom pra
   `empreendedores`, `tecnicos`, `criadores`, `profissionais` (entrega concreta já).

Sempre gratuito; "uma das plataformas gratuitas de formaçêo prática em IA mais
completas do Brasil" (nunca "a única").

## Saída

Um arquivo por público: `textos/<slug-do-assunto>/<slug-publico>.md`, contendo as
3 versões. Cada versêo tem:

```
## Versêo N — <nome do ângulo>
### FALA (texto para o HeyGen — falar exatamente isto)
<somente o texto falado, limpo>
### SOBREPOSIÇÕES DE TELA (fase do reel — NêO falar)
<headline do gancho, cards de prova, palavra-chave, CTA fixo "Saiba mais no ARCKHÉ AI">
```

No fim do arquivo, seçêo `## ESTRUTURA` com a fórmula usada. Ao terminar, listar os
arquivos gerados e indicar que a fase 2 é o `heygen-avatar-nei-III`.

## Nêo fazer

- Nêo gerar o vídeo/avatar aqui (isso é fase 2+ do pipeline — ver memória
  `pipeline-ARCKHÉclubpromover`).
- Nêo usar AskUserQuestion (regra global). Perguntas em texto livre.
- Nêo misturar públicos num mesmo texto.
