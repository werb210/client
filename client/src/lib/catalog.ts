export type CanonicalProduct = {
  id: string; name: string; lender_id: string; lender_name: string;
  country: "CA"|"US"; category: string; min_amount: number; max_amount: number;
  interest_rate_min?: number|null; interest_rate_max?: number|null;
  term_min?: number|null; term_max?: number|null; active: boolean;
  required_documents: Array<{key:string;label:string;required:boolean;months?:number}>;
};

const BASE = import.meta.env.VITE_STAFF_BASE ?? "/";
const j = async (p: string, init?: RequestInit) => {
  const r = await fetch(BASE.replace(/\/$/,"") + p, {credentials:"include", ...init});
  if (!r.ok) throw new Error(`api ${p} -> ${r.status}`);
  return r.json();
};

type Aliases = Record<string,string>;
let ALIASES: Aliases = {};

export async function getAliases(): Promise<Aliases> {
  if (Object.keys(ALIASES).length) return ALIASES;
  try {
    const f = await j("/api/catalog/fields");
    ALIASES = f?.legacy_aliases ?? {};
    return ALIASES;
  } catch {
    // Default field aliases when server doesn't provide them
    ALIASES = {
      productName: "name",
      lenderName: "lender_name",
      countryOffered: "country",
      productCategory: "category",
      minimumLendingAmount: "min_amount",
      maximumLendingAmount: "max_amount",
      isActive: "active",
      requiredDocs: "required_documents",
    };
    return ALIASES;
  }
}

export function normalize(raw: any, a: Aliases): CanonicalProduct {
  const pick = (k:string) => raw[k] ?? raw[Object.keys(a).find(x=>a[x]===k)!];
  const country = String(pick("country") ?? "").toUpperCase();
  const category = String(pick("category") ?? "");
  return {
    id: String(pick("id")),
    name: String(pick("name")),
    lender_id: String(pick("lender_id") ?? ""),
    lender_name: String(pick("lender_name") ?? pick("lenderName") ?? ""),
    country: (country === "CA" || country === "US" ? country : "US") as "CA"|"US",
    category,
    min_amount: Number(pick("min_amount") ?? 0),
    max_amount: Number(pick("max_amount") ?? 0),
    interest_rate_min: pick("interest_rate_min") ?? null,
    interest_rate_max: pick("interest_rate_max") ?? null,
    term_min: pick("term_min") ?? null,
    term_max: pick("term_max") ?? null,
    active: Boolean(pick("active") ?? true),
    required_documents: Array.isArray(raw.required_documents) && raw.required_documents.length
      ? raw.required_documents
      : [{key:"bank_6m",label:"Last 6 months bank statements",required:true,months:6}]
  };
}

export async function fetchCatalogNormalized(): Promise<CanonicalProduct[]> {
  const aliases = await getAliases().catch(()=> ({} as Aliases));
  try {
    const ex = await j("/api/catalog/export-products?includeInactive=1");
    return (ex.products ?? []).map((p:any)=>normalize(p, aliases));
  } catch (e:any) {
    // fallback ONLY if Staff hasn't mounted catalog yet
    const legacy = await j("/api/lender-products");
    const rows = legacy.products ?? legacy.data ?? [];
    return rows.map((p:any)=>normalize(p, await getAliases().catch(()=>({} as Aliases))));
  }
}

export async function listDocuments(input:{category?:string;country?:string;amount?:number;}) {
  try {
    const r = await j("/api/required-docs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
    const docs = r?.documents ?? r?.requiredDocs ?? [];
    if (Array.isArray(docs) && docs.length) return docs;
  } catch {}
  return [{key:"bank_6m",label:"Last 6 months bank statements",required:true,months:6}];
}