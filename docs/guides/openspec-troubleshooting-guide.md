# Troubleshooting — OpenSpec + Skills

**Propósito**: problemas comuns no ciclo OpenSpec com estas skills e a correção **real** deste repositório. Os comandos abaixo são os do CLI `openspec`, das skills (`openspec-*`) e dos scripts que existem em `scripts/`.

## Referência rápida

| Necessidade | Como |
|-------------|------|
| Estado da change | `openspec status --change "<nome>" --json` |
| Instruções de um artefato | `openspec instructions <artifact> --change "<nome>" --json` |
| Instruções do apply/archive | `openspec instructions apply\|archive --change "<nome>" --json` |
| Validar tasks e dependências | skill `openspec-validate-dependencies` |
| Corrigir dependências | `bash scripts/fix-dependencies.sh -c <ID> [--dry-run]` |
| Validação avançada (grafo, cache, relatório) | `bash scripts/validate-advanced-dependencies.sh -c <ID> [-v] [--no-cache]` |
| Espelhar a change em Jira/GitHub | skill `openspec-sync-issues` |
| Arquivar (gate de DoD + fechar tracker) | skill `openspec-archive-change` |
| Validar este repositório de skills | `node scripts/validate-skills.mjs` |

> As skills são carregadas pelo agente (Skill tool); os comandos `commands/opsx-*` são atalhos que carregam a skill canônica.

## 1. "Invalid dependency order" ou ciclo de dependências

1. Rode a skill `openspec-validate-dependencies` na change.
2. Ela decide pelo **modo do projeto** (`AGENTS.md`): `layer` valida a ordem inside-out; `vertical` valida a completude das fatias e o grafo `Blocked by`.
3. No modo `layer`: reordene as tasks conforme apontado. No modo `vertical`: corrija o grafo (dependências inexistentes, ciclos, referências órfãs).
4. `bash scripts/fix-dependencies.sh -c <ID> --dry-run` mostra correções comuns; sem `--dry-run`, aplica (com backup).
5. Sem referência? Compare com `docs/templates/openspec-task-template.yaml`.

## 2. Tasks não completam / progresso preso

- O checkbox (`- [ ]` → `- [x]`) é do agente e só vale com o comportamento implementado.
- Veja o estado real: `openspec status --change "<nome>" --json`.
- Retome com a skill `openspec-apply-change` (ou `/opsx-apply` na mesma change); ela mostra a fronteira (tasks desbloqueadas).

## 3. Change bloqueada (artefatos faltando)

- O `apply` fica bloqueado enquanto faltar artefato: rode `openspec status`, depois `openspec instructions <artifact> --change "<nome>" --json` e crie o que falta (`proposal`, `specs`, `design`, `tasks`).
- No schema spec-driven, `design.md` é condicional (crie só se a instrução pedir).

## 4. Sync de issues falhou, duplicou ou ficou incompleto

- O tracker e o transporte vêm do `AGENTS.md` (seção de rastreamento); precedência: usuário > `AGENTS.md` > `tracker-profile.md` > `skills.config.json`.
- Antes de criar, confira o ID map (`.openspec-sync.json`) e a label `openspec:<change>` — eles evitam duplicata.
- Se o MCP estiver indisponível, a skill **pergunta** antes de cair para `gh`/API.
- Em Jira Service Management interno, comentários usam `public=false`.

## 5. Archive não fecha / issue continua aberta

- O **gate de conclusão** vem do `AGENTS.md` (DoD) ou do bloco de fechamento do épico (`test:unit`, `test:coverage`, `test:e2e`, CI); sem ele, não arquive.
- Ao arquivar, o tracker é fechado: GitHub `state: closed` / `state_reason: completed` (issue + sub-issues); Jira → Done (épico, stories, subtasks).
- Se arquivou e a issue ficou aberta, feche manualmente e atualize o ID map.

## 6. Links ou referências quebrados neste repositório

- `node scripts/validate-skills.mjs` valida frontmatter (`name`, `stack`, `description`), links markdown relativos, `agents/openai.yaml` e referências a scripts (`./scripts/<x>` inexistente = erro; `scripts/<x>` inexistente = aviso).
- O CI (`.github/workflows/validate-skills.yml`) roda em push e pull request.

## Referências

- Skills: `openspec-propose`, `openspec-explore`, `openspec-apply-change`, `openspec-sync-specs`, `openspec-sync-issues`, `openspec-validate-dependencies`, `openspec-archive-change`, `openspec-context-cache`.
- `docs/guides/workflow-req-to-dev.md`
- `docs/guides/openspec-skills-best-practices.md`
- `docs/templates/openspec-task-template.yaml`
