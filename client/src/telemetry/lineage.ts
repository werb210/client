import { FIELD_MANIFEST } from "./field-manifest";
let __tid: string | null = null;
export function getTraceId():string{
  if(__tid) return __tid;
  try{ __tid = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)); }catch{ __tid = Math.random().toString(36).slice(2); }
  try{ localStorage.setItem("__traceId", __tid); }catch{}
  return __tid;
}
export function flatten(obj:any, prefix:string[]=[]): Record<string,any>{
  const out:Record<string,any> = {};
  const isObj = (v:any)=> v && typeof v==='object' && !Array.isArray(v);
  const walk=(o:any, pre:string[])=>{
    if(Array.isArray(o)){ o.forEach((v,i)=> walk(v,[...pre,String(i)])); return; }
    if(isObj(o)){ Object.entries(o).forEach(([k,v])=> walk(v,[...pre,k])); return; }
    out[pre.join('.')] = o;
  };
  walk(obj, prefix);
  return out;
}
export function attachTrace(payload:any, formData:any){
  const id = getTraceId();
  let fields:string[] = [];
  try{ const flat = flatten(formData||{}); fields = Object.keys(flat).sort(); }catch{}
  return { ...(payload||{}), _trace:{ id, version:"1.2", fields } };
}
export default { getTraceId, flatten, attachTrace };
