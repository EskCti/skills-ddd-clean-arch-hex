# Stack detection — comandos por stack

Para cada módulo, extraia os comandos **reais** do build file. Abaixo, por stack, o que inspecionar e os comandos normalmente esperados.

## Java / Kotlin (Gradle — Spring Boot)

Inspecionar: `build.gradle(.kts)`, `settings.gradle`, `gradlew`, `Dockerfile`, `application*.yml`.

```bash
# versão de linguagem / toolchain
grep -E "languageVersion|sourceCompatibility|jvmToolchain" build.gradle*
# tasks relevantes
grep -E "(jacoco|bootJar|test|flyway)" build.gradle*
```

| Ação | Comando |
|------|---------|
| Build | `./gradlew build` |
| Testes | `./gradlew test` |
| Cobertura | `./gradlew jacocoTestReport` (+ gate no CI) |
| Rodar local | `./gradlew bootRun` |
| Migrations | Flyway via `flyway.conf` / `./gradlew flywayMigrate` |
| Formatar | (se configurado) `./gradlew spotlessApply` |

Layout hexagonal típico: `src/main/java/<base>/<modulo>/infrastructure/adapters/{in,out}` + domínio puro.

## Java / Kotlin (Maven)

| Ação | Comando |
|------|---------|
| Build | `./mvnw package` |
| Testes | `./mvnw test` |
| Rodar | `./mvnw spring-boot:run` |

## TypeScript — NestJS (backend)

Inspecionar: `package.json` scripts, `nest-cli.json`.

| Ação | Comando |
|------|---------|
| Dev | `npm run start:dev` |
| Build | `npm run build` |
| Testes | `npm test` |
| Cobertura | `npm run test:cov` |
| Lint | `npm run lint` |

Layout: `src/modules/<bc>/{domain,application,infrastructure}` + `packages/shared` (Result).

## TypeScript — Next.js / React

| Ação | Comando |
|------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| E2E | `npx playwright test` |

## Angular

| Ação | Comando |
|------|---------|
| Dev | `npm start` (`ng serve`) |
| Build | `npm run build` |
| Testes | `npm test` |
| Lint | `npm run lint` |

## Vue 3

| Ação | Comando |
|------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Testes | `npm run test` |
| Lint | `npm run lint` |

## Rust (Axum + sqlx)

| Ação | Comando |
|------|---------|
| Build | `cargo build` |
| Testes | `cargo test --workspace` |
| Cobertura | `cargo llvm-cov` |
| Lint | `cargo clippy` |
| Formatar | `cargo fmt` |
| Migrations | `sqlx migrate run` |

Layout: `crates/api/src/modules/<bc>/{domain,application,infrastructure,interfaces}`.

## C# (.NET)

| Ação | Comando |
|------|---------|
| Build | `dotnet build` |
| Testes | `dotnet test` |
| Cobertura | `dotnet test --collect:"XPlat Code Coverage"` |
| Rodar | `dotnet run --project <projeto>` |

Layout: `Domain/ Application/ Infrastructure/`.

## Flutter

| Ação | Comando |
|------|---------|
| Deps | `flutter pub get` |
| Rodar | `flutter run` |
| Testes | `flutter test` |
| Analisar | `flutter analyze` |

Layout: `lib/features/<feature>/{domain,data,presentation}`.

## Android (Gradle + Compose)

| Ação | Comando |
|------|---------|
| Build | `./gradlew assembleDebug` |
| Testes unit | `./gradlew testDebugUnitTest` |
| Testes instrumentados | `./gradlew connectedDebugAndroidTest` |
| Lint | `./gradlew lint` |

---

## Extração automática sugerida

```bash
# scripts reais
[ -f package.json ] && node -e "console.log(require('./package.json').scripts)"
# includes gradle
grep -E "^include" settings.gradle* 2>/dev/null
# members cargo
grep -A20 '\[workspace\]' Cargo.toml 2>/dev/null
# portas
grep -rE "server\.port|PORT|listen\(" src 2>/dev/null | head
```

Se um comando não puder ser confirmado, escreva no AGENTS.md com a marca `[confirmar]` em vez de inventar.

## Mapeamento stack → skills do repositório

| Stack | Skills de núcleo/backend |
|-------|--------------------------|
| TypeScript | `core-*`, `backend-controller`, `backend-prisma-data`, `config-prisma` |
| Kotlin/Java | `core-*-kt`/`-java`, `backend-data-kt/-java`, `backend-controller-kt/-java`, `config-jpa-kt/-java` |
| C# | `core-*-cs`, `backend-data-cs`, `backend-controller-cs`, `config-efcore-cs` |
| Rust | `core-*-rs`, `backend-data-rs`, `backend-controller-rs`, `config-sqlx-rs` |
| Angular/Vue/Leptos | `frontend-entity-*`, `frontend-usecase-*`, `frontend-repository-*`, `frontend-page-*`, `frontend-form-*` |
| Flutter/Android | `mobile-entity-*`, `mobile-usecase-*`, `mobile-repository-*`, `mobile-screen-*`, `mobile-form-*` |
