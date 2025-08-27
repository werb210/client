import { useQuery } from "@tanstack/react-query";
import { fetchCatalogProducts, type CanonicalProduct } from "@/lib/api";

export function useLenderProducts(params?: { country?: "CA" | "US"; amount?: number }) {
  return useQuery<CanonicalProduct[]>({
    queryKey: ["catalogProducts", params?.country, params?.amount],
    queryFn: () => fetchCatalogProducts({ country: params?.country, amount: params?.amount }),
  });
}