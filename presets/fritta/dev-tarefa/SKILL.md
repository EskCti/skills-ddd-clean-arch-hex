---
name: dev-tarefa
stack: agnostic
description: "Tarefa Jira (FA-XXX) de qualquer módulo do fritta: proposta OpenSpec primeiro, aprovação, depois implementação — docs/ADRs atualizados"
---

Implemente a tarefa Jira <FA-XXX> (passada em <entrada fornecida pelo usuário na solicitação>) no projeto fritta, em qualquer módulo, SEM consultar GitHub (sem PR, sem review). O fluxo é SEMPRE: **proposta OpenSpec primeiro → aprovação do usuário → só então implementação**.

**Fluxo obrigatório:**

1. **Pegar a tarefa via MCP Atlassian**: `jira_get_issue` com a key (summary, description, acceptance criteria, comments, links, epic). Se a key não vier em <entrada fornecida pelo usuário na solicitação>, pergunte.

2. **Identificar o(s) módulo(s) afetado(s)** a partir da tarefa e do épico:
   - `backend/` — Kotlin/Ktor/Exposed (Clean/Hexagonal) → `backend/CLAUDE.md`
   - `frontend/` — admin web Vue 3 → `frontend/CLAUDE.md`
   - `storefront/` — cardápio público Vue 3 → `storefront/CLAUDE.md` (se existir)
   - `pos/` — app Android Kotlin → `pos/CLAUDE.md` + `docs/adr-pos-acquirer.md`
   - `mobile/` — TBD → `mobile/CLAUDE.md`
   - `infra/` — CI/CD, compose, nginx, observabilidade → `infra/CLAUDE.md`
   - Integrações externas são bounded contexts do backend (padrão WhatsApp/iFood) — Mais Delivery → `docs/adr-mais-delivery.md`
   Se o escopo for materialmente ambíguo (módulo ou comportamento), pergunte antes de propor.

3. **Contexto obrigatório (do que for afetado)**:
   - `CLAUDE.md` da raiz + `CLAUDE.md` do(s) módulo(s) tocado(s)
   - ADRs/runbooks relacionados em `docs/` (`adr-*.md`, `database*.md`, `api-reference.md`, `deploy.md`, ...) — fonte de verdade do módulo
   - Specs OpenSpec existentes (`openspec/specs/*`, `openspec/changes/*`) e `openspec/config.yaml`
   - Código existente do módulo para seguir o estilo (camadas, DI, lint)

4. **PROPOSTA OpenSpec — primeiro passo do trabalho**:
   - Crie a change com `/opsx-propose` (ou a skill `openspec-propose`), nome kebab-case derivado da tarefa (ex.: `fa-566-receber-pedidos`)
   - **Se já existir uma change correspondente** (mesma tarefa/épico), ESTENDA a change existente (atualize os artefatos dela) — só crie uma nova se o usuário preferir
   - A proposta deve cobrir: proposal (o que/porquê), specs delta, design (como, respeitando os ADRs), tasks (passos de implementação)
   - **Inclua SEMPRE uma task explícita de documentação**: "atualizar os ADRs/docs afetados e README do módulo" — se a tarefa não mudar casos de uso/contratos, a proposta deve declarar isso e a task vira "verificar que ADRs/docs não precisam de atualização"
   - Mostre o resumo da proposta (artefatos criados, decisões de design, tasks)

5. **PARAR E AGUARDAR APROVAÇÃO DA PROPOSTA**:
   - Exiba a proposta e pergunte explicitamente se aprova
   - **O resumo da proposta DEVE destacar "documentação alterada: SIM/NÃO"** e, se SIM, quais ADRs/docs/README e o impacto — você aprova sabendo se a documentação será alterada
   - NÃO implemente nada, NÃO edite código, NÃO toque em arquivos além dos artefatos da proposta
   - "Sempre tenho que aprovar" — sem aprovação, o fluxo morre aqui

6. **IMPLEMENTAÇÃO — só depois da aprovação**:
   - Rode `/opsx-apply` (ou a skill `openspec-apply-change`) na change aprovada
   - Implemente task a task seguindo as regras do módulo: backend com domínio puro (zero framework), use cases dependendo só de portas, adapters na borda, Koin ligando; web via services/i18n (nunca chamar API direto na página); POS conforme `docs/adr-pos-acquirer.md` (domínio sem Android/Retrofit)
   - Marque `- [x]` conforme cada task completa
   - Na task de documentação: atualize os ADRs/docs afetados (preservando o que não mudou) e o README do módulo quando aplicável. Tarefa implementada sem docs atualizados é entrega incompleta
   - Adicione testes para o novo comportamento (regra: caso novo sem teste = não terminado)

7. **Verificar por módulo** (testes/build no host; runtime sempre via Docker — nunca `./gradlew run`/`npm run dev` no host):
   - backend: `./gradlew :backend:test :backend:ktlintCheck` (da raiz)
   - frontend/storefront: `npm run type-check` + `npm run build` no módulo; runtime `docker compose up -d --build web|storefront`
   - pos: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk ANDROID_HOME=$HOME/Android/Sdk ./gradlew :app:assembleDebug :app:ktlintCheck :app:testDebugUnitTest --no-daemon` em `pos/app`
   - infra: `docker compose config` + smoke/validação do que mudou (nginx, workflows, compose)
   - runtime backend: `docker compose up -d --build api`

8. **Resumo + aprovação para commitar**: exiba o resumo (tasks concluídas, arquivos, testes, ADRs/docs atualizados) e PEÇA APROVAÇÃO antes do commit. Commit conventional em português (`feat(backend): ...`, `fix(web): ...`), staging seletivo (nunca `git add .`), atômico por área, branch `feature/*`/`fix/*` a partir de `develop` (Gitflow; PR para `develop`). Push só após aprovação.

**Guardrails:**
- Proposta SEMPRE antes de código; implementação SEMPRE depois de aprovação explícita da proposta
- Não commitar sem aprovação explícita (nem proposta, nem commit)
- Não alterar partes dos ADRs/docs não afetadas pela tarefa
- Todo código em inglês; strings de UI em português (i18n)
- Money sempre Long em centavos; IDs tipados; soft delete `deleted_at`
- Nunca importar repositório direto em route/controller (backend: use cases via Koin); nunca `as any` no web
- Sem comentários em código desnecessários
- Nunca commitar direto em `main`/`develop`; nunca `git add .`; nunca `git push --force` em `main`/`develop`
