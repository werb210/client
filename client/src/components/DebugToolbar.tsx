import { fetchCatalogProducts } from "@/lib/api";

export function CatalogSanityButton() {
  return (
    <button
      onClick={async ()=>{
        const { total, products } = await fetchCatalogProducts({ includeInactive: true, cacheBust: true });
        const countries = new Set(products.map(p=>p.country));
        const cats = new Set(products.map(p=>p.category));
        // eslint-disable-next-line no-console
        console.warn("catalog sanity", { total, countries: [...countries], categories: [...cats] });
        alert(`Catalog total=${total}\nCountries=${[...countries].join(", ")}\nCategories=${[...cats].join(", ")}`);
      }}
    >Catalog Sanity</button>
  );
}