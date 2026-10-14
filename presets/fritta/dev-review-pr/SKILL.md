---
name: dev-review-pr
stack: agnostic
description: "Review de PR (GitHub) de qualquer módulo do fritta + Jira: proposta OpenSpec das correções primeiro, aprovação, depois implementação — docs/ADRs atualizados"
---

Trate a review do PR <NÚMERO> (passado em <entrada fornecida pelo usuário na solicitação>) do projeto fritta, em qualquer módulo, usando MCP Atlassian e MCP GitHub. O fluxo é SEMPRE: **proposta OpenSpec das correções primeiro → aprovação do usuário → só então implementação**.

**Fluxo obrigatório:**

1. **Pegar o PR via MCP GitHub**: `pull_request_read` com `get` (título, descrição, base/head, estado) + `get_review_comments` (comentários inline por linha) + `get_reviews` (estado: APPROVED/CHANGES_REQUESTED/COMMENTED) + `get_comments` (comentários gerais) + `get_files` (diff e módulos tocados). Liste TUDO, incluindo threads resolvidas e adendos.

2. **Tarefa Jira associada via MCP Atlassian**: identifique a key no título/descrição/branch do PR (ex.: FA-566) e busque com `jira_get_issue` (critérios de aceite, contexto, comments). Se não houver key, pergunte ao usuário.

3. **Identificar o(s) módulo(s) afetado(s)** pelo diff — `backend/` (Kotlin/Ktor), `frontend/` (admin Vue), `storefront/` (cardápio Vue), `pos/` (Android Kotlin), `mobile/` (TBD), `infra/` — e ler o contexto obrigatório: `CLAUDE.md` da raiz + do(s) módulo(s), ADRs/runbooks relacionados em `docs/` (ex.: `docs/adr-pos-acquirer.md`, `docs/adr-mais-delivery.md`), specs OpenSpec da change existente e o código do módulo. Mais Delivery → `docs/adr-mais-delivery.md`.

4. **Classificar os comentários da review**:
   - ✅ **Partes aprovadas** (o revisor elogiou/validou): NÃO ALTERAR NADA — listar explicitamente na proposta
   - 🔴 **Bugs/correções**: entram na proposta
   - 🟠/🟡 **Melhorias/observações**: decidir com o usuário se entram

5. **PROPOSTA OpenSpec — primeiro passo do trabalho**:
   - Crie a change com `/opsx-propose` (ou a skill `openspec-propose`), nome kebab-case derivado da review (ex.: `fix-pr-769-review`)
   - **Se já existir uma change correspondente** (a change que originou o PR, ex.: `fa-566-receber-pedidos`), ESTENDA a change existente (atualize os artefatos dela) — só crie uma nova se o usuário preferir
   - A proposta deve cobrir: proposal (o que/porquê, com a classificação da review), specs delta, design (como, respeitando os ADRs), tasks (uma por correção, incluindo o teste de regressão de cada uma)
   - **Inclua SEMPRE uma task explícita de documentação**: "atualizar os ADRs/docs afetados e README do módulo se as correções mudarem casos de uso/contratos" — se nenhuma correção mudar, a proposta deve declarar isso e a task vira "verificar que ADRs/docs não precisam de atualização"
   - Mostre o resumo da proposta (artefatos criados, decisões de design, tasks mapeadas para os comentários da review)

6. **PARAR E AGUARDAR APROVAÇÃO DA PROPOSTA**:
   - Exiba a proposta e pergunte explicitamente se aprova
   - **O resumo da proposta DEVE destacar "documentação alterada: SIM/NÃO"** e, se SIM, quais ADRs/docs/README e o impacto — você aprova sabendo se a documentação será alterada
   - NÃO implemente nada, NÃO edite código, NÃO toque em arquivos além dos artefatos da proposta
   - "Sempre tenho que aprovar" — sem aprovação, o fluxo morre aqui

7. **IMPLEMENTAÇÃO — só depois da aprovação**:
   - Rode `/opsx-apply` (ou a skill `openspec-apply-change`) na change aprovada
   - Implemente task a task seguindo os ADRs e as regras do módulo (Clean/Hexagonal, domínio puro, portas no domínio, adapters na borda, DI; web via services/i18n). Cada bug corrigido DEVE ganhar teste de regressão (ex.: "estado X → não chama a porta Y")
   - Marque `- [x]` conforme cada task completa
   - Na task de documentação: se houve mudança de casos de uso/contratos, atualize os ADRs/docs e README — preservando o que não mudou; se não houve, declare explicitamente e justifique

8. **Verificar por módulo** (testes/build no host; runtime sempre via Docker):
   - backend: `./gradlew :backend:test :backend:ktlintCheck` (da raiz)
   - frontend/storefront: `npm run type-check` + `npm run build` no módulo; runtime `docker compose up -d --build web|storefront`
   - pos: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk ANDROID_HOME=$HOME/Android/Sdk ./gradlew :app:assembleDebug :app:ktlintCheck :app:testDebugUnitTest --no-daemon` em `pos/app`
   - infra: `docker compose config` + smoke/validação do que mudou
   - Validações práticas extras quando a review apontar bug de build/config (ex.: propriedade vazia, URL inválida)

9. **Comentar no PR (cobertura)**: via MCP GitHub `add_issue_comment`, publique tabela de cobertura: suíte → testes → qual ponto da review cobre. Responda/replique threads dos comentários corrigidos quando fizer sentido.

10. **Resumo + aprovação para commit/push**: exiba o resumo (correções, testes, ADRs/docs atualizados, partes aprovadas intactas) e PEÇA APROVAÇÃO. Commit conventional em português (`fix(backend): ...`, `fix(pos): ...`), staging seletivo (nunca `git add .`), atômico por área. Push na MESMA branch do PR (head do PR). Push só após aprovação.

**Guardrails:**
- Proposta SEMPRE antes de código; implementação SEMPRE depois de aprovação explícita da proposta
- NUNCA alterar as partes que o revisor aprovou explicitamente
- Não commitar sem aprovação explícita (nem proposta, nem commit/push)
- Não alterar partes dos ADRs/docs não afetadas
- Todo código em inglês; strings de UI em português (i18n)
- Money sempre Long em centavos; IDs tipados; soft delete `deleted_at`
- Nunca commitar direto em `main`/`develop`; nunca `git add .`; nunca `git push --force` em `main`/`develop`
- Sem comentários em código desnecessários
