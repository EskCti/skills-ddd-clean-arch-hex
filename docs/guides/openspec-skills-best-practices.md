# Melhores Práticas — OpenSpec + Skills

**Propósito**: padrões reais deste repositório para o ciclo requisito → análise → planejamento → desenvolvimento, sem comandos fictícios. Complementa [`workflow-req-to-dev.md`](workflow-req-to-dev.md) e o [troubleshooting](openspec-troubleshooting-guide.md).

## 1. A constituição do projeto vem primeiro

- **O quê** mora nos documentos donos (`docs/`: product brief, HLD, LLD, design system, ADRs, GLOSSARY); **como** mora no `AGENTS.md` (raiz e módulos). Ninguém duplica: aponta pelo nome do documento e da seção (norma em `skills-standards.md` §4.2).
- Em conflito: **decisão do usuário > constituição do projeto > defaults das skills**.
- Em projeto existente, a adoção é incremental: ler a constituição → `config-agents-md` em modo `preserve` → gaps como prefactor (ver `workflow-req-to-dev.md` § Adoção em projeto existente).

## 2. O formato das tasks é do projeto

| Modo | Como | Quando |
|------|------|--------|
| `layer-tasks` | `domain:*` → `app:*` → `infra:*` → `interface:*` → `test:*`, com Agent + Prompt, inside-out | Default da casa (DDD/Clean Architecture) |
| `vertical-slice` | Fatias completas e verificáveis, com `Blocked by` e critério de aceite próprio | Projeto que declara no `AGENTS.md` |

- Bloqueios são **grafo** (`Blocked by` com IDs), nunca texto solto; o `openspec-sync-issues` converte em relação nativa (GitHub `blocked by` / Jira "is blocked by").
- Cada épico funcional fecha com `test:unit` → `test:coverage` (≥95% em domain+application) → `test:e2e` → CI verde — ou com o DoD declarado no `AGENTS.md`, que prevalece.
- Template canônico: `docs/templates/openspec-task-template.yaml`.

## 3. O ciclo OpenSpec

```
openspec-propose → openspec-validate-dependencies → openspec-apply-change → openspec-archive-change
                   (+ openspec-sync-issues para Jira/GitHub; o archive fecha o tracker)
```

- **Planejamento não implementa**: o `propose` para nos artefatos e aguarda aprovação.
- **Apply** segue o formato declarado: inside-out (`layer`) ou a fronteira do grafo (`vertical`).
- **Archive** exige o gate de conclusão e fecha as issues — issue aberta após archive = ciclo incompleto.
- Comandos `commands/opsx-*` são atalhos que carregam a skill; a via canônica é a skill.

## 4. Result e erros

- Domínio e aplicação usam `Result` com **lista de erros**; VOs e entidades acumulam validações e combinam antes de devolver (`skills-standards.md` §5.1).
- A UI mostra a **lista completa** de mensagens, nunca só a primeira.
- Na borda HTTP, o formato da resposta de erro é decisão do projeto (ex.: problem+json); o mapa de `code` → status mora na constituição.

## 5. Qualidade

- Cobertura **≥95% em domain + application**; e2e dos fluxos críticos; gate no CI (`config-cicd-*`).
- Tasks `test:*` e o bloco de fechamento entram por épico; testes de unidade não substituem o e2e do fluxo crítico.
- O DoD do projeto (comandos reais no `AGENTS.md`) prevalece sobre os defaults.

## 6. Contexto para agentes

- `config-agents-md` gera e mantém os AGENTS.md; rode de novo quando a topologia mudar (novo BC, novo app, novo serviço).
- Projeto com AGENTS.md editorial: modo `preserve`, sem marcadores novos e sem reescrever seções.

## 7. Commits e branches

- `git-organized-commits`: commits atômicos por área, staging seletivo, **nunca** `git add .`.
- Branch com o identificador da issue/ticket quando o tracker tiver um (`feature/<id>-<slug>`).

## Referências

- `docs/guides/workflow-req-to-dev.md` — fluxo completo, requisito → entrega, e adoção em projeto existente.
- `docs/guides/openspec-troubleshooting-guide.md` — problemas comuns e correção real.
- `skills-standards.md` — convenções da casa (naming, Result, cobertura, épico pronto).
- `docs/checklists/openspec-phase-validation-checklist.md` — validação por fase.
- `docs/dashboard/openspec-progress-dashboard.md` — acompanhamento de progresso.
