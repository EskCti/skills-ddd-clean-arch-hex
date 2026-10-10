# Inventário de Skills

Levantamento das skills disponíveis neste repositório (`skills-ddd-clean`), por categoria, stack e papel.
Fonte canônica das convenções: [`../../skills-standards.md`](../../skills-standards.md). Visão narrativa: [`../../README.md`](../../README.md).

## Resumo

| Categoria | Prefixo | Qtd | Papel |
|-----------|---------|-----|-------|
| Orquestrador | `config-project-fullstack` | 1 | Ponto de entrada full-stack |
| Config / Bootstrap | `config-*` | 51 | Projeto, módulo, docker, CI/CD, auth, banco, shared kernel, AGENTS.md |
| Núcleo (domínio + aplicação) | `core-*` | 35 | entity, value object, domain service, repository, use case, DTO, CQRS |
| Backend (infra + interface) | `backend-*` | 10 | adapters de persistência e controllers |
| Frontend web | `frontend-*` | 16 | entity → usecase → repository → page / form |
| Mobile | `mobile-*` | 10 | entity → usecase → repository → screen / form |
| Requisitos / Análise | `req-*` | 4 | discovery, modelagem DDD, migração, planejamento |
| Qualidade | `test-*` | 10 | unit (≥95% domain+app) e e2e |
| OpenSpec | `openspec-*` | 6 | propose → explore → apply → archive |
| Workflow | `git-*` | 1 | commits atômicos por área |
| **Total** | | **144** | |

Stacks suportadas: **TypeScript** (sem sufixo), **Kotlin** (`-kt`), **Java** (`-java`), **C#** (`-cs`), **Rust** (`-rs`), **Angular**, **Vue**, **Leptos**, **Flutter**, **Android**.

---

## 1. Orquestrador

- `config-project-fullstack` — define **qual agent chamar, em qual ordem e com qual prompt** para criar um projeto completo (backend + frontend + mobile + Docker + CI/CD), integrando OpenSpec.

---

## 2. Config / Bootstrap (`config-*`)

### 2.1 Projeto e módulo

| Skill | Stack | Papel |
|-------|-------|-------|
| `config-project` | TS (Nest+Next) | monorepo TurboRepo + scaffold E2E |
| `config-project-kt` | Kotlin | multi-módulo Gradle + Spring Boot |
| `config-project-java` | Java | Gradle multi-module (shared + backend-java) |
| `config-project-cs` | C# | solução .NET Clean Architecture |
| `config-project-rs` | Rust | workspace Cargo (shared-kernel + api Axum) |
| `config-project-angular` | Angular | NestJS + Angular 17+ + Tailwind |
| `config-project-vue` | Vue | NestJS + Vue 3 + Tailwind + PrimeVue |
| `config-project-leptos` | Leptos | crate `web-leptos` SSR + Tailwind |
| `config-project-flutter` | Flutter | app clean architecture + Riverpod/Dio |
| `config-project-android` | Android | Compose + Hilt + Retrofit |
| `config-new-module[-kt\|-java\|-cs\|-rs]` | todas | scaffold de Bounded Context/módulo |
| `config-shared-core[-kt\|-java\|-cs\|-rs]` | todas | kernel compartilhado (Entity, VO, Result, UseCase) |
| `config-shared-web[-angular\|-vue\|-leptos]` | web | shell admin Tailwind |

### 2.2 Infraestrutura

| Skill | Stack | Papel |
|-------|-------|-------|
| `config-prisma` | TS | setup Prisma (schema, migrações) |
| `config-jpa-kt` / `config-jpa-java` | Kotlin/Java | JPA/Spring Data + Flyway |
| `config-efcore-cs` | C# | EF Core + Fluent API + migrations |
| `config-sqlx-rs` | Rust | migrations Postgres (sqlx) |
| `config-db-seed-cs` | C# | seeding (DataSeeder) |
| `config-docker[-kt\|-java\|-cs\|-rs]` | todas | Dockerfile multi-stage de produção |
| `config-cicd[-kt\|-java\|-cs\|-rs]` | todas | GitHub Actions (lint + test + coverage ≥95% + build + push) |

### 2.3 Autenticação

| Skill | Stack | Papel |
|-------|-------|-------|
| `config-auth-core-basic[-kt\|-cs]` | TS/KT/C# | auth core básico (user, password) |
| `config-auth-core-full[-kt\|-cs]` | TS/KT/C# | auth completo (role, permission, oauth) |
| `config-auth-backend-basic[-kt\|-cs]` | TS/KT/C# | auth backend (JWT, adapters) |
| `config-auth-web-basic` | Next.js | auth web (sign-in/up, dashboard) |

### 2.4 Contexto de agente

| Skill | Stack | Papel |
|-------|-------|-------|
| **`config-agents-md`** | agnostic | gera/atualiza **AGENTS.md** na raiz e por submódulo (mapa, convenções, comandos, skills) |

---

## 3. Núcleo — DDD/Clean (`core-*`)

Cada conceito existe para **TS, Kotlin (`-kt`), Java (`-java`), C# (`-cs`) e Rust (`-rs`)**.

| Conceito | Camada | Skill base |
|----------|--------|-----------|
| Entity | Domain | `core-entity[-…]` |
| Value Object | Domain | `core-value-object[-…]` |
| Domain Service | Domain | `core-domain-service[-…]` |
| Repository (port) | Domain | `core-repository[-…]` |
| DTO | Application | `core-dto[-…]` |
| Use Case | Application | `core-use-case[-…]` |
| Query CQRS | Application | `core-query-cqrs[-…]` |

Contrato transversal: **`Result` com lista de erros** (ver `skills-standards.md §5.1`).

---

## 4. Backend — infra + interface (`backend-*`)

| Conceito | Skill TS | KT | Java | C# | Rust |
|----------|----------|----|------|----|------|
| Persistence adapter | `backend-prisma-data` | `backend-data-kt` | `backend-data-java` | `backend-data-cs` | `backend-data-rs` |
| Controller | `backend-controller` | `backend-controller-kt` | `backend-controller-java` | `backend-controller-cs` | `backend-controller-rs` |

---

## 5. Frontend web (`frontend-*`)

Clean Architecture completa por framework **Angular**, **Vue** e **Leptos**, mais `frontend-form-schema` (Next.js).

| Camada | Angular | Vue | Leptos | Next.js |
|--------|---------|-----|--------|---------|
| Domain (entity + Result) | `frontend-entity-angular` | `frontend-entity-vue` | `frontend-entity-leptos` | — |
| Application (use case) | `frontend-usecase-angular` | `frontend-usecase-vue` | `frontend-usecase-leptos` | — |
| Infra (repository HTTP) | `frontend-repository-angular` | `frontend-repository-vue` | `frontend-repository-leptos` | — |
| Page / listagem | `frontend-page-angular` | `frontend-page-vue` | `frontend-page-leptos` | — |
| Formulário | `frontend-form-angular` | `frontend-form-vue` | `frontend-form-leptos` | `frontend-form-schema` |

Padrão de estilização: **Tailwind CSS** (`skills-standards.md §4.1`).

---

## 6. Mobile (`mobile-*`)

| Camada | Flutter | Android |
|--------|---------|---------|
| Domain (entity + Result) | `mobile-entity-flutter` | `mobile-entity-android` |
| Application (use case) | `mobile-usecase-flutter` | `mobile-usecase-android` |
| Infra (repository) | `mobile-repository-flutter` | `mobile-repository-android` |
| Tela | `mobile-screen-flutter` | `mobile-screen-android` |
| Formulário | `mobile-form-flutter` | `mobile-form-android` |

---

## 7. Requisitos / Análise (`req-*`)

| Skill | Papel | Saída |
|-------|-------|-------|
| `req-discovery` | analisar sistema existente (qualquer linguagem) e levantar requisitos | `requirements.md`, `ddd-analysis.md`, `screens.md`, `domain-model.md` |
| `req-ddd-modeling` | modelagem estratégica + tática | `ddd-strategic-model.md`, `ddd-tactical-model.md`, `ddd-operational-notes.md` |
| `req-migration-strategy` | estratégia de migração de legado (Strangler Fig, ACL) | plano de migração/coexistência |
| `req-agile-planning` | backlog com épicos (BCs), stories e tasks por camada (Agent + Prompt) | `backlog.md`, `epics-summary.md`, `sprint-plan.md`, `delivery-profile.md` |

---

## 8. Qualidade (`test-*`)

| Skill | Escopo | Stack |
|-------|--------|-------|
| `test-unit[-kt\|-java\|-cs\|-rs]` | domínio + aplicação, cobertura **≥95%** | todas |
| `test-e2e[-kt\|-java\|-cs\|-rs]` | fluxo completo (API/UI) | todas |

Detalhes de cobertura: `skills-standards.md §11` (Test Coverage Standard) e Epic Definition of Done.

---

## 9. OpenSpec (`openspec-*`)

| Skill | Papel |
|-------|-------|
| `openspec-propose` | criar proposta de mudança |
| `openspec-explore` | investigação prévia do problema |
| `openspec-apply-change` | aplicar/implementar as tasks da mudança |
| `openspec-archive-change` | arquivar mudança concluída |
| `openspec-validate-dependencies` | validar dependências entre mudanças |
| `openspec-context-cache` | cache de contexto entre execuções |

---

## 10. Workflow (`git-*`)

- `git-organized-commits` — commits **atômicos por área** (nunca `git add .`), mensagens convencionais e corpo de PR.

---

## Como navegar

1. Para **entender o fluxo** requisito → desenvolvimento, ver [`workflow-req-to-dev.md`](workflow-req-to-dev.md).
2. Para **escolher a stack**, ver [`fullstack-stack-matrix.md`](fullstack-stack-matrix.md) e [`../tutorial/stacks/`](../tutorial/stacks/).
3. Para **convenções de código**, ver [`../../skills-standards.md`](../../skills-standards.md).
4. Para **documentar o projeto para agentes**, usar `config-agents-md`.
