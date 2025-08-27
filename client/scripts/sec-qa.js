#!/usr/bin/env node
import { execSync } from 'node:child_process';
const sh = (c)=>execSync(c,{stdio:'pipe'}).toString().trim();
const rg = (p)=>{ try{ return sh(`rg -n "${p}" client/src | wc -l`);}catch{return '0';} };
console.log('== Security QA ==');
try {
  console.log('esbuild version:', sh('node -e "import pkg from \'esbuild/package.json\' assert { type: \'json\' }; console.log(pkg.version)"'));
} catch { console.log('esbuild version: (not found)'); }
console.log('innerHTML refs:', rg('\\binnerHTML\\b'));
console.log('dangerouslySetInnerHTML refs:', rg('dangerouslySetInnerHTML'));
console.log('console.log/info/debug refs:', rg('console\\.(log|info|debug)\\('));
console.log('window.open refs:', rg('window\\.open\\('));
console.log('postMessage refs:', rg('\\bpostMessage\\('));
try {
  sh('npm run build');
  console.log('dist size (KB):', sh(`du -sk dist | awk '{print $1/1024}'`));
} catch (e) {
  console.log('build failed:', e?.message || e);
  process.exit(1);
}
console.log('✅ Security QA complete');