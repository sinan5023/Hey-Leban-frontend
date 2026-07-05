// src/hooks/inventory/useInventoryMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInventory } from "../../services/inventoryService";

export function useInventoryMutations() {
  const queryClient = useQueryClient();

  // payload: { addQuantity|setQuantity, note? }
  const updateInventoryMutation = useMutation({
    mutationFn: ({ productId, payload }) => updateInventory(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  return { updateInventoryMutation };
}
