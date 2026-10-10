# Template — AGENTS.md da raiz

> Copie o bloco abaixo e substitua os `<>`. Envolva o conteúdo gerenciado pelo skill com os marcadores para permitir merge idempotente.

```markdown
<!-- BEGIN:agents-md generated -->
# AGENTS.md — <Nome do Projeto>

> Instruções para agentes de IA neste repositório. Leia este arquivo antes de qualquer tarefa.
> Convenções globais detalhadas: `<caminho>/skills-standards.md` (repo de skills).

## Visão do repositório

- **Tipo**: <monorepo com submodules Git | monorepo workspace | repositório único>
- **Descrição**: <1-2 frases sobre o produto>
- **Submódulos**: <N> (build/test próprios)
- **Stacks**: <lista: Java/Kotlin, TypeScript, Rust, ...>

## Mapa de módulos

| Módulo | Caminho | Stack | Papel | Build/Test | Porta | AGENTS.md |
|--------|---------|-------|-------|------------|-------|-----------|
| <ordering> | `microservices/ordering` | Java/Spring | Pedidos | `./gradlew test` | 8080 | `microservices/ordering/AGENTS.md` |
| <web> | `apps/web` | Vue 3 | Frontend admin | `npm test` | 3000 | `apps/web/AGENTS.md` |

## Como trabalhar (fluxo recomendado)

```
requisito → análise → planejamento → desenvolvimento → testes → commit
```

1. **Requisito / Análise** — `req-discovery` (ler sistema/descrever) → `req-ddd-modeling` (subdomínios, BCs, context map) → `req-migration-strategy` (legado, opcional).
2. **Planejamento** — `req-agile-planning` → `backlog.md` (épicos = BCs, stories, tasks por camada com Agent + Prompt).
3. **Desenvolvimento** — por BC, inside-out:
   `domain:vo` → `domain:entity` → `domain:service` → `domain:repository` → `app:dto` → `app:usecase` → `app:query` → `infra:persistence` → `infra:migration` → `interface:controller` (+ frontend/mobile quando aplicável).
4. **Qualidade** — `test-unit` (≥95% domain+app) → `test:coverage` → `test:e2e` → CI verde.
5. **Entrega** — `git-organized-commits` (commits atômicos por área); OpenSpec (`openspec-propose` → `apply` → `archive`) para mudanças rastreadas.

Ver guia completo: `<skills>/docs/guides/workflow-req-to-dev.md`.

## Convenções globais (resumo)

- Código/identificadores em **inglês**; UX/docs em português.
- `Result` com **lista de erros** em falhas (nunca só a primeira mensagem); ver `skills-standards.md §5.1`.
- **Cobertura ≥95%** em domain + application (gate no CI).
- Frontends web: **Tailwind CSS** como padrão de layout.
- Naming: kebab-case para pastas/arquivos TS; PascalCase para arquivos Kotlin/C#; snake_case para Rust.
- Regras completas por stack: `skills-standards.md §7-§10`.

## Skills disponíveis (repo de skills)

| Categoria | Prefixo | Uso |
|-----------|---------|-----|
| Orquestrador | `config-project-fullstack` | bootstrap full-stack |
| Requisitos | `req-*` | discovery, modelagem DDD, migração, planejamento |
| Config | `config-*` | projeto, módulo, docker, CI/CD, auth, DB |
| Domínio/Aplicação | `core-*` | entity, VO, service, repository, use case, DTO, CQRS |
| Backend | `backend-*` | adapters de persistência e controllers |
| Frontend | `frontend-*` | entity→usecase→repository→page/form |
| Mobile | `mobile-*` | entity→usecase→repository→screen/form |
| Qualidade | `test-*` | unit + e2e |
| OpenSpec | `openspec-*` | proposta → apply → archive |
| Workflow | `git-*` | commits organizados |
| Contexto | `config-agents-md` | gera/atualiza estes AGENTS.md |

Inventário completo: `<skills>/docs/guides/skills-inventory.md`.

## Análise especialista (`analyse/*`) — OBRIGATÓRIO

> Antes de produzir requisitos, modelagem ou backlog, **consulte a skill especialista** correspondente ao objetivo abaixo. As especialistas alimentam as fases `req-*` com artefatos auditáveis.

| Objetivo | Skill `analyse/` |
|----------|------------------|
| Preparar entrevistas/workshops | `requirements-elicitation` |
| Mapear stakeholders (poder × interesse) | `stakeholder-analysis` |
| Extrair requisitos/regras do legado | `legacy-code-analyzer` |
| Extrair modelo de domínio do legado | `domain-model-extractor` |
| Avaliar arquitetura (Clean/Hexagonal/DDD) | `architecture-assessment` |
| Definir RNFs mensuráveis | `nfr-specialist` |
| Estratégia de migração de legado | `migration-strategy-advisor` |
| Gerar User Stories | `user-story-generator` |
| Priorizar (MoSCoW/ROI) | `prioritization-agent` |
| Rastreabilidade requisito → teste | `traceability-matrix-builder` |
| Gate de qualidade / Definition of Ready | `validation-quality-gate` |
| Impacto de mudança de escopo | `change-impact-analyzer` |

Fluxo detalhado: `<skills>/docs/guides/analysis-expert-flow.md`.

## Rastreamento de tarefas (Jira / GitHub) — escolha do projeto

> Onde criar as issues/tarefas deste repositório. Definido na geração deste AGENTS.md; **varia por projeto** e o transporte pode ser MCP ou CLI.

| Item | Valor |
|------|-------|
| Tracker | <Jira | GitHub Issues | Ambos | Nenhum> |
| Transporte | <MCP | CLI (`gh`/API) | Auto> |
| Direção | <1 via (OpenSpec → tracker) | 2 vias> |
| Modo GitHub | <single-issue (1 issue com os .md + checklist) | sub-issues> |
| Jira project | <PROJ ou —> |
| GitHub repo | <org/repo ou —> |

**Fluxo**: OpenSpec é canônico → `openspec-sync-issues` espelha change → issue, tasks → subtasks e fecha no archive.
Profile detalhado: `<docsPath>/planning/<projeto>/tracker-profile.md`.

## Comandos transversais

```bash
# atualizar submódulos
git submodule update --init --recursive

# infra local
docker compose -f docker-compose.services.yml up -d

# rodar todos os testes (raiz)
<comando real do projeto, ex.: python check_coverage.py>
```

## Regras de ouro

- Trabalhe **dentro do módulo** correto; cada submódulo tem repositório e ciclo de vida próprios.
- Ao alterar um submódulo, faça commit/push nele e depois atualize o ponteiro no monorepo.
- Leia o **AGENTS.md do módulo** antes de editar aquele módulo.
- Nunca use `git add .`; prefira `git-organized-commits`.
<!-- END:agents-md generated -->
```

## Seções manuais (preservar sempre)

Fora dos marcadores, o time pode adicionar seções próprias (ex.: contexto de negócio, contatos, ADRs). O skill **não** deve tocar nelas.
