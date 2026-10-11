# Template — corpo da issue (spec) a partir da change

O corpo da issue/épico no tracker é uma **visão** da change: mesma informação, formato de quem lê o tracker. A change OpenSpec continua canônica; o template não substitui `proposal.md`, `specs/` nem `tasks.md`.

O corpo **não duplica** a constituição do projeto (norma em `../../skills-standards.md` §4.2): decisões de arquitetura, contrato e regras de negócio são **apontadas** pelo nome do documento e da seção (`docs/lld.md` §3, `AGENTS.md` do módulo, ADR, GLOSSARY), nunca copiadas. Caminhos de arquivo e trechos de código ficam de fora: envelhecem rápido.

## Template

```markdown
## Problem

<O problema do ponto de vista de quem usa o sistema. Vem do proposal.md (what & why) — não do código.>

## Solution

<A solução do ponto de vista de quem usa. Vem do proposal.md.>

## User Stories

<Lista numerada e extensa: "Como <ator>, quero <funcionalidade>, para <benefício>." Derivada do proposal e dos requirements do delta.>

## Acceptance criteria

- [ ] <Critério verificável 1 — com o por onde é conferido (teste HTTP da API, teste no navegador, etc.)>
- [ ] <Critério verificável 2>

<Um item por scenario do delta (`#### Scenario:`), mantendo Given/When/Then quando existir.>

## Implementation Decisions

<Decisões de implementação: módulos/BCs afetados, interfaces públicas alteradas, mudanças de schema, contrato de API, decisões de arquitetura. Vem do design.md; o que for da constituição do projeto entra como referência (ex.: "segue `AGENTS.md` do módulo payments"), não como cópia.>

## Testing Decisions

<O que faz um bom teste para esta mudança, quais módulos são testados e qual a estratégia declarada no AGENTS.md do projeto (ex.: "regras provadas por e2e nas rotas" ou "unit ≥95% em domain+application"). Vem do design.md + constituição.>

## Out of Scope

<O que fica fora desta change. Vem do proposal.md/design.md.>

## References

- Change canônica: `openspec/changes/<change>/` (proposal, specs, design, tasks)
- Docs donos: <`docs/lld.md` §X, ADR-000N, `AGENTS.md` do módulo…>

---

<details><summary>Artefatos completos da change</summary>

<proposal.md, delta specs, design.md e tasks.md integrais — só quando `embed_artifacts: true` no tracker profile.>

</details>
```

## De onde vem cada seção

| Seção do corpo | Fonte | Regra |
|----------------|-------|-------|
| Problem / Solution / Out of Scope | `proposal.md` | Síntese; nada de caminhos de código |
| User Stories | `proposal.md` + `specs/<capability>/spec.md` (requirements) | Usar o vocabulário do `GLOSSARY.md` do projeto |
| Acceptance criteria | `specs/<capability>/spec.md` (scenarios) | Um critério por scenario; sempre verificável e com o "por onde é conferido" |
| Implementation Decisions | `design.md` | Decisão que é da constituição entra como referência, não como cópia |
| Testing Decisions | `design.md` + `AGENTS.md` do projeto | Respeitar a estratégia de teste/DoD declarada pelo projeto |
| References | — | Change canônica + docs donos, pelo nome e seção |
| Artefatos completos | `proposal.md`, `specs/`, `design.md`, `tasks.md` | Só no modo single-issue com `embed_artifacts` |

## Por tracker

| Tracker | Forma do corpo |
|---------|----------------|
| GitHub `single-issue` | Template completo + tasks como checklist `- [ ]` no corpo |
| GitHub `sub-issues` | Issue principal com o template; cada task vira sub-issue com título/a critério próprio e relação `blocked by` quando houver dependência |
| Jira | Épico com o template; Story(s) por requirement; Subtask por task (campo de descrição com o Prompt) |

## Regras

1. Idioma do projeto (o do `AGENTS.md`/`docs/`), sem trocar o vocabulário do `GLOSSARY.md`.
2. Labels de triagem e tipo **declaradas pelo projeto** (`AGENTS.md` §rastreamento) prevalecem sobre as labels default desta skill.
3. Ao atualizar (ID map existente), reescrever apenas as seções afetadas — não recriar a issue nem apagar discussão.
4. A issue aponta para a change; a change nunca aponta para a issue como fonte de verdade.
