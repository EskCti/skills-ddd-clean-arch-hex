# Tracker Profile — escolha de Jira/GitHub e transporte

Onde criar as tarefas e como acessá-las. Definido **na criação do AGENTS.md** (`config-agents-md`) e/ou em `<docsPath>/planning/<projeto>/tracker-profile.md`.

## Schema

```yaml
tracking:
  trackers: [github]          # jira | github | both | none
  transport: auto             # mcp | gh | auto
  direction: one-way          # one-way | two-way
  id_map: .openspec-sync.json

  github:
    repo: org/repo            # vazio = derivar de `git remote get-url origin`
    labels: [openspec]
    mode: single-issue        # single-issue | sub-issues | auto
    embed_artifacts: true     # embutir proposal/spec/design/tasks no corpo (blocos <details>)
    use_sub_issues: false     # só relevante quando mode: sub-issues
    triage_labels: [ready-for-agent]  # labels das issues que um agente pode pegar
    native_blocking: auto     # auto | true | false — relação nativa de bloqueio quando o repo suportar
    project: ""               # GitHub Projects v2 (opcional)

  jira:
    project_key: PROJ
    issue_type: Story         # tipo padrão das stories
    epic_issue_type: Epic
    epic_link_field: ""       # ex.: customfield_10011 (Jira Cloud) — descoberto com jira_search_fields
    labels: [openspec]
    triage_labels: [ready-for-agent]
    blocking_link_type: "Blocks"   # link type das dependências (ex.: "Blocks" / "Cloners")
    components: []
    sprint_id: ""             # opcional
```

### Valores

| Campo | Aceita | Efeito |
|-------|--------|--------|
| `trackers` | `jira`, `github`, `both`, `none` | Onde espelhar. `none` = não sincroniza (só `.md`). |
| `transport` | `mcp`, `gh`, `auto` | `mcp` = MCP Atlassian/GitHub; `gh` = CLI/API. `auto` = MCP se disponível, senão CLI (avisando). |
| `direction` | `one-way`, `two-way` | `one-way` = OpenSpec → tracker (recomendado para começar). `two-way` = também status/comentários do tracker → OpenSpec. |
| `github.mode` | `single-issue`, `sub-issues`, `auto` | `single-issue` = 1 issue por change com os `.md` embutidos + checklist de tasks (funciona sempre). `sub-issues` = 1 issue + subtasks (exige suporte a sub-issues). `auto` = tenta sub-issues, cai para single-issue. |
| `github.triage_labels` / `jira.triage_labels` | lista | Labels das issues que um agente pode pegar sem triagem (ex.: `ready-for-agent`). |
| `github.native_blocking` | `auto`, `true`, `false` | Usa a relação nativa de bloqueio (`blocked by`) quando o repo suportar; senão, texto no corpo. |
| `jira.blocking_link_type` | string | Link type usado para as dependências entre issues (ex.: `Blocks`). |

## Onde fica registrado

1. **`AGENTS.md` raiz** — seção "Rastreamento de tarefas (Jira/GitHub)" gerada por `config-agents-md`, para todo agente ver a escolha (fonte preferida, porque é o que o agente lê primeiro).
2. **`<docsPath>/planning/<projeto>/tracker-profile.md`** — decisão por projeto (como `delivery-profile.md`); complementa com os campos que o AGENTS.md resume.
3. **`skills.config.json`** → bloco `tracking` (preferência de projeto/repo de skills).

> Precedência: argumento explícito do usuário > `AGENTS.md` (seção de rastreamento) > `tracker-profile.md` > `skills.config.json` > `none`.

## Como o `config-agents-md` coleta

Na Fase 0 (descoberta) ou Fase 2 (geração do AGENTS.md), o skill pergunta/registra:

```
Rastreamento de tarefas deste projeto:
[ ] Jira        projeto/board: _____
[ ] GitHub      repo: _____ (vazio = origin)
[ ] Ambos
[ ] Nenhum (só OpenSpec .md)
Transporte: [ ] MCP  [ ] CLI (gh/API)  [ ] Auto
Direção:    [ ] 1 via (OpenSpec → tracker)  [ ] 2 vias
```

E injeta no `AGENTS.md` raiz a seção correspondente (ver `config-agents-md/references/root-agents-template.md`).
