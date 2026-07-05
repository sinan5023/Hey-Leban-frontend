import { useQuery } from "@tanstack/react-query";
import { fetchInventory } from "../../services/inventoryService";

export function useInventoryQuery() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
    staleTime: 5 * 60 * 1000,
  });
}
