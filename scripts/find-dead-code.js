#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SRC_CANDIDATES = [
  path.resolve(process.cwd(), 'src'),
  path.resolve(__dirname, '..', 'client-app', 'src'),
];

function findSrcRoot() {
  for (const candidate of SRC_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error('Unable to locate src directory.');
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (/\.(t|j)sx?$/.test(entry.name)) return [full];
    return [];
  });
}

function loadFile(file) {
  return fs.readFileSync(file, 'utf8');
}

function stripImports(content) {
  return content.replace(/^import[^;]*;\s*/gm, '');
}

function collectImports(file, content) {
  const imports = [];
  const importRegex = /import\s+([^;]+?)\s+from\s+["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content))) {
    const [_, clause, source] = match;
    const names = [];
    const defaultMatch = clause.match(/^([^,{*]+)/);
    if (defaultMatch) names.push(defaultMatch[1].trim());
    const namedMatch = clause.match(/\{([^}]+)\}/);
    if (namedMatch) {
      namedMatch[1]
        .split(',')
        .map((n) => n.trim().split(' as ')[0])
        .filter(Boolean)
        .forEach((n) => names.push(n));
    }
    const starMatch = clause.match(/\*\s+as\s+([^\s]+)/);
    if (starMatch) names.push(starMatch[1]);
    imports.push({ file, source, names });
  }
  return imports;
}

function collectExports(file, content) {
  const exports = [];
  const exportRegexes = [
    /export\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
    /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*/g,
    /export\s+class\s+([A-Z][A-Za-z0-9_]*)/g,
    /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
  ];
  exportRegexes.forEach((regex) => {
    let match;
    while ((match = regex.exec(content))) {
      exports.push(match[1]);
    }
  });
  return exports;
}

function resolveImport(baseFile, source, srcRoot) {
  if (!source.startsWith('.')) return null;
  const baseDir = path.dirname(baseFile);
  const guess = path.resolve(baseDir, source);
  const candidates = [
    guess,
    `${guess}.ts`,
    `${guess}.tsx`,
    `${guess}.js`,
    `${guess}.jsx`,
    path.join(guess, 'index.ts'),
    path.join(guess, 'index.tsx'),
    path.join(guess, 'index.js'),
    path.join(guess, 'index.jsx'),
  ];
  for (const candidate of candidates) {
    if (candidate.startsWith(srcRoot) && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function hasDeprecatedMarker(content) {
  return /@deprecated|DEPRECATED/i.test(content);
}

function analyze() {
  const srcRoot = findSrcRoot();
  const files = walk(srcRoot);
  const fileContents = new Map();
  files.forEach((file) => fileContents.set(file, loadFile(file)));

  const allImports = files.flatMap((file) =>
    collectImports(file, fileContents.get(file) || '')
  );
  const allExports = files.map((file) => ({
    file,
    exports: collectExports(file, fileContents.get(file) || ''),
  }));

  const importGraph = new Map();
  allImports.forEach((imp) => {
    const resolved = resolveImport(imp.file, imp.source, srcRoot);
    if (!resolved) return;
    if (!importGraph.has(resolved)) importGraph.set(resolved, new Set());
    importGraph.get(resolved).add(imp.file);
  });

  const unusedImports = [];
  allImports.forEach((imp) => {
    const stripped = stripImports(fileContents.get(imp.file) || '');
    const unusedNames = imp.names.filter((name) => {
      if (!name || name === '*') return false;
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      return !regex.test(stripped);
    });
    if (unusedNames.length) {
      unusedImports.push({ file: imp.file, names: unusedNames });
    }
  });

  const allContentJoined = Array.from(fileContents.values()).join('\n');
  const unusedComponents = [];
  allExports.forEach(({ file, exports }) => {
    const unused = exports.filter((name) => {
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      const occurrences = allContentJoined.match(regex) || [];
      return occurrences.length <= 1; // definition only
    });
    if (unused.length) unusedComponents.push({ file, names: unused });
  });

  const unreferencedFiles = files.filter(
    (file) => !importGraph.has(file)
  );

  const deprecatedModules = files
    .map((file) => ({ file, deprecated: hasDeprecatedMarker(fileContents.get(file) || '') }))
    .filter((entry) => entry.deprecated);

  console.log('Source root:', srcRoot);
  console.log('\nUnused imports:');
  if (unusedImports.length === 0) console.log('  None');
  else unusedImports.forEach((item) =>
    console.log(`  ${path.relative(srcRoot, item.file)} -> ${item.names.join(', ')}`)
  );

  console.log('\nUnused components:');
  if (unusedComponents.length === 0) console.log('  None');
  else unusedComponents.forEach((item) =>
    console.log(`  ${path.relative(srcRoot, item.file)} -> ${item.names.join(', ')}`)
  );

  console.log('\nFiles not referenced anywhere:');
  if (unreferencedFiles.length === 0) console.log('  None');
  else unreferencedFiles.forEach((file) =>
    console.log(`  ${path.relative(srcRoot, file)}`)
  );

  console.log('\nDeprecated modules:');
  if (deprecatedModules.length === 0) console.log('  None');
  else deprecatedModules.forEach((item) =>
    console.log(`  ${path.relative(srcRoot, item.file)}`)
  );
}

try {
  analyze();
} catch (err) {
  console.error('Diagnostic failed:', err.message);
  process.exit(1);
}
