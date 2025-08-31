/**
 * Attach Step 2 categories to the outgoing application payload without
 * breaking existing schema. Stores under answers.productCategories (array).
 */
export function attachCategories(payload: any){
  try{
    const cats = JSON.parse(localStorage.getItem("bf:step2:categories")||"[]");
    if (!Array.isArray(cats) || !cats.length) return payload;
    const next = { ...(payload||{}) };
    next.answers = { ...(next.answers||{}), productCategories: cats };
    return next;
  }catch{ return payload; }
}
