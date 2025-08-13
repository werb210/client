import fs from "fs";

// Fix remaining duplicate suffixed IDs
const fixes = [
  {
    file: "client/src/full-e2e-test.js",
    replacements: [
      ['product-card--full-e2e-test', 'product-card--full-e2e-test-v2'],
      ['success-message--full-e2e-test', 'success-message--full-e2e-test-v2']
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

console.log(`Final dedupe fix complete. Files changed: ${totalChanged}`);