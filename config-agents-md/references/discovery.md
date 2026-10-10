# Discovery — descobrir a topologia do repositório

Objetivo: identificar **quais são os módulos** que merecem um AGENTS.md próprio.

## 1. Submodules Git

Se existir `.gitmodules`, cada entrada é um módulo independente (microserviço, app, pacote ou docs).

```bash
cat .gitmodules
# campos úteis: path (onde vive), url (qual repositório), branch
```

- `path = microservices/ordering` → módulo em `microservices/ordering/`.
- Ignorar submódulos de documentação/skills (ex.: `esk_docs`, `.opencode/skills`) como módulos de código, a menos que o usuário peça.
- Após atualizar ponteiros, os arquivos do submódulo mudam; rode a detecção **depois** de `git submodule update --init --recursive`.

## 2. Workspaces JavaScript / TypeScript

```bash
cat package.json | grep -A30 '"workspaces"'
# pnpm-workspace.yaml
cat pnpm-workspace.yaml 2>/dev/null
# TurboRepo
cat turbo.json 2>/dev/null
```

Cada glob em `workspaces` (ex.: `apps/*`, `packages/*`) gera módulos.

## 3. Gradle multi-module

```bash
cat settings.gradle 2>/dev/null || cat settings.gradle.kts 2>/dev/null
# linhas relevantes: include 'modulo-a', 'modulo-b'
```

Cada `include` é um módulo Gradle.

## 4. Cargo workspace

```bash
grep -A30 '\[workspace\]' Cargo.toml
# members = ["crates/*"]
```

Cada `member` é um crate/módulo.

## 5. Solução .NET

```bash
find . -maxdepth 2 -name '*.sln'
# e os projetos referenciados (*.csproj)
```

Cada `.csproj` da solução é um módulo.

## 6. Detecção genérica por build file

```bash
find . -maxdepth 4 \( -name package.json -o -name build.gradle -o -name build.gradle.kts \
  -o -name pom.xml -o -name Cargo.toml -o -name '*.csproj' -o -name pubspec.yaml \
  -o -name angular.json -o -name go.mod \) \
  -not -path '*/node_modules/*' -not -path '*/build/*' -not -path '*/.gradle/*' 2>/dev/null
```

## Árvore de decisão

```
Existe .gitmodules?
├── sim → cada path relevante é 1 módulo (microserviço/app/pacote)
└── não
    ├── workspaces/pnpm/turbo? → cada glob = módulos
    ├── settings.gradle/include? → cada include = módulo
    ├── Cargo [workspace]? → cada member = crate
    ├── *.sln? → cada *.csproj = módulo
    └── nenhum → repositório único → só AGENTS.md raiz
```

## Fronteira de módulo (regra)

Um diretório só vira módulo com AGENTS.md se tiver **build/test independentes**. Camadas (ex.: `domain/`) normalmente **não** têm build próprio → não geram AGENTS.md.

## Classificação do papel do módulo

Ao listar cada módulo, classifique:

| Papel | Sinais |
|-------|--------|
| Microserviço/backend | `build.gradle`+spring, `pom.xml`, `@nestjs`, `*.csproj` web |
| Frontend web | `angular.json`, `next.config`, `vite.config` |
| Mobile | `pubspec.yaml`, `build.gradle`+com.android |
| Pacote/core compartilhado | nome `shared`, `core`, `common`, library |
| BFF/agregador | nome `bff`, `gateway` |
| Infra/docs | `docker*`, `docs`, `scripts`, `.github` → normalmente sem AGENTS.md de módulo |
