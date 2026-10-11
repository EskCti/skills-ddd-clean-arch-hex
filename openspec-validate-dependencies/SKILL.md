---
name: openspec-validate-dependencies
stack: agnostic
description: Valida dependências entre tasks OpenSpec e o grafo de bloqueios, no formato declarado pelo projeto (camadas inside-out ou fatias verticais). Usar antes de openspec-apply-change para garantir que as tasks podem ser executadas na ordem correta.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: OpenSpec Skills Team
  version: '1.0.0'
  generatedBy: '1.2.0'
---

Valida dependências entre tasks OpenSpec e o grafo de bloqueios, **no formato que o projeto declarar** — tasks por camada (inside-out, default) ou fatias verticais.

**Propósito**: Garantir que cada task pode ser executada na ordem certa: no modo `layer`, a ordem inside-out; no modo `vertical`, a completude de cada fatia e o grafo de bloqueios. O formato vem da constituição do projeto (`AGENTS.md`; norma em `skills-standards.md` §4.2); sem declaração, vale o modo `layer`.

**Quando usar**:
- Antes de executar `openspec-apply-change` em uma change
- Durante `openspec-propose` para validar tasks geradas
- Como verificação independente de qualidade de tasks

---

## **Input**

Opcionalmente especifique um nome de change. Se omitido, o skill tentará inferir do contexto da conversa.

---

## **Steps**

### 1. **Selecionar a change**

Se um nome for fornecido, use-o. Caso contrário:
- Inferir do contexto da conversa se o usuário mencionou uma change
- Auto-selecionar se apenas uma change ativa existir
- Se ambíguo, executar `openspec list --json` para obter changes disponíveis

Sempre anunciar: "Validando dependências da change: <nome>"

### 2. **Ler a constituição e determinar o modo de validação**

Ler a constituição do projeto (norma em `../skills-standards.md` §4.2):

1. `AGENTS.md` da raiz e do módulo afetado — formato de tasks, DoD e comandos declarados pelo projeto.
2. O plano/backlog da change, quando existir — as dependências entre stories/tickets.

Determinar o **modo de validação**:

| Modo | Quando | O que valida |
|------|--------|--------------|
| `layer` (default) | Sem declaração no projeto | Ordem inside-out das tasks por camada, mapeamento Agent → skill e grafo de bloqueios |
| `vertical` | O projeto declara fatias verticais (tracer bullet) | Completude de cada fatia (caminho ponta a ponta e verificável sozinha) e grafo de bloqueios — **sem exigir ordem entre camadas de fatias diferentes** |

> Em conflito, prevalece a constituição do projeto; o default da casa é `layer`.

### 3. **Ler arquivo tasks.md**

```bash
openspec status --change "<nome>" --json
```

Verificar se `tasks.md` existe e está acessível. Se não existir:
- Reportar erro: "tasks.md não encontrado para a change <nome>"
- Sugerir executar `openspec-propose` primeiro

### 4. **Analisar estrutura de tasks**

Extrair todas as tasks do `tasks.md`:
- ID da task (prefixo, no modo `layer`)
- Fatia a que pertence (no modo `vertical`)
- Agent (quando houver)
- Dependências/bloqueios (`Blocked by`, `dependencies`)
- Status (se aplicável)

### 5. **Validar o formato declarado**

#### **Modo `layer` (default) — Regra 1: Ordem inside-out**
Verificar que tasks seguem a ordem:
```
domain:vo → domain:entity → domain:service → app:dto → app:usecase → app:query → infra:persistence → interface:controller
```

**Regra 2: Frontend Vue — ordem completa**
Para tasks Vue, verificar:
```
interface:entity → interface:usecase → interface:repository → interface:page → interface:form-web
```

**Regra 3: Mobile Android — ordem completa**
Para tasks Android, verificar:
```
interface:mobile-entity → interface:mobile-usecase → interface:mobile-repository → interface:mobile
```

**Regra 4: Testes no final**
Verificar que tasks de teste estão no final:
```
test:unit → test:e2e → test:unit-web → test:unit-mobile
```

#### **Modo `vertical` — Regra única: fatia completa e verificável**

Para cada fatia (slice):

- Corta um caminho **completo** pelas camadas que a funcionalidade exige (schema → API → interface → testes);
- É **verificável sozinha** (critério de aceite próprio, sem depender de fatia futura);
- Não mistura camadas de fatias diferentes numa mesma task;
- As Regras 1–4 acima **não se aplicam**: violações de "ordem por camada" entre fatias **não** são reportadas.

### 6. **Validar o grafo de bloqueios (todos os modos)**

Para cada task com dependência declarada (`Blocked by`, `dependencies`):

- Verificar se todas as dependências listadas existem como tasks/fatias;
- Verificar se o grafo é acíclico (nenhum ciclo de bloqueio);
- No modo `layer`, verificar se as dependências estão antes da task dependente; no modo `vertical`, apenas a ordem topológica do grafo, sem impor camadas;
- Calcular a **fronteira**: as tasks cujos bloqueios já foram concluídos são as que podem ser pegas;
- Reportar dependências faltantes, ciclos ou referências órfãs.

### 7. **Validar mapeamento Agent → Skill**

No modo `layer` (ou quando a task declarar `Agent`):
- Verificar se corresponde a um skill existente
- Verificar se a stack está correta (ex: `(C#)` para tasks backend C#)
- Reportar Agents inválidos ou skills não encontrados

### 8. **Validar prompts**

Para cada `Prompt` (quando existir):
- Verificar se é específico e direcionado
- Verificar se inclui todos os requisitos necessários
- Verificar se referencia specs corretamente

### 9. **Gerar relatório de validação**

#### **Seção A: Status Geral**
- **Modo de validação** (layer | vertical)
- Total de tasks (ou fatias) analisadas
- Dependências válidas / inválidas
- Conformidade com o **formato declarado** pelo projeto
- Fronteira atual (tasks desbloqueadas)

#### **Seção B: Problemas Identificados**
Listar cada problema com:
- ID da task (ou fatia)
- Tipo de problema
- Recomendação de correção

#### **Seção C: Checklist de Correção**
Checklist interativo para corrigir problemas:
- [ ] Reordenar tasks fora de sequência (modo `layer`)
- [ ] Completar fatias incompletas (modo `vertical`)
- [ ] Adicionar tasks faltantes
- [ ] Corrigir Agents inválidos
- [ ] Melhorar prompts genéricos

### 10. **Oferecer correções automáticas**

Para problemas comuns, oferecer correção automática:

#### **Problema: Task `interface:page` sem `interface:entity` antes (modo `layer`)**
**Correção**: Inserir task `interface:entity` antes

#### **Problema: Task `app:usecase` sem `domain:entity` antes (modo `layer`)**
**Correção**: Inserir task `domain:entity` antes

#### **Problema: Fatia sem teste (modo `vertical`)**
**Correção**: Acrescentar o critério/tarefa de teste dentro da mesma fatia

#### **Problema: Agent inválido `Backend Controller` (sem stack)**
**Correção**: Corrigir para `Backend Controller (C#)` ou stack apropriada

### 11. **Validar contra o template ou o plano do projeto**

- Modo `layer`: comparar tasks com [template padronizado](../docs/templates/openspec-task-template.yaml) — estrutura, campos obrigatórios e conformidade por camada.
- Modo `vertical`: comparar cada fatia com o [template de issue/spec](../openspec-sync-issues/references/spec-issue-template.md) e o plano do projeto — critério de aceite e verificabilidade.

---

## **Regras de Validação Detalhadas**

### **1. Prefixos Válidos por Camada**

#### **Domínio (C#)**
- `domain:vo` - Value Object
- `domain:entity` - Entity/Aggregate
- `domain:service` - Domain Service

#### **Aplicação (C#)**
- `app:dto` - Data Transfer Object
- `app:usecase` - Use Case
- `app:query` - Query CQRS

#### **Infraestrutura (C#)**
- `infra:persistence` - Repository implementation
- `interface:controller` - HTTP Controller

#### **Frontend Vue**
- `interface:entity` - Frontend Entity
- `interface:usecase` - Frontend Use Case
- `interface:repository` - Frontend Repository
- `interface:page` - Page/View
- `interface:form-web` - Form

#### **Mobile Android**
- `interface:mobile-entity` - Mobile Entity
- `interface:mobile-usecase` - Mobile Use Case
- `interface:mobile-repository` - Mobile Repository
- `interface:mobile` - Screen

#### **Testes**
- `test:unit` - Unit Tests
- `test:e2e` - E2E Tests
- `test:unit-web` - Frontend Tests
- `test:unit-mobile` - Mobile Tests

### **2. Ordem Obrigatória (modo `layer`)**

```
1.  domain:vo
2.  domain:entity
3.  domain:service
4.  app:dto
5.  app:usecase
6.  app:query
7.  infra:persistence
8.  interface:controller
9.  interface:entity (Vue)
10. interface:usecase (Vue)
11. interface:repository (Vue)
12. interface:page (Vue)
13. interface:form-web (Vue)
14. interface:mobile-entity (Android)
15. interface:mobile-usecase (Android)
16. interface:mobile-repository (Android)
17. interface:mobile (Android)
18. test:unit
19. test:e2e
20. test:unit-web
21. test:unit-mobile
```

### **3. Mapeamento Agent → Skill**

#### **Backend C#**
- `Core Value Object (C#)` → `core-value-object-cs`
- `Core Entity (C#)` → `core-entity-cs`
- `Core Domain Service (C#)` → `core-domain-service-cs`
- `Core DTO (C#)` → `core-dto-cs`
- `Core Use Case (C#)` → `core-use-case-cs`
- `Core Query CQRS (C#)` → `core-query-cqrs-cs`
- `Backend Data (C#)` → `backend-data-cs`
- `Backend Controller (C#)` → `backend-controller-cs`

#### **Frontend Vue**
- `Frontend Entity (Vue)` → `frontend-entity-vue`
- `Frontend UseCase (Vue)` → `frontend-usecase-vue`
- `Frontend Repository (Vue)` → `frontend-repository-vue`
- `Frontend Page (Vue)` → `frontend-page-vue`
- `Frontend Form (Vue)` → `frontend-form-vue`

#### **Mobile Android**
- `Mobile Entity (Android)` → `mobile-entity-android`
- `Mobile UseCase (Android)` → `mobile-usecase-android`
- `Mobile Repository (Android)` → `mobile-repository-android`
- `Mobile Screen (Android)` → `mobile-screen-android`
- `Mobile Form (Android)` → `mobile-form-android`

#### **Testes**
- `Unit Tests (C#)` → `test-unit-cs`
- `E2E Tests (C#)` → `test-e2e-cs`
- `Unit Tests (TypeScript)` → `test-unit`
- `Unit Tests (Kotlin)` → `test-unit-kt`

---

## **Exemplos de Validação**

### **Exemplo 1: Tasks em ordem correta**
```markdown
- [ ] `domain:vo` PasswordVO (~1h)
  - **Agent:** `Core Value Object (C#)`
  
- [ ] `domain:entity` User (~2h)
  - **Agent:** `Core Entity (C#)`
  
- [ ] `app:usecase` LoginUseCase (~3h)
  - **Agent:** `Core Use Case (C#)`
```

**Resultado**: ✅ Válido - Segue ordem inside-out

### **Exemplo 2: Task `interface:page` sem `interface:entity`**
```markdown
- [ ] `interface:page` LoginView (~2h)
  - **Agent:** `Frontend Page (Vue)`
```

**Resultado**: ❌ Inválido - Falta `interface:entity` antes

**Recomendação**: Adicionar task `interface:entity` antes de `interface:page`

### **Exemplo 3: Agent sem stack especificada**
```markdown
- [ ] `interface:controller` AuthController (~2h)
  - **Agent:** `Backend Controller`
```

**Resultado**: ❌ Inválido - Agent deve incluir stack: `Backend Controller (C#)`

**Recomendação**: Corrigir para `Backend Controller (C#)`

---

## **Integração com OpenSpec Workflow**

### **Integração com `openspec-propose`**
Executar automaticamente após gerar `tasks.md`:
1. `openspec-propose "ep-001-auth"`
2. `openspec-validate-dependencies "ep-001-auth"`
3. Corrigir problemas identificados
4. Continuar com `openspec-apply-change`

### **Integração com `openspec-apply-change`**
Executar como pré-requisito:
1. `openspec-validate-dependencies "ep-001-auth"`
2. Se válido: `openspec-apply-change "ep-001-auth"`
3. Se inválido: Reportar problemas e sugerir correções

> No modo `vertical`, a validação cobre a **completude das fatias e o grafo de bloqueios**; a ordem por camada não se aplica e violações desse tipo não são reportadas.

### **Validação em CI/CD**
Incluir no pipeline:
```yaml
steps:
  - name: Validate OpenSpec dependencies
    run: |
      openspec validate-dependencies --change "$CHANGE_NAME"
```

---

## **Output**

### **Se válido**
```
✅ Validação concluída com sucesso!

Change: ep-001-auth
Modo de validação: layer (default da casa)
Tasks analisadas: 12
Conformidade com o formato declarado: 100%
Dependências válidas: 12/12

Recomendação: Pronto para openspec-apply-change
```

### **Se inválido**
```
❌ Problemas identificados na change ep-001-auth

Problemas (3):
1. Task `interface:page` (linha 45) sem `interface:entity` antes
   → Recomendação: Adicionar task `interface:entity` antes

2. Agent `Backend Controller` (linha 32) sem stack especificada
   → Recomendação: Corrigir para `Backend Controller (C#)`

3. Task `app:usecase` (linha 28) sem `domain:entity` antes
   → Recomendação: Adicionar task `domain:entity` antes

Checklist de correção:
- [ ] Reordenar tasks conforme ordem Clean Architecture
- [ ] Corrigir Agents para incluir stack
- [ ] Adicionar tasks faltantes

Execute as correções e valide novamente antes de openspec-apply-change.
```

---

## **Referências**

- [Template Padronizado para Tasks OpenSpec](../docs/templates/openspec-task-template.yaml)
- [Skills Standards](../skills-standards.md)
- [Tutorial 04 - Ciclo Completo OpenSpec](../docs/tutorial/04-ciclo-completo-openspec.md)
- [Exemplos Stack C# + Vue + Android](../docs/templates/openspec-stack-cs-vue-android-example.md)