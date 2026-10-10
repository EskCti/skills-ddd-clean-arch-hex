# Fluxo de Análise Especialista (`analyse/*`)

Como os agentes devem **sempre** consultar as skills especialistas de `analyse/` ao longo do ciclo requisito → análise → planejamento → desenvolvimento, e onde cada uma entra.

> **Regra de ouro**: antes de produzir requisitos, modelagem ou backlog, o agente **consulta a skill especialista correspondente** ao seu objetivo (ver matriz abaixo). As especialistas não substituem as `req-*` — elas **alimentam** com artefatos auditáveis (templates T01–T11).

Índice geral das skills: [`skills-inventory.md`](skills-inventory.md) §11 · Fluxo macro: [`workflow-req-to-dev.md`](workflow-req-to-dev.md) · Templates: [`../../references/templates-luiza-silva.md`](../../references/templates-luiza-silva.md).

---

## Visão geral

```
                        ┌─────────────────────── analyse/* ───────────────────────┐
                        │                                                          │
  REQUISITO ─▶ ANÁLISE ─┤ requirements-elicitation · stakeholder-analysis         │
                        │ legacy-code-analyzer · domain-model-extractor            │
                        │ architecture-assessment · nfr-specialist                 │
                        │                       │                                  │
                        │                       ▼                                  │
  PLANEJAMENTO ─────────┤ user-story-generator · prioritization-agent             │
                        │ traceability-matrix-builder · validation-quality-gate    │
                        │ change-impact-analyzer                                   │
                        │                       │                                  │
                        └───────────────────────┼──────────────────────────────────┘
                                                ▼
  DESENVOLVIMENTO ──▶ core-* / backend-* / frontend-* / mobile-* / config-*
                                                ▼
  QUALIDADE ────────▶ test-* → config-cicd-* → git-organized-commits
```

As fases `req-*` permanecem como **orquestração**; `analyse/*` são as **especialistas acionáveis** dentro de cada fase.

---

## Matriz de acionamento (por objetivo)

| Objetivo | Skill especialista | Quando acionar | Artefato / template |
|----------|--------------------|----------------|---------------------|
| Preparar entrevistas/workshops | `requirements-elicitation` | antes de conversar com stakeholders | Roteiro (T01) |
| Mapear quem decide e quem é afetado | `stakeholder-analysis` | início do projeto | Matriz poder × interesse |
| Extrair requisitos/regras do legado | `legacy-code-analyzer` | há sistema existente | RFs + regras (T03/T05) |
| Extrair modelo de domínio do legado | `domain-model-extractor` | antes de modelar DDD | BCs, entidades, VOs, linguagem ubíqua |
| Avaliar aderência arquitetural | `architecture-assessment` | antes de plano de modernização | Diagnóstico de acoplamento/coesão/violações |
| Definir RNFs mensuráveis | `nfr-specialist` | levantamento e decisões de arquitetura | Métricas de desempenho/segurança/etc. |
| Escolher estratégia de migração | `migration-strategy-advisor` | legado a modernizar | Strangler Fig / ACL / riscos (T09) |
| Escrever User Stories | `user-story-generator` | montar backlog | Stories Given/When/Then (T04) |
| Priorizar | `prioritization-agent` | montar roadmap | MoSCoW / Valor×Esforço×Risco×Urgência / ROI |
| Rastrear requisito → teste | `traceability-matrix-builder` | auditoria de completude | Matriz de rastreabilidade |
| Validar requisitos (gate) | `validation-quality-gate` | antes de aprovar requisito/spec | Checklist de qualidade / DoR (T11) |
| Avaliar mudança de escopo | `change-impact-analyzer` | mudança pós-baseline | Análise de impacto (T09) |

---

## Fluxo por fase

### Fase 1 — Requisito e Análise

1. **`requirements-elicitation`** + **`stakeholder-analysis`** → prepara entrevistas e mapeia o poder/interesse.
2. **`legacy-code-analyzer`** → extrai requisitos, regras e fluxos do código (se houver legado).
3. **`domain-model-extractor`** → extrai BCs, entidades, VOs e linguagem ubíqua.
4. **`architecture-assessment`** → mede acoplamento/coesão e violações de dependência.
5. **`nfr-specialist`** → define RNFs mensuráveis.

Saída consumida por `req-discovery` e `req-ddd-modeling` (ver [`workflow-req-to-dev.md`](workflow-req-to-dev.md)).

### Fase 2 — Planejamento

1. **`user-story-generator`** → converte requisitos em User Stories (T04).
2. **`prioritization-agent`** → prioriza épicos/stories (MoSCoW + ROI).
3. **`traceability-matrix-builder`** → garante objetivo → requisito → funcionalidade → teste.
4. **`validation-quality-gate`** → aplica o **Definition of Ready (T11)** antes da sprint.
5. **`change-impact-analyzer`** → avalia impacto de mudanças de escopo (T09).

Consumido por `req-agile-planning` (backlog + `delivery-profile.md`).

### Fase 2.5 — Migração (opcional, legado)

- **`migration-strategy-advisor`** → escolhe Strangler Fig / incremental, desenha ACL, sequência por BC e riscos.
- Consumido por `req-migration-strategy`.

### Fase 3 — Desenvolvimento

- As especialistas **não** geram código. O desenvolvimento usa `core-*`, `backend-*`, `frontend-*`, `mobile-*` e `config-*` (ordem inside-out).

---

## Como os agentes "sempre vêem" as especialistas

As `analyse/*` são garantidas em quatro pontos, para que nenhum agente as ignore:

| Ponto | O que garante |
|-------|---------------|
| **`config-agents-md`** | o `AGENTS.md` raiz gerado **sempre** inclui a seção "Análise especialista (`analyse/*`)" com esta matriz de acionamento |
| **`req-discovery` / `req-ddd-modeling` / `req-migration-strategy` / `req-agile-planning`** | cada skill traz a seção "Skills Especialistas Recomendadas" apontando as `analyse/*` da sua fase |
| **`config-project-fullstack`** | o orquestrador instrui a consultar as `analyse/*` nas fases de análise/planejamento |
| **`skills-standards.md`** | norma global: todo agente consulta a especialista correspondente antes de requisito/planejamento |

> Ao gerar/atualizar `AGENTS.md` em um projeto, `config-agents-md` injeta a seção de especialistas — assim a regra viaja junto do contexto do projeto.

---

## Skills especialistas (`analyse/*`)

| # | Skill | Foco |
|---|-------|------|
| 1 | `requirements-elicitation` | elicitação de requisitos (entrevistas, workshops) |
| 2 | `stakeholder-analysis` | stakeholders, poder × interesse, comunicação |
| 3 | `legacy-code-analyzer` | código legado → requisitos e regras |
| 4 | `domain-model-extractor` | legado → modelo de domínio (BCs, entidades, VOs) |
| 5 | `architecture-assessment` | aderência a Clean/Hexagonal/DDD |
| 6 | `nfr-specialist` | requisitos não funcionais mensuráveis |
| 7 | `migration-strategy-advisor` | estratégia de migração (Strangler Fig, ACL) |
| 8 | `user-story-generator` | requisitos → User Stories (Given/When/Then) |
| 9 | `prioritization-agent` | priorização (MoSCoW, ROI) |
| 10 | `traceability-matrix-builder` | matriz objetivo → requisito → teste |
| 11 | `validation-quality-gate` | gate de qualidade / Definition of Ready |
| 12 | `change-impact-analyzer` | impacto de mudanças de escopo/prazo |

---

## Referências

- Inventário: [`skills-inventory.md`](skills-inventory.md).
- Fluxo macro: [`workflow-req-to-dev.md`](workflow-req-to-dev.md).
- Templates T01–T11: [`../../references/templates-luiza-silva.md`](../../references/templates-luiza-silva.md).
- Convenções globais: [`../../skills-standards.md`](../../skills-standards.md).
- Skills: [`../../analyse/`](../../analyse/).
