import fs from "fs";
import path from "path";
const ROOT="client";
const IDS=new Set(["continue-without-signing","final-submit","product-card","success-message","upload-area"]);
const isTest=(p)=>/\b(tests|__tests__|e2e)\b/.test(p.replace(/\\/g,"/"))||/\.(spec|test)\.(t|j)sx?$/.test(p);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):/\.(t|j)sx?$/.test(e.name)?[path.join(d,e.name)]:[]);
const files=fs.existsSync(ROOT)?walk(ROOT):[];
let changed=0;
for(const file of files){ if(!isTest(file)) continue;
  let txt=fs.readFileSync(file,"utf8"), before=txt, base=path.basename(file).replace(/\.(t|j)sx?$/,"");
  for(const id of IDS){
    txt=txt.replace(new RegExp(`data-testid="\\s*${id}\\s*"`,"g"),`data-testid="${id}--${base}"`);
    txt=txt.replace(new RegExp(`data-testid='\\s*${id}\\s*'`,"g"),`data-testid='${id}--${base}'`);
    txt=txt.replace(new RegExp(`getByTestId\\(['"]${id}['"]\\)`,"g"),`getByTestId('${id}--${base}')`);
    txt=txt.replace(new RegExp(`byTestId\\(['"]${id}['"]\\)`,"g"),`byTestId('${id}--${base}')`);
    txt=txt.replace(new RegExp(`\\[data-testid=['"]${id}['"]\\]`,"g"),`[data-testid='${id}--${base}']`);
  }
  if(txt!==before){ fs.writeFileSync(file,txt); console.log("UPDATED",file); changed++; }
}
console.log("Files changed:",changed);