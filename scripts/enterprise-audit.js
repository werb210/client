#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const cwd = process.cwd();

const results = {
  eslint: { ok: false, errors: 0, warnings: 0, message: '' },
  typecheck: { skipped: false, ok: false, errors: 0, message: '' },
  audit: { ok: false, critical: 0, high: 0, moderate: 0, low: 0, message: '' },
  depcheck: { ok: false, unusedDeps: [], unusedDevDeps: [], message: '' },
  madge: { ok: false, circular: [], message: '' },
  build: { skipped: false, ok: false, message: '' },
  bundle: { skipped: false, ok: false, artifacts: [], message: '' },
};

function section(title) {
  console.log(`\n--- ${title} ---`);
}

function run(command, options = {}) {
  try {
    const output = execSync(command, { stdio: 'pipe', encoding: 'utf8', ...options });
    return { ok: true, output };
  } catch (error) {
    const output = `${error.stdout || ''}${error.stderr || ''}`.trim();
    return { ok: false, output, error };
  }
}

function parseEslintCounts(text) {
  const match = text.match(/(\d+)\s+problems?\s*\((\d+)\s+errors?,\s*(\d+)\s+warnings?\)/i);
  if (match) {
    return { errors: Number(match[2]), warnings: Number(match[3]) };
  }
  return { errors: 0, warnings: 0 };
}

function parseAuditSeverities(payload) {
  const summary = { critical: 0, high: 0, moderate: 0, low: 0 };
  const metadata = payload?.metadata?.vulnerabilities;
  if (metadata) {
    summary.critical = metadata.critical || 0;
    summary.high = metadata.high || 0;
    summary.moderate = metadata.moderate || 0;
    summary.low = metadata.low || 0;
    return summary;
  }

  const vulnerabilities = payload?.vulnerabilities || {};
  Object.values(vulnerabilities).forEach((entry) => {
    if (!entry || !entry.severity) return;
    const sev = entry.severity;
    if (summary[sev] !== undefined) summary[sev] += 1;
  });
  return summary;
}

function getPackageScripts() {
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) return {};
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.scripts || {};
}

console.log('=== ENTERPRISE REPOSITORY AUDIT ===');

section('CHECK 1: ESLINT');
{
  const res = run('npx eslint . --ext .ts,.tsx,.js,.jsx');
  const counts = parseEslintCounts(res.output || '');
  results.eslint.ok = res.ok;
  results.eslint.errors = counts.errors;
  results.eslint.warnings = counts.warnings;
  results.eslint.message = res.ok ? 'ESLint completed.' : 'ESLint reported issues.';
  console.log(results.eslint.message);
  if (res.output) console.log(res.output);
}

section('CHECK 2: TYPESCRIPT STRICT CHECK');
{
  const hasTsconfig = fs.existsSync(path.join(cwd, 'tsconfig.json'));
  if (!hasTsconfig) {
    results.typecheck.skipped = true;
    results.typecheck.message = 'Skipped: tsconfig.json not found.';
    console.log(results.typecheck.message);
  } else {
    const res = run('npx tsc --noEmit');
    results.typecheck.ok = res.ok;
    results.typecheck.errors = res.ok ? 0 : (res.output.match(/error TS\d+:/g) || []).length;
    results.typecheck.message = res.ok ? 'TypeScript check passed.' : 'TypeScript check failed.';
    console.log(results.typecheck.message);
    if (res.output) console.log(res.output);
  }
}

section('CHECK 3: VULNERABILITY SCAN');
{
  const res = run('npm audit --json');
  let parsed = {};
  try {
    parsed = JSON.parse(res.output || '{}');
  } catch {
    parsed = {};
  }
  const sev = parseAuditSeverities(parsed);
  results.audit = { ...results.audit, ...sev, ok: res.ok, message: res.ok ? 'npm audit completed.' : 'npm audit found vulnerabilities or failed.' };
  console.log(results.audit.message);
  console.log(`critical=${sev.critical}, high=${sev.high}, moderate=${sev.moderate}, low=${sev.low}`);
}

section('CHECK 4: UNUSED DEPENDENCIES');
{
  const res = run('npx depcheck --json');
  let parsed = {};
  try {
    parsed = JSON.parse(res.output || '{}');
  } catch {
    parsed = {};
  }
  results.depcheck.ok = res.ok;
  results.depcheck.unusedDeps = parsed.dependencies || [];
  results.depcheck.unusedDevDeps = parsed.devDependencies || [];
  results.depcheck.message = res.ok ? 'depcheck completed.' : 'depcheck reported issues or failed.';
  console.log(results.depcheck.message);
  console.log(`Unused dependencies: ${results.depcheck.unusedDeps.join(', ') || 'None'}`);
  console.log(`Unused devDependencies: ${results.depcheck.unusedDevDeps.join(', ') || 'None'}`);
}

section('CHECK 5: CIRCULAR DEPENDENCIES');
{
  const res = run('npx madge --circular .');
  const chains = (res.output || '')
    .split('\n')
    .filter((line) => line.includes('>') || line.includes('⟲') || /\d+\)\s/.test(line))
    .map((line) => line.trim());
  results.madge.ok = res.ok;
  results.madge.circular = chains;
  results.madge.message = res.ok ? 'madge completed.' : 'madge reported circular dependencies or failed.';
  console.log(results.madge.message);
  if (chains.length > 0) {
    console.log('Circular dependency chains:');
    chains.forEach((chain) => console.log(`- ${chain}`));
  } else if (res.output) {
    console.log(res.output);
  }
}

section('CHECK 6: BUILD VERIFICATION');
{
  const scripts = getPackageScripts();
  if (!scripts.build) {
    results.build.skipped = true;
    results.build.message = 'Skipped: no build script defined in package.json.';
    console.log(results.build.message);
  } else {
    const res = run('npm run build');
    results.build.ok = res.ok;
    results.build.message = res.ok ? 'Build succeeded.' : 'Build failed.';
    console.log(results.build.message);
    if (res.output) console.log(res.output);
  }
}

section('CHECK 7: BUNDLE SIZE (if Vite detected)');
{
  const hasViteConfig = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs', 'vite.config.cjs']
    .some((file) => fs.existsSync(path.join(cwd, file)));

  if (!hasViteConfig) {
    results.bundle.skipped = true;
    results.bundle.message = 'Skipped: no vite config found.';
    console.log(results.bundle.message);
  } else {
    const res = run('npx vite build --mode production');
    results.bundle.ok = res.ok;
    const bundleLines = (res.output || '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('dist/') && /\s\d+(\.\d+)?\s(kB|MB|B)/.test(line));
    results.bundle.artifacts = bundleLines;
    results.bundle.message = res.ok ? 'Vite production build completed.' : 'Vite production build failed.';
    console.log(results.bundle.message);
    if (bundleLines.length) {
      console.log('Bundle artifacts:');
      bundleLines.forEach((line) => console.log(`- ${line}`));
    }
    if (res.output) console.log(res.output);
  }
}

section('FINAL SUMMARY');
const securityScore = Math.max(0, 100 - (results.audit.critical * 30 + results.audit.high * 20 + results.audit.moderate * 10 + results.audit.low * 5));
const codeQualityPenalty = (results.eslint.errors * 5) + (results.eslint.warnings * 2) + (results.typecheck.errors * 4) + (results.madge.circular.length * 5);
const codeQualityScore = Math.max(0, 100 - codeQualityPenalty);
const depHealthScore = Math.max(0, 100 - ((results.depcheck.unusedDeps.length * 8) + (results.depcheck.unusedDevDeps.length * 4)));
const buildStatus = results.build.skipped ? 'Skipped' : (results.build.ok ? 'Passing' : 'Failing');

let overallRisk = 'Low';
if (securityScore < 30 || !results.build.ok && !results.build.skipped) overallRisk = 'Critical';
else if (securityScore < 60 || codeQualityScore < 50) overallRisk = 'High';
else if (securityScore < 85 || codeQualityScore < 80 || depHealthScore < 70) overallRisk = 'Medium';

console.log(`Security Score: ${securityScore}/100`);
console.log(`Code Quality Score: ${codeQualityScore}/100`);
console.log(`Dependency Health: ${depHealthScore}/100`);
console.log(`Build Status: ${buildStatus}`);
console.log(`Overall Risk Level: ${overallRisk}`);
