export type CanonicalProduct = {
  id:string; name:string; country:string|null; category:string;
  min_amount:number; max_amount:number; active:boolean;
};

export function filterByIntake(products:CanonicalProduct[], intake:{country:'CA'|'US', amount:number}) {
  const cc = intake.country.toUpperCase();
  return products.filter(p => {
    const pc = (p.country || '').toUpperCase();
    if (!pc || pc !== cc) return false;                         // strict match
    if (p.active === false) return false;
    if (Number.isFinite(p.min_amount) && p.min_amount > intake.amount) return false;
    if (Number.isFinite(p.max_amount) && p.max_amount < intake.amount) return false;
    return true;
  });
}