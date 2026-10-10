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
