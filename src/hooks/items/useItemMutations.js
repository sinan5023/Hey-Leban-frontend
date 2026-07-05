// src/hooks/items/useItemMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  linkProductToBase,
  toggleCategoryActive,
  toggleItemActive,
  unlinkProductFromBase,
  updateCategory,
  updateItem,
} from "../../services/itemService";

export function useItemMutations() {
  const queryClient = useQueryClient();

  const invalidateCatalogue = () =>
    queryClient.invalidateQueries({ queryKey: ["catalogue"] });

  const invalidateBoth = () => {
    queryClient.invalidateQueries({ queryKey: ["catalogue"] });
    queryClient.invalidateQueries({ queryKey: ["rawMaterials"] });
  };

  return {
    createItemMutation: useMutation({
      mutationFn: createItem,
      onSuccess: invalidateCatalogue,
    }),
    updateItemMutation: useMutation({
      mutationFn: ({ id, payload }) => updateItem(id, payload),
      onSuccess: invalidateCatalogue,
    }),
    deleteItemMutation: useMutation({
      mutationFn: deleteItem,
      onSuccess: invalidateCatalogue,
    }),
    toggleItemActiveMutation: useMutation({
      mutationFn: ({ id, isActive }) => toggleItemActive(id, isActive),
      onSuccess: invalidateCatalogue,
    }),
    createCategoryMutation: useMutation({
      mutationFn: createCategory,
      onSuccess: invalidateCatalogue,
    }),
    updateCategoryMutation: useMutation({
      mutationFn: ({ id, payload }) => updateCategory(id, payload),
      onSuccess: invalidateCatalogue,
    }),
    deleteCategoryMutation: useMutation({
      mutationFn: deleteCategory,
      onSuccess: invalidateCatalogue,
    }),
    toggleCategoryActiveMutation: useMutation({
      mutationFn: ({ id, isActive }) => toggleCategoryActive(id, isActive),
      onSuccess: invalidateCatalogue,
    }),
    linkIngredientMutation: useMutation({
      mutationFn: ({ productId, rawMaterialId }) =>
        linkProductToBase(productId, rawMaterialId),
      onSuccess: invalidateBoth,
    }),
    unlinkIngredientMutation: useMutation({
      mutationFn: ({ productId }) => unlinkProductFromBase(productId),
      onSuccess: invalidateBoth,
    }),
  };
}