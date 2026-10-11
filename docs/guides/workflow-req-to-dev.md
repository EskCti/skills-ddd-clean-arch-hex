# Fluxo: Requisito → Análise → Planejamento → Desenvolvimento

Guia prático de como encadear as skills deste repositório, da descoberta do requisito até a entrega testada. Complementa os tutoriais em [`../tutorial/`](../tutorial/README.md) e o inventário em [`skills-inventory.md`](skills-inventory.md).

## Visão geral

```
┌──────────────┐   ┌───────────────┐   ┌──────────────────┐   ┌──────────────┐   ┌────────────────┐
│  REQUISITO   │ → │    ANÁLISE    │ → │   PLANEJAMENTO   │ → │ DESENVOLVIM. │ → │   QUALIDADE/    │
│              │   │               │   │                  │   │              │   │   ENTREGA       │
│ descrição    │   │ req-discovery │   │ req-agile-       │   │ core-*       │   │ test-unit       │
│ issue / URL  │   │ req-ddd-      │   │ planning         │   │ backend-*    │   │ test-coverage   │
│ sistema      │   │ modeling      │   │ → backlog.md     │   │ frontend-*   │   │ test-e2e        │
│ legado       │   │ [req-migration│   │ + delivery-      │   │ mobile-*     │   │ config-cicd     │
│              │   │  -strategy]   │   │ profile.md       │   │ config-*     │   │ git-organized   │
└──────────────┘   └───────────────┘   └──────────────────┘   └──────────────┘   └────────────────┘
```

Fases 1–3 (`req-*`) são **agnósticas de linguagem**: leem qualquer fonte (PHP, Go, Python, Java, monolito). A implementação sempre usa as skills deste repositório (TS/KT/Java/CS/RS + web/mobile).

---

## Fase 1 — Requisito e Análise

### 1.0 `analyse/*` — análise especialista (opcional por tarefa)

A camada `analyse/` reúne 12 skills de analista sênior que **alimentam** as fases `req-*` com artefatos auditáveis. Use conforme a lacuna:

| Necessidade | Skill `analyse/` |
|-------------|------------------|
| Preparar entrevistas/workshops | `requirements-elicitation` |
| Mapear poder × interesse e conflitos | `stakeholder-analysis` |
| Extrair requisitos/regras do código legado | `legacy-code-analyzer` |
| Extrair BCs, entidades, VOs e linguagem ubíqua | `domain-model-extractor` |
| Avaliar aderência a Clean/Hexagonal/DDD | `architecture-assessment` |
| RNFs com métricas mensuráveis | `nfr-specialist` |
| Estratégia de migração e riscos | `migration-strategy-advisor` |
| Gerar stories, priorizar, rastrear, validar | `user-story-generator`, `prioritization-agent`, `traceability-matrix-builder`, `validation-quality-gate` |
| Avaliar impacto de mudança de escopo | `change-impact-analyzer` |

> Os formatos de saída seguem a biblioteca **T01–T11** em [`../../references/templates-luiza-silva.md`](../../references/templates-luiza-silva.md), usada pelos `req-*` para registrar decisões, regras de negócio e pendências.
>
> Fluxo detalhado das especialistas (matriz objetivo → skill): [`analysis-expert-flow.md`](analysis-expert-flow.md).

### 1.1 `req-discovery` — entender o que existe

Quando o pedido for analisar um sistema existente (URL, caminho local) ou documentar requisitos.

- **Entrada**: sistema legado, descrição livre, ou issue.
- **Saída** em `<docsPath>/discovery/<sistema>/`:
  - `requirements.md` — requisitos funcionais (RF-XXX) e não-funcionais;
  - `ddd-analysis.md` — Bounded Contexts, entidades, VOs iniciais;
  - `screens.md` — telas e fluxos (web/mobile);
  - `domain-model.md` — modelo de domínio;
  - **Registro de Regras de Negócio** — regras/políticas desacopladas dos RFs (template T05);
  - **Registro de Dúvidas e Pendências** — matriz de controle de bloqueios (template T07).

### 1.2 `req-ddd-modeling` — modelar o domínio

- **Entrada**: saída do discovery.
- **Saída** em `<docsPath>/modeling/<projeto>/`:
  - `ddd-strategic-model.md` — subdomínios (Core/Supporting/Generic), BCs com cardinalidade, context map, linguagem ubíqua, topologia (monólito modular vs microserviços);
  - `ddd-tactical-model.md` — entities, VOs, domain events **+ seções de apresentação web/mobile por BC**;
  - `ddd-operational-notes.md`.

> **Análise das 4 Dimensões**: antes de recomendar a topologia (monólito modular vs microserviços), o skill avalia 4 dimensões (checklist de viabilidade holística) para evitar pontos cegos.

### 1.3 `req-migration-strategy` (opcional — legado)

- Define Strangler Fig / Big Bang / incremental, sequência por BC, Anti-Corruption Layer (ACL) e plano de coexistência.

> **Decisão arquitetural chave**: a topologia (monólito modular vs microserviços) sai daqui. É ela que define quantos módulos/submódulos o repositório terá — e, portanto, quantos `AGENTS.md` serão gerados por `config-agents-md`.

---

## Fase 2 — Planejamento

### 2.1 `req-agile-planning` — backlog

Transforma o modelo DDD em backlog acionável.

- **Fase 0 obrigatória**: criar `<docsPath>/planning/<projeto>/delivery-profile.md` — stack (backend/web/mobile) **+ superfícies API/Web/Mobile por BC**.
- **Épicos = Bounded Contexts** (+ `EP-000 [TECH]` de bootstrap com Docker e CI/CD).
- **Stories** com critérios de aceitação; se o BC tem web/mobile → subseções **Telas e fluxos (web/mobile)**.
- **Tasks por camada**, sempre com **Agent + Prompt**.
- **Gate de Qualidade (Definition of Ready)**: cada User Story passa pelo checklist de prontidão **T11** (clareza, critérios, dependências, viabilidade, dúvidas resolvidas) antes de entrar na sprint; **Matriz de Validação** para checar completude.
- **Registro de Decisões (T06)** para toda priorização/corte de escopo; **Registro de Dúvidas e Pendências (T07)** para bloqueios; **Solicitação de Mudança (T08)** + **Análise de Impacto (T09)** pós-baseline.
- **Saída**: `backlog.md` (obrigatório), `epics-summary.md`, `sprint-plan.md`.

> Planejamento completo = backlog **+ rastreabilidade** (`traceability-matrix-builder`) **+ gate DoR** (`validation-quality-gate`). Sem isso, o backlog vira caos: decisões sem registro (T06) geram rediscussão e pendências sem responsável (T07) nunca são resolvidas.

### 2.2 Ordem inside-out (referência das tasks)

```
BACKEND
 1 domain:vo            → core-value-object[-kt|-java|-cs|-rs]
 2 domain:entity        → core-entity[-…]
 3 domain:service       → core-domain-service[-…]
 4 domain:repository    → core-repository[-…]
 5 app:dto              → core-dto[-…]
 6 app:usecase          → core-use-case[-…]
 7 app:query            → core-query-cqrs[-…]
 8 infra:persistence    → backend-data[-…] | backend-prisma-data
 9 infra:migration      → config-jpa-* | config-sqlx-rs | config-efcore-cs | config-prisma
10 interface:controller → backend-controller[-…]

FRONTEND WEB
11 interface:entity     → frontend-entity-*
12 interface:usecase    → frontend-usecase-*
13 interface:repository → frontend-repository-*
14 interface:page       → frontend-page-*
15 interface:form-web   → frontend-form-*

MOBILE
16 interface:mobile-entity     → mobile-entity-*
17 interface:mobile-usecase    → mobile-usecase-*
18 interface:mobile-repository → mobile-repository-*
19 interface:mobile            → mobile-screen-*
20 interface:mobile-form       → mobile-form-*

QUALIDADE
21 test:unit → test:coverage (≥95%) → test:e2e → quality:ci-verify
22 quality:memory-leak (somente Rust)
```

Mapeamento completo prefixo → Agent em `req-agile-planning/SKILL.md`.

---

## Fase 3 — Desenvolvimento

### 3.1 Bootstrap (EP-000)

Use `config-project-fullstack`, que orquestra na ordem:

1. `config-project-*` (backend) + `config-project-{angular|vue|leptos|flutter|android}` + `config-shared-web-*`;
2. `config-docker-*` + `config-cicd-*` (produção e pipeline desde o início);
3. `config-shared-core-*` (kernel compartilhado).

### 3.2 Por Bounded Context

Siga a ordem inside-out de §2.2. Opcionalmente, envolva cada BC em uma mudança OpenSpec:

```
openspec-propose "bc-<nome>"  →  openspec-apply-change  →  openspec-archive-change
```

`config-new-module[-…]` cria o scaffold do módulo antes das tasks de domínio.

**Rastreamento em tracker**: se o projeto usa Jira/GitHub Issues, `openspec-sync-issues` espelha a change (issue + subtasks) usando o transporte escolhido no `AGENTS.md` (MCP ou `gh`/API), e fecha tudo no archive.

### 3.3 Documentar o contexto para agentes (novo)

Após o bootstrap, rode **`config-agents-md`** para gerar:

- `AGENTS.md` na raiz — mapa de módulos, convenções (via `skills-standards.md`), fluxo e comandos transversais;
- `AGENTS.md` por submódulo — papel, stack, layout, comandos reais, skills aplicáveis.

Rode novamente sempre que a topologia mudar (novo BC, novo microserviço, novo app). Em projeto já existente, use o modo **`preserve`**: mantenha o formato editorial e acrescente apenas o que falta (ver [Adoção em projeto existente](#adoção-em-projeto-existente-projeto-em-andamento)).

---

## Fase 4 — Qualidade e entrega

1. **`test-unit`** — domínio + aplicação.
2. **`test:coverage`** — validar **≥95%** em domain+application (gate no CI).
3. **`test-e2e`** — fluxo crítico ponta a ponta.
4. **`quality:ci-verify`** — pipeline verde no PR.
5. **`quality:memory-leak`** — somente Rust (LeakSanitizer/Valgrind).
6. **`git-organized-commits`** — commits atômicos por área (nunca `git add .`).

> **Definição de pronto do épico**: testes + cobertura + E2E + CI verde (e memory-leak em Rust) antes de merge/archive.

---

## Adoção em projeto existente (projeto em andamento)

Quando o repositório já tem código e uma constituição própria (AGENTS.md editorial, docs donos, tracker):

1. **Leia antes de escrever**: AGENTS.md da raiz e dos módulos + docs donos (arquitetura, contrato, esquema) + GLOSSARY/ADRs. A constituição **prevalece** sobre o template (norma em `skills-standards.md` §4.2).
2. **Atualize o contexto, não o substitua**: rode `config-agents-md` no modo `preserve` — sem marcadores novos, mantendo idioma, títulos e estilo; ele acrescenta só o que falta (comandos reais, mapa, estado atual, definição de pronto, tracker).
3. **Mapeie gaps como prefactor**: lacunas da filosofia (portas ausentes, VO, Result) entram como tasks de prefactor (`domain:*` / `infra:*`) no próximo backlog — não refatore o existente de uma vez. "Make the change easy, then make the easy change."
4. **Escolha o formato do projeto**: `layer-tasks` ou `vertical-slice`, conforme o AGENTS.md; as change agents respeitam a declaração e só aplicam os defaults da casa na ausência dela.
5. **Entre pelas próximas mudanças**: propose → apply → archive sobre o que já existe; o DoD é o do projeto (comandos reais declarados), com fallback para os defaults.

---

## Exemplo integrado (legado → NestJS + Vue + Flutter)

```
req-discovery ─┐
req-ddd-modeling ─┤   backlog.md (EP-000 bootstrap + EP-001..N BCs)
req-agile-planning ┘        │
                            ▼
openspec-propose "bootstrap-<nome>"
   → config-project-fullstack (config-project + docker + cicd + shared-core)
   → config-agents-md (AGENTS.md raiz + submódulos)
   → por BC: openspec-propose/apply/archive (inside-out)
   → test:unit → test:coverage → test:e2e → quality:ci-verify
   → git-organized-commits
```

Ver [`../tutorial/04-ciclo-completo-openspec.md`](../tutorial/04-ciclo-completo-openspec.md) para o ciclo narrativo completo.

---

## Referências

- Tutoriais: [`../tutorial/README.md`](../tutorial/README.md) (01 análise/planejamento, 02 hub full-stack, 04 ciclo OpenSpec).
- Inventário de skills: [`skills-inventory.md`](skills-inventory.md) (inclui `analyse/*` §11 e `commands/*` §12).
- Análise especialista: skills em [`../../analyse/`](../../analyse/).
- Templates de análise (T01–T11): [`../../references/templates-luiza-silva.md`](../../references/templates-luiza-silva.md).
- Convenções globais: [`../../skills-standards.md`](../../skills-standards.md).
- Matriz de stack: [`fullstack-stack-matrix.md`](fullstack-stack-matrix.md).
