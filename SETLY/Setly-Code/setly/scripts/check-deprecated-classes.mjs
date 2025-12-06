#!/usr/bin/env node
/**
 * Deprecated class checker
 * Fails (exit code 1) if any usage of legacy Tailwind classes like bg-brand-blue, text-brand-blue, border-brand-blue, focus:ring-brand-blue remain.
 * Run via: npm run lint:deprecated
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'src');
const patterns = [
  /bg-brand-blue/,
  /text-brand-blue/,
  /border-brand-blue/,
  /focus:ring-brand-blue/,
  /hover:text-brand-blue/,
  /hover:border-brand-blue/
];

let failures = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|html|scss|css|md|json)$/i.test(entry.name)) {
      const content = readFileSync(full, 'utf8');
      for (const p of patterns) {
        if (p.test(content)) {
          failures.push({ file: full, pattern: p.source });
        }
      }
    }
  }
}

walk(root);

if (failures.length) {
  console.error('\nDeprecated brand-blue class usages found (migrate to brand-primary):');
  for (const f of failures) {
    console.error(` - ${f.file} :: ${f.pattern}`);
  }
  console.error('\nRun a find/replace: brand-blue -> brand-primary');
  process.exit(1);
} else {
  console.log('✓ No deprecated brand-blue classes found.');
}
