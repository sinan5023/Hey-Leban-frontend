import { useQuery } from "@tanstack/react-query";
import { fetchRawMaterials } from "../../services/rawMaterialService";

export function useRawMaterialsQuery() {
  return useQuery({
    queryKey: ["rawMaterials"],
    queryFn: fetchRawMaterials,
    staleTime: 5 * 60 * 1000,
  });
}
