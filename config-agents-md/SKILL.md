---
name: config-agents-md
stack: agnostic
description: Gerar e manter arquivos AGENTS.md na raiz do projeto e em cada submódulo/subapp (monorepo, submodules Git, microserviços ou camadas da arquitetura). Faz a descoberta da estrutura, detecta a stack de cada módulo, mapeia comandos de build/test/run e monta um AGENTS.md raiz (mapa + convenções + fluxo) e um AGENTS.md por submódulo (stack, camadas, comandos, skills aplicáveis). Usar quando o pedido envolver criar/atualizar AGENTS.md, documentar o projeto para agentes de IA, preparar contexto de monorepo multi-stack ou de microserviços.
---

# Config AGENTS.md

Gera **AGENTS.md** (arquivo de instruções para agentes de IA no padrão opencode) na **raiz do projeto** e em **cada submódulo/subapp**, a partir da descoberta real da estrutura (não de suposições).

**Este skill produz documentação de contexto, não código de aplicação.** O AGENTS.md raiz é o *mapa*; cada AGENTS.md de submódulo é o *contrato local* daquele módulo.

---

## Quando usar

| Cenário | Ação |
|---------|------|
| Monorepo com submódulos Git (`microservices/*`, `apps/*`, `packages/*`) | AGENTS.md raiz + 1 por submódulo |
| Monorepo de workspace (TurboRepo, Cargo workspace, Gradle multi-module, .sln) | AGENTS.md raiz + 1 por pacote/módulo relevante |
| Repositório único (single app) | Apenas AGENTS.md raiz |
| Camadas da arquitetura como pastas/módulos | 1 por camada quando ela tem build/test próprios |
| Já existe AGENTS.md | **Atualizar** preservando seções manuais (merge por marcadores) |

Se o usuário não especificar o escopo, **detecte** (Fase 0) e proponha a lista de arquivos antes de escrever.

---

## Fase 0 — Descoberta da estrutura

Nunca assuma a topologia. Rode a detecção:

```bash
# 1. É monorepo? Submodules?
test -f .gitmodules && cat .gitmodules
# 2. Workspaces JS
cat package.json | grep -A20 '"workspaces"'
# 3. Gradle multi-module
cat settings.gradle 2>/dev/null || cat settings.gradle.kts 2>/dev/null
# 4. Cargo workspace
cat Cargo.toml 2>/dev/null | grep -A20 '\[workspace\]'
# 5. Solução .NET
find . -maxdepth 2 -name '*.sln'
# 6. Package managers por pasta
find . -maxdepth 3 \( -name package.json -o -name build.gradle -o -name build.gradle.kts \
  -o -name pom.xml -o -name Cargo.toml -o -name '*.csproj' -o -name pubspec.yaml \
  -o -name angular.json -o -name go.mod \) -not -path '*/node_modules/*' 2>/dev/null
```

Consultar `references/discovery.md` para o fluxo completo (submodules Git, workspaces, monorepo de microserviços).

### Regra de fronteira de módulo

Um **módulo** é candidato a AGENTS.md próprio quando **tem build/test independentes** (build file próprio, `settings.gradle` que o inclui, `workspaces` entry, `[workspace] members`, ou entrada em `.gitmodules`).

Cada submódulo de microserviço = **1 AGENTS.md**. Cada app de frontend/mobile = **1 AGENTS.md**. Camada pura (ex.: `domain/`) só ganha AGENTS.md se tiver build próprio.

---

## Fase 0.1 — Rastreamento de tarefas (Jira / GitHub) — escolha do usuário

Antes de gerar o AGENTS.md, **perguntar e registrar** onde as tarefas devem ser criadas — isso **varia por projeto** e **pode usar MCP ou CLI (`gh`/API)**.

```
Onde criar as tarefas (issues) deste projeto?
[ ] Jira         projeto/board: _____
[ ] GitHub Issues   repo: _____ (vazio = origin)
[ ] Ambos
[ ] Nenhum (só OpenSpec .md)
Transporte: [ ] MCP  [ ] CLI (gh/API)  [ ] Auto
Direção:    [ ] 1 via (OpenSpec → tracker)  [ ] 2 vias
```

Registrar em:

- `<projectRoot>/AGENTS.md` → seção **obrigatória** "Rastreamento de tarefas (Jira/GitHub)".
- `<docsPath>/planning/<projeto>/tracker-profile.md` (formato em `../openspec-sync-issues/references/tracker-config.md`).
- Opcional: `skills.config.json` → bloco `tracking`.

Precedência: argumento do usuário > `tracker-profile.md` > `skills.config.json` > `none`.

> A sincronização em si é feita pela skill `openspec-sync-issues` (change → issue, tasks → subtasks, archive → fechar). O AGENTS.md só **declara a escolha** para todo agente saber onde criar tarefas.

---

## Fase 1 — Detecção de stack por módulo

Para cada módulo, detectar stack e layout de camadas:

| Indicador | Stack | Camadas esperadas |
|-----------|-------|-------------------|
| `build.gradle(.kts)` + `id 'java'`/`kotlin` | Java/Kotlin (Spring) | hex: `infrastructure/adapters/in\|out`, domínio puro |
| `pom.xml` | Java (Maven/Spring) | idem |
| `package.json` + `@nestjs/*` | TypeScript (NestJS) | `src/modules/<bc>/{domain,application,infrastructure}` |
| `package.json` + `react`/`next` | Next.js/React | `src/` |
| `angular.json` | Angular | Clean Architecture por feature |
| `package.json` + `vue` | Vue 3 | idem |
| `Cargo.toml` | Rust (Axum) | `domain/application/infrastructure/interfaces` |
| `*.csproj` | C# (ASP.NET) | Domain/Application/Infrastructure |
| `pubspec.yaml` | Flutter | `domain/data/presentation` |
| `build.gradle(.kts)` + `com.android` | Android | `domain/data/presentation` |

Consultar `references/stack-detection.md` para comandos de extração de **build/test/run/lint/coverage** por stack.

> **Regra**: os comandos no AGENTS.md devem ser **os reais do módulo** (extraídos do build file), não genéricos. Se não encontrar, marque `[confirmar]`.

---

## Fase 2 — AGENTS.md da raiz

Gerar `<projectRoot>/AGENTS.md` com o template de `references/root-agents-template.md`. Seções obrigatórias:

1. **Visão do repositório** — que tipo de monorepo é, topologia.
2. **Mapa de módulos** — tabela: caminho · stack · papel · build/test · porta.
3. **Convenções globais** — referência a `skills-standards.md` (naming, Result com lista de erros, Tailwind, cobertura ≥95%).
4. **Fluxo de trabalho** — requisito → análise → planejamento → desenvolvimento (ver `docs/guides/workflow-req-to-dev.md`).
5. **Skills disponíveis** — categorias (`req-*`, `analyse/*`, `core-*`, `backend-*`, `config-*`, `test-*`, `git-*`, `openspec-*`).
6. **Análise especialista (`analyse/*`)** — **seção obrigatória**: lista as 12 skills especialistas e a matriz de acionamento (objetivo → skill). Garante que todo agente que ler o AGENTS.md consulte as especialistas antes de requisito/planejamento.
7. **Rastreamento de tarefas (Jira/GitHub)** — **seção obrigatória**: declara o tracker escolhido (Jira e/ou GitHub), o transporte (MCP vs `gh`/API) e a direção. Vem da Fase 0.1.
8. **Comandos transversais** — subir infra (docker compose), atualizar submódulos, rodar cobertura global.

---

## Fase 3 — AGENTS.md por submódulo

Para cada módulo detectado, gerar `<module>/AGENTS.md` com o template de `references/submodule-agents-template.md`:

1. **Papel do módulo** — 1-2 linhas: qual serviço/camada é e do que depende.
2. **Stack e versões** — linguagem, framework, build tool (extraídos do build file).
3. **Layout / camadas** — pastas reais (ex.: `infrastructure/adapters/in/web`).
4. **Comandos** — build, test, test coverage, run local, lint/fmt.
5. **Convenções locais** — naming, package base, padrões específicos do módulo.
6. **Skills aplicáveis** — quais skills deste repositório usar dentro deste módulo.
7. **Limites** — o que este módulo **não** deve fazer (ex.: domínio sem anotação de framework).

---

## Fase 4 — Idempotência e merge

AGENTS.md é documento vivo e frequentemente editado à mão. Ao atualizar:

- Delimitar conteúdo gerenciado pelo skill com marcadores:

  ```markdown
  <!-- BEGIN:agents-md generated -->
  ...conteúdo gerado...
  <!-- END:agents-md generated -->
  ```

- **Nunca sobrescrever** conteúdo fora dos marcadores (seções manuais do time).
- Se não houver marcadores e o arquivo existir: mostre um diff proposto e **peça confirmação** antes de escrever.
- Nunca commite automaticamente. Commit só via `git-organized-commits` quando o usuário pedir.

---

## Fase 5 — Validação

Antes de finalizar:

- [ ] Cada módulo do mapa da raiz tem AGENTS.md correspondente.
- [ ] Todos os comandos foram extraídos dos build files (ou marcados `[confirmar]`).
- [ ] AGENTS.md raiz aponta para os AGENTS.md dos submódulos.
- [ ] AGENTS.md raiz inclui a seção obrigatória de **Análise especialista (`analyse/*`)**.
- [ ] AGENTS.md raiz inclui a seção obrigatória de **Rastreamento de tarefas (Jira/GitHub)** com tracker + transporte.
- [ ] Convenções globais remetem a `skills-standards.md` (não duplicar regras).
- [ ] Nenhuma seção manual foi perdida no merge.

---

## Saída

```
<projectRoot>/
├── AGENTS.md                         ← mapa + convenções + fluxo
├── microservices/
│   ├── ordering/AGENTS.md            ← contrato do submódulo
│   ├── billing/AGENTS.md
│   └── product-catalog/AGENTS.md
├── apps/
│   ├── web/AGENTS.md
│   └── backend/AGENTS.md
└── packages/
    └── shared/AGENTS.md
```

> Adapte a profundidade ao que foi detectado. Não crie AGENTS.md para pastas que não sejam módulos de build.

---

## References

- `references/discovery.md` — descobrir topologia (submodules, workspaces, microserviços).
- `references/stack-detection.md` — comandos por stack e extração de build/test/run.
- `references/root-agents-template.md` — template do AGENTS.md raiz.
- `references/submodule-agents-template.md` — template do AGENTS.md de módulo.
- `../openspec-sync-issues/references/tracker-config.md` — schema do tracker profile (Jira/GitHub + MCP/CLI).
- `../docs/guides/workflow-req-to-dev.md` — fluxo requisito → análise → planejamento → desenvolvimento.
- `../docs/guides/analysis-expert-flow.md` — fluxo das skills especialistas (`analyse/*`) e matriz de acionamento.
- `../docs/guides/skills-inventory.md` — inventário das skills deste repositório.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções entre skills.
