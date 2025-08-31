//  =========================
//  CLIENT FORM TYPES - IMPORTING FROM SHARED SCHEMA
//  =========================
export {
  ApplicationFormSchema as ApplicationSchema,
  type ApplicationForm,
  phoneSchema,
  postalSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step6Schema
} from '@shared/schema';
// injected: local-first products fetch
import { getProducts, loadSelectedCategories } from "../api/products";
/* injected load on mount (pseudo):
useEffect(() => { (async () => {
  const cats = loadSelectedCategories();
  const products = await getProducts({ useCacheFirst: true });
  // apply category filter if present
  const selected = cats && cats.length ? products.filter(p => cats.includes((p.category||"").toLowerCase())) : products;
  setState({ products: selected });
})(); }, []);
*/
