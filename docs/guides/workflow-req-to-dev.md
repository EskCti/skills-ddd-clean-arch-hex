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

### 1.1 `req-discovery` — entender o que existe

Quando o pedido for analisar um sistema existente (URL, caminho local) ou documentar requisitos.

- **Entrada**: sistema legado, descrição livre, ou issue.
- **Saída** em `<docsPath>/discovery/<sistema>/`:
  - `requirements.md` — requisitos funcionais (RF-XXX) e não-funcionais;
  - `ddd-analysis.md` — Bounded Contexts, entidades, VOs iniciais;
  - `screens.md` — telas e fluxos (web/mobile);
  - `domain-model.md` — modelo de domínio.

### 1.2 `req-ddd-modeling` — modelar o domínio

- **Entrada**: saída do discovery.
- **Saída** em `<docsPath>/modeling/<projeto>/`:
  - `ddd-strategic-model.md` — subdomínios (Core/Supporting/Generic), BCs com cardinalidade, context map, linguagem ubíqua, topologia (monólito modular vs microserviços);
  - `ddd-tactical-model.md` — entities, VOs, domain events **+ seções de apresentação web/mobile por BC**;
  - `ddd-operational-notes.md`.

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
- **Saída**: `backlog.md` (obrigatório), `epics-summary.md`, `sprint-plan.md`.

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

### 3.3 Documentar o contexto para agentes (novo)

Após o bootstrap, rode **`config-agents-md`** para gerar:

- `AGENTS.md` na raiz — mapa de módulos, convenções (via `skills-standards.md`), fluxo e comandos transversais;
- `AGENTS.md` por submódulo — papel, stack, layout, comandos reais, skills aplicáveis.

Rode novamente sempre que a topologia mudar (novo BC, novo microserviço, novo app).

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
- Inventário de skills: [`skills-inventory.md`](skills-inventory.md).
- Convenções globais: [`../../skills-standards.md`](../../skills-standards.md).
- Matriz de stack: [`fullstack-stack-matrix.md`](fullstack-stack-matrix.md).
