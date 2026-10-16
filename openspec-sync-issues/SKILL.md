---
name: openspec-sync-issues
stack: agnostic
description: Sincronizar changes e tasks do OpenSpec com rastreadores externos (Jira e/ou GitHub Issues), usando o transporte escolhido pelo usuário (MCP Atlassian/GitHub ou CLI `gh`). Mantém o OpenSpec (.md) como fonte canônica e espelha proposal/requirements/tasks para issues, com mapeamento de IDs e fechamento no archive. Usar quando o pedido envolver gerar/atualizar issues no Jira ou GitHub a partir de uma mudança OpenSpec, ou fechar tarefas ao arquivar.
---

# OpenSpec ↔ Issues (Jira / GitHub)

Espelha uma **change OpenSpec** (`.md`, canônica) para um **rastreador externo** — Jira e/ou GitHub Issues — no transporte que o usuário escolher (**MCP** ou **CLI `gh`**).

**O OpenSpec permanece a fonte de verdade.** O tracker é uma **visão** para o time. Não substituímos o store `openspec/` nem o `validate`/`archive` do CLI.

---

## Pré-requisito — tracker profile

A escolha de **onde** criar as tarefas e **como** (MCP vs CLI) é feita **na criação do AGENTS.md** (skill `config-agents-md`) e/ou registrada em `<docsPath>/planning/<projeto>/tracker-profile.md`.

Campos (ver `references/tracker-config.md`):

```yaml
tracking:
  trackers: [github]        # jira | github | both | none
  transport: auto           # mcp | gh  | auto  (auto = MCP se disponível, senão gh/CLI)
  github:
    repo: org/repo          # ou derivar do git remote
    labels: [openspec]      # + epic:/priority: por issue
  jira:
    project_key: PROJ
    issue_type: Story
    epic_link_field: customfield_100xx
  direction: one-way        # one-way (OpenSpec→tracker) | two-way
  id_map: .openspec-sync.json
```

Se o profile não existir, **pergunte** antes de criar qualquer issue:

> "Onde devo criar as tarefas deste projeto? [ ] Jira  [ ] GitHub Issues  [ ] Ambos  [ ] Nenhum
> E como devo acessá-los? [ ] MCP  [ ] CLI (`gh`/API)  [ ] Auto"

### Pré-flight — o destino deve existir

Antes do primeiro write, **verificar** que os recursos do profile existem de fato:

1. **Repo**: `gh repo view <org>/<repo>` (ou equivalente MCP). Se não existir e houver remote local, propor o provisionamento (`gh repo create`) — confirmar com o usuário; se recusado, parar.
2. **Project** (quando o profile declarar `project`): `gh project view <n> --owner <org>`. Se não existir, propor criação (`gh project create` + `gh project link`) — ou prosseguir sem project avisando que o fluxo de status fica desabilitado.
3. **Campo de status**: se houver project, conferir `status_field_id` + `status_options` no profile. Se ausentes, propor provisionar o campo Status (**Backlog → Em desenvolvimento → Revisão → Concluído**) e gravar os IDs no profile (procedimento em `../config-agents-md/SKILL.md` §Fase 0.1.1).
4. **Labels**: criar as declaradas no profile se não existirem (`gh label create`).

Sem destino provisionado, **não criar issue "em algum lugar"** — o espelho sem home é dívida.

---

## Transporte (MCP vs CLI)

`transport` no profile decide a ferramenta. Regra da casa: **preferir MCP** quando existir; só cair para CLI se o MCP estiver indisponível — e **avisar** o usuário. Ver `references/transports.md`.

| Tracker | MCP (preferido) | CLI (fallback) |
|---------|-----------------|----------------|
| GitHub Issues | `github_*` (`issue_write`, `search_issues`, `list_issues`, `sub_issue_write`) | `gh issue create/edit/close`, `gh api` |
| Jira | `atlassian_jira_*` (`jira_create_issue`, `jira_search`, `jira_get_transitions`, `jira_transition_issue`, `jira_batch_create_issues`) | API REST / `jira` CLI (só se MCP indisponível) |

---

## Workflow

### Fase 0 — Contexto

1. Ler a constituição do projeto (norma em `../skills-standards.md` §4.2): `AGENTS.md` da raiz, seção de rastreamento de tarefas. O formato de tasks, as labels e o tracker declarados pelo projeto **prevalecem** sobre os defaults desta skill.
2. Ler o `tracker-profile.md` (ou `skills.config.json` → `tracking`). Se ausente, perguntar. Precedência: argumento do usuário > `AGENTS.md` > `tracker-profile.md` > `skills.config.json` > `none`.
3. Resolver o `--store` do OpenSpec, se houver: `openspec store list --json`.
4. Selecionar a change: `openspec list --json` → `--change "<name>"` (se ambíguo, perguntar).

### Fase 1 — Ler a change

```bash
openspec list --json
openspec show "<name>" --json          # metadados + status dos artefatos
```

Ler o diretório `openspec/changes/<name>/`:

- `proposal.md` — what & why (→ corpo do épico/issue principal)
- `specs/<capability>/spec.md` — delta (requirements/scenarios → stories/critérios)
- `tasks.md` — passos de implementação (→ subtasks/checklist)

### Fase 2 — Mapear

| OpenSpec | Jira / GitHub Issues |
|----------|----------------------|
| change | Épico (Jira) / Issue principal (GitHub) |
| requirement/scenario (delta) | Story / item + critérios de aceite |
| task (`domain:*`, `app:*`, `infra:*`, `interface:*`, `test:*`) | Subtask / checklist item; prefixo e `**Agent:**` viram label/descrição |

O corpo da issue segue o **template de spec** de `references/spec-issue-template.md` (Problem / Solution / User Stories / Implementation Decisions / Testing Decisions / Out of Scope), preenchido a partir dos artefatos da change. O corpo **aponta** para a constituição do projeto (`docs/` e `AGENTS.md`) pelo nome do documento e da seção, sem duplicar o conteúdo dela.

Detalhes e formato de `tasks.md`: `references/mapping-openspec-tracker.md` e `docs/templates/openspec-task-template.yaml`.

### Fase 3 — Idempotência (ID map)

Antes de criar, consultar o **ID map** (`.openspec-sync.json` ou metadados em `.openspec.yaml`):

```json
{
  "fa-517-catalogo-pos": {
    "epic": "PROJ-100",
    "stories": { "REQ-1": "PROJ-101" },
    "tasks": { "domain:entity": "PROJ-102" }
  }
}
```

- **Existe** → `update` (nunca recriar).
- **Não existe** → `create` e gravar o mapeamento.
- Sempre marcar a origem: label `openspec:<change>` + link no corpo.

### Fase 4 — Criar/atualizar

1. **GitHub** (MCP): conforme `github.mode`:
   - `single-issue` (default/recomendado) — **1 issue por change** com o corpo montado pelo template (`references/spec-issue-template.md`): Problem, Solution, User Stories, critérios de aceite do delta e as demais seções; artefatos completos em blocos `<details>` (se `embed_artifacts`) e **tasks como checklist `- [ ]`** (o GitHub rastreia progresso). Label `openspec`, `openspec:<change>`, `epic` + `priority:*` + labels de triagem declaradas pelo projeto.
   - `sub-issues` — issue principal + 1 sub-issue por task (`github_sub_issue_write`); quando o repo suportar, criar as **relações de bloqueio nativas** (`blocked by`) a partir das dependências do plano.
   - `auto` — tenta `sub-issues`; se o repo não suportar, cai para `single-issue`.
   - Fallback CLI: `gh issue create/edit` (ou `gh api`).
   - **Project + status inicial**: quando o profile declarar `project`, adicionar a issue ao board (`gh project item-add` / `addProjectV2ItemById`) e setar **Backlog** (`gh project item-edit --field-id <status_field_id> --single-select-option-id <backlog>`). Guardar o `item_id` no ID map — é ele que permite transicionar status depois.
2. **Jira** (MCP): Épico → Story(s) → **subtasks nativas** por task (`jira_batch_create_issues`/`jira_create_issue` + `additional_fields.parent`); linkar ao épico; criar as dependências como link nativo (`is blocked by`) quando o plano declarar bloqueios; setar campos (sprint/versão) se o profile declarar. Status inicial: coluna/to-do do fluxo do projeto.
3. Não duplicar: se já houver issue com a label `openspec:<change>`, atualizar.

### Ciclo de vida de status (project/board)

Quando o profile declarar `project` com `status_options`, o status segue o ciclo do projeto — **quem transiciona é quem dispara o evento**:

| Evento | De → Para | Quem |
|---|---|---|
| Change nova espelhada | → Backlog | esta skill (Fase 4) |
| `openspec-apply-change` / `opsx-apply` inicia | Backlog → Em desenvolvimento | esta skill (invocada no início do apply) |
| PR aberto ou CI validando | Em desenvolvimento → Revisão | esta skill (invocada ao abrir PR) ou o agente, reportando |
| `openspec-archive-change` | Revisão → Concluído + fechar issue | esta skill (Fase 5) |

Transição via CLI: `gh project item-edit --project-id <project.id> --id <item_id do ID map> --field-id <status_field_id> --single-select-option-id <opção>`. Sem `item_id` no ID map (issues antigas), re-obter com `gh project item-list` e filtrar pela issue. Em Jira: `jira_get_transitions` → `jira_transition_issue`.

### Fase 5 — Archive → fechar

Ao rodar `openspec archive` (ou após arquivar):

- GitHub: setar status **Concluído** no project (quando houver) e fechar issues/subtasks (`state: closed`, `state_reason: completed`).
- Jira: `jira_get_transitions` → `jira_transition_issue` para Done; fechar subtasks.
- Atualizar o ID map com o status final.

---

## Guardrails

- **Nunca** tornar o tracker a fonte de verdade — o `.md` manda; o tracker é espelho.
- **Nunca** criar duplicata: sempre checar o ID map / label `openspec:<change>`.
- **Não** mudar status no tracker sem refletir o archive no OpenSpec.
- **Respeitar a constituição do projeto** (`AGENTS.md` §rastreamento + `../skills-standards.md` §4.2): tracker, labels, formato de tasks e relação de bloqueio declarados pelo projeto prevalecem sobre os defaults desta skill.
- **Não duplicar documentos donos**: o corpo da issue aponta para `docs/` e para a change canônica pelo nome do documento e da seção, sem repetir arquitetura, contrato ou regras.
- Confirmar com o usuário antes do **primeiro** write (criação em massa).
- Se o MCP não estiver disponível e o transporte for `mcp`, **pergunte** antes de usar `gh`/API REST.
- Respeitar permissões: JSM `public=false` quando o projeto for interno (ver `JIRA_INTERNAL_ONLY_PROJECTS`).

---

## References

- `references/tracker-config.md` — schema do tracker profile e como o `config-agents-md` registra a escolha.
- `references/spec-issue-template.md` — template do corpo da issue (spec) e de onde vem cada seção.
- `references/mapping-openspec-tracker.md` — mapeamento detalhado + formato do ID map.
- `references/transports.md` — comandos MCP vs CLI por tracker.
- `../docs/templates/openspec-task-template.yaml` — formato de task.
- `../openspec-propose/SKILL.md` — geração dos artefatos da change.
- `../presets/pos/pos-tarefa/SKILL.md` — precedente Jira → OpenSpec (preset de projeto).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções entre skills.
