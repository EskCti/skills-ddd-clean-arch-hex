#!/usr/bin/env node
/**
 * validate-skills.mjs
 *
 * Valida o repositório de skills:
 * 1. frontmatter (name, stack, description) de todo SKILL.md;
 * 2. links markdown relativos resolvem para arquivos existentes;
 * 3. agents/openai.yaml contém interface + display_name.
 *
 * Sem dependências externas. Uso: node scripts/validate-skills.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === '.env') continue;
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(root);

function rel(p) {
  return relative(root, p);
}

// ---------------------------------------------------------------------------
// 1. Frontmatter dos SKILL.md
// ---------------------------------------------------------------------------
const skillFiles = files.filter((f) => f.endsWith('SKILL.md'));
for (const file of skillFiles) {
  const text = readFileSync(file, 'utf8');
  if (!text.startsWith('---')) {
    errors.push(`${rel(file)}: frontmatter ausente (deve começar com ---)`);
    continue;
  }
  const end = text.indexOf('\n---', 3);
  if (end === -1) {
    errors.push(`${rel(file)}: frontmatter sem fechamento (---)`);
    continue;
  }
  const fm = text.slice(3, end);
  for (const field of ['name', 'stack', 'description']) {
    if (!new RegExp(`^${field}:\\s*\\S`, 'm').test(fm)) {
      errors.push(`${rel(file)}: frontmatter sem '${field}:'`);
    }
  }
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const dirName = file.split(sep).at(-2);
  if (nameMatch && nameMatch[1].trim() !== dirName) {
    warnings.push(`${rel(file)}: name '${nameMatch[1].trim()}' difere da pasta '${dirName}'`);
  }
}

// ---------------------------------------------------------------------------
// 2. Links markdown relativos
// ---------------------------------------------------------------------------
const mdFiles = files.filter((f) => f.endsWith('.md'));
const linkRe = /\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

for (const file of mdFiles) {
  const lines = readFileSync(file, 'utf8').split('\n');
  let inFence = false;
  lines.forEach((line, idx) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    for (const match of line.matchAll(linkRe)) {
      let target = match[1].trim();
      if (
        target === '' ||
        target.startsWith('#') ||
        target.startsWith('http://') ||
        target.startsWith('https://') ||
        target.startsWith('mailto:') ||
        target.startsWith('tel:') ||
        target.includes('://') ||
        target.includes('{{') ||
        target.includes('<') ||
        target.includes('>')
      ) {
        continue;
      }
      const pathPart = target.split('#')[0];
      if (pathPart === '') continue;
      let decoded = pathPart;
      try {
        decoded = decodeURIComponent(pathPart);
      } catch {
        // mantém o valor original
      }
      const resolved = resolve(dirname(file), decoded);
      if (!existsSync(resolved)) {
        errors.push(`${rel(file)}:${idx + 1}: link relativo quebrado -> ${target}`);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// 3. agents/openai.yaml
// ---------------------------------------------------------------------------
const yamlFiles = files.filter((f) => f.endsWith(join('agents', 'openai.yaml')));
for (const file of yamlFiles) {
  const text = readFileSync(file, 'utf8');
  if (!/^interface:\s*$/m.test(text)) {
    errors.push(`${rel(file)}: sem bloco 'interface:'`);
  }
  if (!/display_name:/.test(text)) {
    errors.push(`${rel(file)}: sem 'display_name:'`);
  }
}

// ---------------------------------------------------------------------------
// 4. Referências a scripts (inclusive dentro de blocos de código)
//    - './scripts/<nome>' inexistente  -> erro (script deste repositório)
//    -  'scripts/<nome>' inexistente  -> aviso (pode ser do projeto consumidor)
// ---------------------------------------------------------------------------
const scriptRe = /(?<![\w/-])scripts\/([\w.-]+)/g;
for (const file of mdFiles) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    for (const match of line.matchAll(scriptRe)) {
      const name = match[1];
      if (!/\.(sh|mjs|js|py)$/.test(name)) continue;
      if (name.includes('<') || name.includes('>')) continue;
      const skillDir = rel(file).split(sep)[0];
      const candidates = [
        join(dirname(file), 'scripts', name),
        join(root, skillDir, 'scripts', name),
        join(root, 'scripts', name),
      ];
      if (candidates.some((candidate) => existsSync(candidate))) continue;
      const withDotSlash = line.slice(Math.max(0, match.index - 2), match.index) === './';
      if (withDotSlash) {
        errors.push(`${rel(file)}:${idx + 1}: './scripts/${name}' não existe`);
      } else {
        warnings.push(`${rel(file)}:${idx + 1}: 'scripts/${name}' não existe neste repo (é do consumidor?)`);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------
console.log(`validate-skills: ${files.length} arquivos varridos`);
console.log(`  SKILL.md: ${skillFiles.length} | markdown: ${mdFiles.length} | openai.yaml: ${yamlFiles.length}`);

if (warnings.length > 0) {
  console.log(`\nAvisos (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}

if (errors.length > 0) {
  console.log(`\nErros (${errors.length}):`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  process.exitCode = 1;
} else {
  console.log('\nOK — nenhum erro encontrado.');
}
