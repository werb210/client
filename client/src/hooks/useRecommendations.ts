import { getProducts } from "../../api/products";
import { useQuery } from "@tanstack/react-query";
import { recommendProducts, type IntakeInput } from "@/lib/api";

export function useRecommendations(intake: IntakeInput | null) {
  return useQuery({
    queryKey: ["recommendations", intake],
    enabled: !!intake,
    queryFn: () => recommendProducts(intake as IntakeInput),
  });
}