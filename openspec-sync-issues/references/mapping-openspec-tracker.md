# Mapeamento OpenSpec ↔ Tracker + ID map

## Estrutura da change (OpenSpec)

```
openspec/
├── changes/<change>/
│   ├── proposal.md                 # what & why
│   ├── design.md                   # how (condicional)
│   ├── tasks.md                    # etapas de implementação
│   ├── specs/<capability>/spec.md  # delta (ADDED/MODIFIED requirements + scenarios)
│   └── .openspec.yaml              # metadados do CLI
└── specs/                          # specs principais (pós-archive)
```

## Mapeamento

| OpenSpec | Jira | GitHub Issues |
|----------|------|---------------|
| change | Epic | Issue principal (label `openspec`, `epic:<change>`) |
| requirement (`### Requirement:`) | Story + descrição | Item/Story |
| scenario (`#### Scenario:`) Given/When/Then | Critérios de aceite (AC) | Corpo do item |
| task (`- [ ] \`prefix\` desc (~Xh)`) | Subtask | Subtask/checklist (sub-issue) |
| `**Agent:**` + `**Prompt:**` da task | Descrição da subtask / label `agent:<nome>` | Corpo/checkbox |
| `archive` (mover para `changes/archive/`) | Transition → Done + fechar subtasks | `closed` / `completed` |

### Task → subtask

Do `tasks.md` (formato em `docs/templates/openspec-task-template.yaml`):

```markdown
- [ ] `domain:entity` Criar entidade Customer com VOs (~2h)
  - **Agent:** `Core Entity (C#)`
  - **Prompt:** "Crie a entidade Customer ..."
```

Gera subtask com:
- **título**: `domain:entity` Criar entidade Customer
- **label**: `domain:entity` (prefixo), `agent:Core Entity (C#)`
- **descrição**: o Prompt
- **estimate** (Jira): `~2h`

## GitHub — modo `single-issue` (recomendado)

Uma **issue por change**, com tudo embutido — funciona em qualquer repositório/plano (não depende de sub-issues):

1. **Corpo**: montado pelo template de `spec-issue-template.md` (Problem, Solution, User Stories, Acceptance criteria, Implementation Decisions, Testing Decisions, Out of Scope), preenchido a partir de `proposal.md` + delta da spec + `design.md`. O corpo aponta para a constituição do projeto, sem duplicá-la.
2. **Artefatos completos** em blocos colapsáveis (quando `embed_artifacts: true`):

```markdown
<details><summary>proposal.md</summary>

...conteúdo integral...

</details>
<details><summary>specs/&lt;capability&gt;/spec.md (delta)</summary>

...

</details>
<details><summary>tasks.md</summary>

...

</details>
```

3. **Tasks como checklist markdown** — o GitHub rastreia o progresso nativamente:

```markdown
### Tasks
- [ ] `domain:entity` Criar entidade Customer — `Core Entity (C#)` (~2h)
- [ ] `app:usecase` Criar CreateCustomerUseCase — `Core Use Case (C#)` (~2h)
- [ ] `interface:controller` Criar POST/GET /customers — `Backend Controller (C#)` (~2h)
```

4. **IDs/labels**: `openspec`, `openspec:<change>`, `epic` + `priority:*`.

- **Vantagens**: atômico, todo o contexto em um lugar, funciona sem sub-issues, e o checklist dá progresso.
- **Limitação**: não há assignee/estado por task individual (se precisar, usar modo `sub-issues`).
- **Fechar**: ao marcar todas as caixas (ou no `openspec archive`) → `state: closed` / `state_reason: completed`.

### GitHub — modo `sub-issues`

- 1 issue principal (change) + 1 **sub-issue por task** (`github_sub_issue_write`).
- Quando o repo suportar, criar as **relações de bloqueio nativas** (`blocked by`) a partir das dependências declaradas no plano.
- Requer suporte a sub-issues no repo; usar `mode: auto` para fell back para `single-issue`.

### Jira — subtasks nativas

- Épico → Story(s) → **Subtask por task** (`jira_batch_create_issues` / `additional_fields.parent`).
- Épico e Stories usam o corpo do template (`spec-issue-template.md`); dependências viram link nativo (`is blocked by`).
- Jira sempre suporta subtasks; aqui a granularidade fina é o padrão.

## ID map

Arquivo `.openspec-sync.json` na raiz do repo (ou ao lado do `openspec/`):

```json
{
  "<change>": {
    "tracker": "github",
    "epic": "PROJ-100",
    "stories": { "REQ-slug": "PROJ-101" },
    "tasks": { "domain:entity": "PROJ-102", "app:usecase": "PROJ-103" },
    "archived_at": null
  }
}
```

Alternativa: gravar o `epic`/keys dentro do `.openspec.yaml` da change (campo de metadados). Preferir o arquivo central para inspeção.

## Regras de sincronização

1. Chave de deduplicação: label `openspec:<change>` (GitHub) / label + summary-marker (Jira).
2. `create` só quando não há entrada no ID map **e** nenhuma issue com a label de origem.
3. `update` sempre que a change mudar (reler `openspec show "<name>" --json`).
4. `archive` → fechar tudo e gravar `archived_at`.
5. Mudança de escopo pós-sync: re-sincronizar (não apagar issues manualmente).
