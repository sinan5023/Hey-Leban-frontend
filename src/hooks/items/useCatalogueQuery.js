// src/hooks/items/useCatalogueQuery.js
import { useQuery } from "@tanstack/react-query";
import { fetchManagementCatalogue } from "../../services/itemService";

export function useCatalogueQuery() {
  return useQuery({
    queryKey: ["catalogue", "management"],
    queryFn: fetchManagementCatalogue,
    staleTime: 5 * 60 * 1000,
  });
}