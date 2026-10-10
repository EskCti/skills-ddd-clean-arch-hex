# Template — AGENTS.md de submódulo

> Copie o bloco abaixo para `<module>/AGENTS.md` e substitua os `<>` com o que foi detectado no módulo. Envolva o conteúdo gerenciado pelo skill com os marcadores.

```markdown
<!-- BEGIN:agents-md generated -->
# AGENTS.md — <nome-do-módulo>

> Contrato local deste módulo. Para contexto do monorepo, leia o `AGENTS.md` da raiz (`<caminho relativo>`).

## Papel

<1-2 frases: qual serviço/camada é, que responsabilidade tem e do que depende (ex.: depende do Postgres e do serviço `product-catalog`).>

- **Tipo**: <microserviço | backend | app frontend | app mobile | pacote/core compartilhado>
- **Repositório**: <url do submódulo, se for submodule Git>

## Stack

| Item | Valor |
|------|-------|
| Linguagem | <Java 25 / Kotlin / TypeScript / Rust / C# / Dart> |
| Framework | <Spring Boot 4 / NestJS / Axum / ASP.NET / Flutter> |
| Build tool | <Gradle / Maven / npm / Cargo / dotnet / flutter> |
| Persistência | <JPA+Flyway+Postgres / Prisma / sqlx+MongoDB / EF Core / ...> |
| Base package / módulo | <com.eskcti.algashop.ordering> |

## Layout / camadas

```
<module>/
└── src/main/...
    └── <base>/
        ├── domain/            ← regras puras (sem framework)
        ├── application/       ← use cases, DTOs
        ├── infrastructure/
        │   ├── adapters/in/   ← web (controllers), listeners
        │   └── adapters/out/  ← persistence, clients HTTP, notification
        └── config/            ← beans, auditing
```

> <Liste as pastas/adapters reais, não genéricas.>

## Comandos

| Ação | Comando |
|------|---------|
| Build | `<./gradlew build>` |
| Testes | `<./gradlew test>` |
| Cobertura | `<./gradlew jacocoTestReport>` |
| Rodar local | `<./gradlew bootRun>` |
| Migrations | `<flyway / sqlx migrate run>` |
| Lint/Format | `<comando ou "n/a">` |

## Convenções locais

- <Ex.: domínio sem anotação de framework; `@RestController` só em `adapters/in/web`.>
- <Ex.: Result com lista de erros; contratos de API versionados.>
- <Ex.: nomes de tabelas/migrations, perfis Spring (`docker`, `test`).>

## Skills aplicáveis

| Camada | Skills |
|--------|--------|
| Domínio | `<core-entity-*, core-value-object-*, core-domain-service-*>` |
| Aplicação | `<core-use-case-*, core-dto-*, core-query-cqrs-*>` |
| Infra | `<backend-data-*, config-jpa-* / config-sqlx-rs / config-efcore-cs>` |
| Interface | `<backend-controller-*>` |
| Qualidade | `<test-unit-*, test-e2e-*>` |

## Limites

- <O que este módulo NÃO deve fazer (ex.: não acessar banco de outro serviço diretamente).>
- <Diretórios gerados/ignorados: `build/`, `.gradle/`.>
<!-- END:agents-md generated -->
```

## Notas de geração

- Substitua `<caminho relativo>` do topo pelo caminho real até o AGENTS.md raiz (ex.: `../../AGENTS.md`).
- Para módulos de camada (pacotes `core`/`shared`), omita as seções de porta/Docker e foque em API pública do pacote e regras de dependência.
- Para apps de frontend/mobile, troque "Layout / camadas" pelo layout de features e os comandos pelos do framework.
- Sempre use comandos reais extraídos do build file; se incerto, `[confirmar]`.
