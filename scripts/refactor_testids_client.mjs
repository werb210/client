import fs from "fs";
import path from "path";

const ROOT = "client";
const TARGET_IDS = new Set([
  "continue-without-signing",
  "final-submit",
  "product-card",
  "success-message",
  "upload-area",
]);

const isTest = p => {
  const posix = p.replace(/\\/g, "/");
  return /\b(tests|__tests__|e2e)\b/.test(posix) || /\.(spec|test)\.(t|j)sx?$/.test(posix);
};

const walk = dir => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name))
           : /\.(t|j)sx?$/.test(e.name) ? [path.join(dir, e.name)] : []);

const files = fs.existsSync(ROOT) ? walk(ROOT) : [];
let changed = 0;
const changes = [];

for (const file of files) {
  if (!isTest(file)) continue;  // only modify tests
  const base = path.basename(file).replace(/\.(t|j)sx?$/, "");
  let text = fs.readFileSync(file, "utf8");
  let before = text;

  for (const id of TARGET_IDS) {
    const suffixed = `${id}--${base}`;
    // JSX/HTML attributes
    text = text.replace(new RegExp(`data-testid="\\s*${id}\\s*"`, "g"), `data-testid="${suffixed}"`);
    text = text.replace(new RegExp(`data-testid='\\s*${id}\\s*'`, "g"), `data-testid='${suffixed}'`);
    // Testing libs / selectors
    text = text.replace(new RegExp(`getByTestId\\(['"]${id}['"]\\)`, "g"), `getByTestId('${suffixed}')`);
    text = text.replace(new RegExp(`byTestId\\(['"]${id}['"]\\)`, "g"), `byTestId('${suffixed}')`);
    text = text.replace(new RegExp(`\\[data-testid=['"]${id}['"]\\]`, "g"), `[data-testid='${suffixed}']`);
  }

  if (text !== before) {
    fs.writeFileSync(file, text);
    changed++;
    changes.push(file);
  }
}

console.log(`Refactor complete. Files changed: ${changed}`);
changes.forEach(f => console.log("UPDATED", f));