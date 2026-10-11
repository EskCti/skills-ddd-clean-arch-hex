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
GitHub:     [ ] 1 issue com os .md + checklist (single-issue)  [ ] sub-issues
Triagem:    [ ] label das issues que um agente pode pegar: _____ (ex.: ready-for-agent)
Bloqueios:  [ ] relação nativa (blocked by) quando houver  [ ] texto no corpo
```

Registrar em:

- `<projectRoot>/AGENTS.md` → seção **obrigatória quando houver tracker** "Rastreamento de tarefas (Jira/GitHub)".
- `<docsPath>/planning/<projeto>/tracker-profile.md` (formato em `../openspec-sync-issues/references/tracker-config.md`).
- Opcional: `skills.config.json` → bloco `tracking`.

Precedência: argumento do usuário > `AGENTS.md` existente > `tracker-profile.md` > `skills.config.json` > `none`.

> A sincronização em si é feita pela skill `openspec-sync-issues` (change → issue, tasks → subtasks, archive → fechar). O AGENTS.md só **declara a escolha** para todo agente saber onde criar tarefas.

## Fase 0.2 — Modo de geração (preservação de formato)

Antes de escrever qualquer AGENTS.md, detecte o modo pelo estado do arquivo:

| Situação do arquivo | Modo | O que fazer |
|---------------------|------|-------------|
| Não existe | `create` | Gerar pelo template, com os marcadores `BEGIN/END:agents-md generated`. |
| Existe com marcadores | `merge-generated` | Atualizar só o conteúdo entre marcadores; seções manuais intocadas. |
| Existe sem marcadores (formato editorial do time) | `preserve` | **Não inserir marcadores**: ler o arquivo inteiro, preservar idioma, títulos, ordem e estilo das seções existentes, atualizar apenas as seções equivalentes e acrescentar as que faltarem — com diff e confirmação antes de escrever. |

No modo `preserve`, a forma (idioma, títulos, tabelas) vem do arquivo existente; o skill contribui apenas com o conteúdo que falta (comandos reais, mapa de módulos, tracker, estado atual). Nunca reescreva uma seção existente sem mostrar o diff e obter confirmação.

> A constituição do projeto (AGENTS.md existente + docs donos) **prevalece** sobre o template (norma em `../skills-standards.md` §4.2). O template é ponto de partida, não camisa de força.

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

Gerar `<projectRoot>/AGENTS.md` com o template de `references/root-agents-template.md`. Seções (obrigatórias quando aplicáveis; no modo `preserve`, acrescentar as que faltarem sem reescrever as existentes):

1. **Visão do repositório** — que tipo de monorepo é, topologia.
2. **Estado do projeto** — 3-6 linhas: o que já existe hoje e onde está a estrutura-alvo (ex.: "fundação pronta; módulos em `...`; alvo na seção 1 do `docs/lld.md`").
3. **Mapa de módulos** — tabela: caminho · stack · papel · build/test · porta.
4. **Onde cada informação mora** — dono único (norma em `skills-standards.md` §4.2): docs donos do **o quê**, AGENTS.md dono do **como**, tracker dono de specs; apontar, nunca duplicar.
5. **Assunto → Onde ler** — tabela de roteamento: assunto → documento e seção (ex.: "contrato da API → `docs/lld.md` §3"). Só quando o projeto tem docs donos.
6. **Convenções globais** — referência a `skills-standards.md` (naming, Result com lista de erros, Tailwind, cobertura ≥95%) + as convenções locais reais do projeto.
7. **Fluxo de trabalho** — requisito → análise → planejamento → desenvolvimento (ver `docs/guides/workflow-req-to-dev.md`), adaptado ao fluxo real do projeto quando ele tiver um.
8. **Skills disponíveis** — categorias (`req-*`, `analyse/*`, `core-*`, `backend-*`, `config-*`, `test-*`, `git-*`, `openspec-*`).
9. **Análise especialista (`analyse/*`)** — seção obrigatória **quando o projeto usa o fluxo `req-*`**: lista as 12 skills especialistas e a matriz de acionamento (objetivo → skill).
10. **Rastreamento de tarefas (Jira/GitHub)** — seção obrigatória **quando houver tracker**: declara o tracker (Jira e/ou GitHub), o transporte (MCP vs `gh`/API), a direção, o modo GitHub, as labels de triagem e como as dependências viram bloqueio. Vem da Fase 0.1.
11. **Definição de pronto** — os critérios e comandos reais de conclusão do projeto (testes, lint, tipos, build, validação visual), extraídos dos build files. É o DoD que as skills de apply/planejamento respeitam.
12. **Comandos transversais** — subir infra (docker compose), atualizar submódulos, rodar cobertura global.

> **Idioma**: gerar no idioma do projeto (o dos docs/AGENTS.md existentes). Sem docs, usar o idioma do time e registrar a escolha.

---

## Fase 3 — AGENTS.md por submódulo

Para cada módulo detectado, gerar `<module>/AGENTS.md` com o template de `references/submodule-agents-template.md`:

1. **Papel do módulo** — 1-2 linhas: qual serviço/camada é e do que depende.
2. **Estado atual** — o que já existe no módulo hoje e onde está a estrutura-alvo (ex.: seção 1 do LLD); código novo nasce nela.
3. **Stack e versões** — linguagem, framework, build tool (extraídos do build file).
4. **Layout / camadas** — pastas reais (ex.: `infrastructure/adapters/in/web`).
5. **Comandos** — build, test, test coverage, run local, lint/fmt.
6. **Onde está cada assunto** — tabela de roteamento: assunto → documento e seção (docs donos) e → skill/AGENTS.md, sem duplicar conteúdo (§4.2 do `skills-standards.md`).
7. **Definição de pronto** — os critérios e comandos reais de conclusão do módulo (suítes de teste, lint, tipos, build, validação visual quando houver).
8. **Convenções locais** — naming, package base, padrões específicos do módulo (incluindo sufixos de arquivo e níveis de teste, quando existirem).
9. **Skills aplicáveis** — quais skills deste repositório usar dentro deste módulo.
10. **Limites** — o que este módulo **não** deve fazer (ex.: domínio sem anotação de framework).

---

## Fase 4 — Idempotência e merge

AGENTS.md é documento vivo e frequentemente editado à mão. Ao atualizar, respeite o modo detectado na Fase 0.2:

- **`create` / `merge-generated`**: delimitar o conteúdo gerenciado pelo skill com marcadores:

  ```markdown
  <!-- BEGIN:agents-md generated -->
  ...conteúdo gerado...
  <!-- END:agents-md generated -->
  ```

  - **Nunca sobrescrever** conteúdo fora dos marcadores (seções manuais do time).
  - Se não houver marcadores e o arquivo existir: mostre um diff proposto e **peça confirmação** antes de escrever.

- **`preserve`** (arquivo editorial, sem marcadores): **não inserir marcadores**. Ler o arquivo, atualizar apenas as seções equivalentes e acrescentar as que faltarem, mantendo idioma, títulos, ordem e estilo; mostrar diff e pedir confirmação antes de escrever.
- Nunca commite automaticamente. Commit só via `git-organized-commits` quando o usuário pedir.

---

## Fase 5 — Validação

Antes de finalizar:

- [ ] Cada módulo do mapa da raiz tem AGENTS.md correspondente.
- [ ] Todos os comandos foram extraídos dos build files (ou marcados `[confirmar]`); a definição de pronto do root e de cada módulo traz os comandos reais.
- [ ] AGENTS.md raiz aponta para os AGENTS.md dos submódulos e para os docs donos (tabela "Assunto → Onde ler").
- [ ] Idioma do projeto respeitado; no modo `preserve`, seções, títulos e estilo existentes foram mantidos.
- [ ] Análise especialista (`analyse/*`) presente quando o projeto usa o fluxo `req-*`; rastreamento presente quando há tracker (com labels de triagem e bloqueio).
- [ ] "Onde cada informação mora" presente, com as convenções remetendo a `skills-standards.md` (sem duplicar).
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
