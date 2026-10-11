# Enforcement de fronteiras entre camadas

**Propósito**: impedir dependências indevidas entre camadas (o domínio importar presentation, a aplicação importar adapter concreto etc.) com **lint de arquitetura**, não com separação de repositório.

## Regra de direção (canônica)

O que importa é o **sentido** da dependência:

| Camada | Pode importar | Não pode importar |
|--------|---------------|-------------------|
| `domain` | shared kernel, tipos puros | `application`, `infrastructure`, `interfaces`/`presentation`, framework |
| `application` | `domain`, shared kernel, **portas que ele mesmo define** | `infrastructure` concreta, `interfaces`/`presentation` |
| `infrastructure` | `domain`, `application` (portas), SDKs de fornecedor | `interfaces`/`presentation` |
| `interfaces` / `presentation` | `application`, DTOs, tipos de `domain` para leitura | `infrastructure` concreta (só via injeção) |

> `presentation → application` é correto; `domain → presentation` nunca.

## Escada de enforcement (do barato ao caro)

1. **Convenção e pastas** — base; não impede nada.
2. **Lint de arquitetura** — default: falha no CI, custo baixo. ← use aqui.
3. **Módulos de build** no mesmo repo (Gradle modules, `.csproj`, Cargo crates, pnpm workspaces) — o compilador bloqueia arestas não declaradas.
4. **Pacote versionado** (`shared-kernel`) — quando há reuso entre produtos.
5. **Submódulo Git** — só quando a peça tem ciclo de vida/release próprio. **Nunca só para impedir import.**

## Ferramentas por stack

### TypeScript (NestJS, Next.js, Angular, Vue)

**`dependency-cruiser`** (recomendado) ou ESLint com `eslint-plugin-boundaries` / `import/no-restricted-paths`.

`.dependency-cruiser.cjs` (regras essenciais):

```js
module.exports = {
  forbidden: [
    {
      name: 'domain-stays-pure',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/domain' },
      to: { path: '^src/modules/\\1/(application|infrastructure|interfaces|presentation)' },
    },
    {
      name: 'application-no-concrete-adapter',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/application' },
      to: { path: '^src/modules/\\1/(infrastructure|interfaces|presentation)' },
    },
    {
      name: 'interface-no-concrete-infra',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/(interfaces|presentation)' },
      to: { path: '^src/modules/\\1/infrastructure' },
    },
  ],
  options: { tsConfig: { fileName: 'tsconfig.json' } },
};
```

CI: `npx depcruise --config .dependency-cruiser.cjs src` — falha o build em violação.
> Ajuste os caminhos ao layout real do projeto; o `AGENTS.md` é o dono dele.

### Kotlin / Java (Spring)

`ArchUnit` no teste + `implementation`/`api` nos módulos Gradle.

```java
@AnalyzeClasses(packages = "com.example")
class ArchitectureTest {
  @ArchTest
  static final ArchRule domainIsPure = noClasses()
      .that().resideInAPackage("..domain..")
      .should().dependOnClassesThat()
      .resideInAnyPackage("..application..", "..infrastructure..", "..interfaces..", "org.springframework..");
}
```

### C# (.NET)

Referências de projeto (`.csproj`) numa direção só + `NetArchTest`.

```csharp
var result = Types.InAssembly(typeof(Customer).Assembly)
    .That().ResideInNamespace("Domain")
    .ShouldNot().HaveDependencyOnAny("Application", "Infrastructure", "Api");
result.IsSuccessful.Should().BeTrue();
```

### Rust (Axum)

O workspace já é o enforcement: cada crate declara só as dependências permitidas no `Cargo.toml` — `domain` não depende de framework. Complemente com `clippy`; `pub(crate)` esconde o que não precisa vazar.

## Ligação no fluxo

- Os `AGENTS.md` (raiz e módulo) registram o comando de lint de arquitetura na **Definição de pronto**.
- `config-project*` / `config-new-module*` devem incluir a configuração quando a stack suportar.
- As tasks `domain:*`/`app:*`/`infra:*`/`interface:*` passam o lint antes de fechar o épico (`quality:ci-verify`).
- Projeto que mesmo assim use camadas em submódulos: o lint continua valendo **dentro** de cada repo; o submódulo não substitui a regra.

## Referências

- `skills-standards.md` §11 — modelo de camadas e ordem inside-out.
- `config-agents-md` — regra de fronteira de módulo.
- `openspec-validate-dependencies` — valida o grafo de tasks no modo do projeto.
