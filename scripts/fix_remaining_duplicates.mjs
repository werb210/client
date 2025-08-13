import fs from "fs";
import path from "path";

// Manual fixes for remaining duplicate testIDs
const fixes = [
  {
    file: "client/src/step4-7-test-monitor.js",
    replacements: [
      ['continue-without-signing', 'continue-without-signing--step4-7-monitor'],
      ['final-submit', 'final-submit--step4-7-monitor'],
      ['success-message', 'success-message--step4-7-monitor']
    ]
  },
  {
    file: "client/src/pages/E2ETestRunner.tsx", 
    replacements: [
      ['continue-without-signing', 'continue-without-signing--e2e-runner'],
      ['final-submit', 'final-submit--e2e-runner'],
      ['success-message', 'success-message--e2e-runner'],
      ['upload-area', 'upload-area--e2e-runner'],
      ['product-card', 'product-card--e2e-runner']
    ]
  }
];

let totalChanged = 0;

for (const fix of fixes) {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8');
    let changed = false;
    
    for (const [oldId, newId] of fix.replacements) {
      const patterns = [
        new RegExp(`data-testid="${oldId}"`, 'g'),
        new RegExp(`data-testid='${oldId}'`, 'g'),
        new RegExp(`\\[data-testid="${oldId}"\\]`, 'g'),
        new RegExp(`\\[data-testid='${oldId}'\\]`, 'g'),
        new RegExp(`querySelector\\('\\[data-testid="${oldId}"\\]'\\)`, 'g'),
        new RegExp(`querySelector\\("\\[data-testid='${oldId}'\\]"\\)`, 'g')
      ];
      
      const replacements = [
        `data-testid="${newId}"`,
        `data-testid='${newId}'`,
        `[data-testid="${newId}"]`,
        `[data-testid='${newId}']`,
        `querySelector('[data-testid="${newId}"]')`,
        `querySelector("[data-testid='${newId}']")`
      ];
      
      for (let i = 0; i < patterns.length; i++) {
        if (patterns[i].test(content)) {
          content = content.replace(patterns[i], replacements[i]);
          changed = true;
        }
      }
    }
    
    if (changed) {
      fs.writeFileSync(fix.file, content);
      console.log(`UPDATED ${fix.file}`);
      totalChanged++;
    }
  } else {
    console.log(`SKIPPED ${fix.file} (not found)`);
  }
}

console.log(`Files changed: ${totalChanged}`);