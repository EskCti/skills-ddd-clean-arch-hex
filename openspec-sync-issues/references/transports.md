# Transportes — MCP vs CLI

Regra da casa: **preferir MCP** quando existir; cair para CLI apenas se o MCP estiver indisponível e **avisar** o usuário. O `transport` do tracker profile pode forçar `mcp`, `gh` ou `auto`.

## GitHub Issues

### MCP (preferido)

| Ação | Ferramenta |
|------|-----------|
| Criar/atualizar issue | `github_issue_write` (method create/update) |
| Buscar por label | `github_search_issues` / `github_list_issues` |
| Comentar | `github_add_issue_comment` |
| Sub-issue | `github_sub_issue_write` (add/remove/reprioritize) |
| Fechar | `github_issue_write` (`state: closed`, `state_reason`) |

### CLI (fallback)

```bash
gh issue create --title "<t>" --body "<b>" --label "openspec,epic:<change>"
gh issue list --label "openspec:<change>" --json number,title,state
gh issue edit <n> --add-label "priority:must"
gh issue close <n> --reason completed
```

## Jira

### MCP (preferido)

| Ação | Ferramenta |
|------|-----------|
| Criar issue | `atlassian_jira_create_issue` |
| Criar em lote | `atlassian_jira_batch_create_issues` |
| Buscar | `atlassian_jira_search` (JQL, ex.: `labels = "openspec:<change>"`) |
| Descobrir campos (epic link) | `atlassian_jira_search_fields`, `atlassian_jira_get_field_options` |
| Transições | `atlassian_jira_get_transitions` → `atlassian_jira_transition_issue` |
| Linkar épico | `atlassian_jira_link_to_epic` / `additional_fields` `epicKey` |
| Comentar | `atlassian_jira_add_comment` |

> Projetos JSM internos (`JIRA_INTERNAL_ONLY_PROJECTS`): usar `public=false` em comentários.

### CLI/API (fallback — só se o MCP falhar)

```bash
# exigir confirmação do usuário antes de usar
jira issue create -p PROJ -t Story -s "<t>" -b "<b>"
# ou curl na REST API v3
curl -u "$JIRA_USER:$JIRA_TOKEN" -X POST "$JIRA_URL/rest/api/3/issue" -d @issue.json
```

## Matriz de decisão

```
transport = mcp  → usar MCP; se indisponível, PARAR e perguntar (não trocar silenciosamente)
transport = gh   → usar CLI/API direto
transport = auto → tentar MCP; se indisponível, usar CLI e AVISAR
```

## Observações

- **GitHub**: sub-issues não são suportadas em todos os repositórios/planos — se `use_sub_issues=false`, usar checklist (`- [ ]`) no corpo do item pai.
- **Jira**: o campo de épico varia por instância; descobrir com `jira_search_fields` e registrar em `jira.epic_link_field`.
- Nunca logar tokens/segredos; usar variáveis de ambiente do MCP.
