# Presets — exemplos reais de projeto

Esta pasta guarda **presets**: skills adaptadas a um projeto real, mantidas como referência de como especializar o fluxo genérico (constituição do projeto, tracker, DoD e formato de tickets próprios).

| Preset | Projeto | O que demonstra |
|--------|---------|-----------------|
| `pos/pos-tarefa` | fritta / POS (Android + Jira) | Fluxo proposta OpenSpec → aprovação → implementação, com ADR/README atualizados e commit seletivo |
| `pos/pos-review-pr` | fritta / POS (GitHub + Jira) | Review de PR com classificação de comentários, proposta OpenSpec das correções e aprovação antes de implementar |

Regras:

- Presets **não** são skills genéricas: contêm caminhos, ADRs e trackers de um projeto específico.
- Ao adaptar um preset para outro projeto, copie-o para o consumidor e ajuste a constituição apontada (AGENTS.md, ADR, tracker).
- O fluxo genérico equivale, hoje, a: `openspec-propose` → aprovação → `openspec-apply-change` → `openspec-archive-change`, com o tracker declarado no `AGENTS.md` (skill `openspec-sync-issues`).
