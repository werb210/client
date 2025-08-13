import fs from "fs";

// Fix the final 2 remaining duplicates to achieve 100% cleanliness
const fixes = [
  {
    file: "client/src/pages/E2ETestRunner.tsx",
    replacements: [
      ['product-card--e2e-runner', 'product-card--e2e-runner-unique']
    ]
  },
  {
    file: "client/src/step4-7-test-monitor.js", 
    replacements: [
      ['success-message--step4-7-monitor', 'success-message--step4-7-monitor-unique']
    ]
  }
];

let totalChanged = 0;

for (const fix of fixes) {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8');
    let changed = false;
    
    for (const [oldId, newId] of fix.replacements) {
      // Handle all possible patterns
      const patterns = [
        new RegExp(`data-testid="${oldId}"`, 'g'),
        new RegExp(`data-testid='${oldId}'`, 'g'),
        new RegExp(`\\[data-testid="${oldId}"\\]`, 'g'),
        new RegExp(`\\[data-testid='${oldId}'\\]`, 'g'),
        new RegExp(`querySelector\\('\\[data-testid="${oldId}"\\]'\\)`, 'g'),
        new RegExp(`querySelector\\("\\[data-testid='${oldId}'\\]"\\)`, 'g'),
        new RegExp(`getByTestId\\('${oldId}'\\)`, 'g'),
        new RegExp(`getByTestId\\("${oldId}"\\)`, 'g')
      ];
      
      const replacements = [
        `data-testid="${newId}"`,
        `data-testid='${newId}'`,
        `[data-testid="${newId}"]`,
        `[data-testid='${newId}']`,
        `querySelector('[data-testid="${newId}"]')`,
        `querySelector("[data-testid='${newId}']")`,
        `getByTestId('${newId}')`,
        `getByTestId("${newId}")`
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
      console.log(`UPDATED ${fix.file} - Fixed ${fix.replacements.length} duplicate(s)`);
      totalChanged++;
    }
  } else {
    console.log(`SKIPPED ${fix.file} (not found)`);
  }
}

console.log(`\n🎯 100% CLEAN TARGET: Files changed: ${totalChanged}`);