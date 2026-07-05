import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRawMaterial,
  updateRawMaterialStock,
} from "../../services/rawMaterialService";

export function useRawMaterialsMutations() {
  const queryClient = useQueryClient();

  const invalidateRawMaterials = () =>
    queryClient.invalidateQueries({ queryKey: ["rawMaterials"] });

  const createRawMaterialMutation = useMutation({
    mutationFn: createRawMaterial,
    onSuccess: invalidateRawMaterials,
  });

  const updateRawMaterialStockMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRawMaterialStock(id, payload),
    onSuccess: invalidateRawMaterials,
  });

  return { createRawMaterialMutation, updateRawMaterialStockMutation };
}
