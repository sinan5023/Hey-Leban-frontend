// src/components/settings/items/ItemForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useRawMaterialsQuery } from "../../../hooks/rawMaterials/useRawMaterialsQuery";

const initialItemState = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  sortOrder: "",
};

const initialCategoryState = {
  name: "",
  sortOrder: "",
};

function ItemForm({
  categories,
  editingItem,
  itemLoading,
  categoryLoading,
  onSubmitItem,
  onCancelEdit,
  onCreateCategory,
  onLinkIngredient,
  onUnlinkIngredient,
  linkLoading,
  isOpen,
  onClose,
}) {
  const [form, setForm] = useState(initialItemState);
  const [errors, setErrors] = useState({});
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState(initialCategoryState);
  const [categoryErrors, setCategoryErrors] = useState({});

  // Inventory tracking state
  const [trackingMode, setTrackingMode] = useState("individual"); // "individual" | "base"
  const [selectedBaseId, setSelectedBaseId] = useState("");
  const [trackingChanged, setTrackingChanged] = useState(false);

  const { data: rawMaterials = [] } = useRawMaterialsQuery();

  useEffect(() => {
    if (editingItem) {
      setForm({
        categoryId: editingItem.categoryId || "",
        name: editingItem.name || "",
        description: editingItem.description || "",
        price: String(editingItem.price ?? ""),
        sortOrder:
          editingItem.sortOrder === null || editingItem.sortOrder === undefined
            ? ""
            : String(editingItem.sortOrder),
      });
      setErrors({});
      // Reset tracking state for this item
      setTrackingChanged(false);
      return;
    }

    setForm((prev) => ({
      ...initialItemState,
      categoryId: prev.categoryId || categories[0]?.id || "",
    }));
    setErrors({});
    setTrackingMode("individual");
    setSelectedBaseId("");
    setTrackingChanged(false);
  }, [editingItem, categories]);

  // When editing item and rawMaterials are loaded, pre-populate tracking state
  useEffect(() => {
    if (!editingItem || rawMaterials.length === 0 || trackingChanged) return;
    const linkedBase = rawMaterials.find((rm) =>
      (rm.linkedProducts || []).some((p) => p.id === editingItem.id)
    );
    if (linkedBase) {
      setTrackingMode("base");
      setSelectedBaseId(linkedBase.id);
    } else {
      setTrackingMode("individual");
      setSelectedBaseId("");
    }
  }, [editingItem, rawMaterials, trackingChanged]);

  const categoryOptions = useMemo(
    () =>
      (categories || []).map((category) => ({
        id: category.id,
        name: category.name,
        isActive: category.isActive !== false,
      })),
    [categories]
  );

  const validateItem = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Item name is required.";
    } else if (form.name.trim().length > 255) {
      nextErrors.name = "Item name must be 255 characters or less.";
    }

    if (form.description && form.description.length > 1000) {
      nextErrors.description = "Description must be 1000 characters or less.";
    }

    if (form.price === "" || Number.isNaN(Number(form.price))) {
      nextErrors.price = "Price is required.";
    } else if (Number(form.price) < 0) {
      nextErrors.price = "Price must be 0 or more.";
    }

    if (form.sortOrder !== "" && Number.isNaN(Number(form.sortOrder))) {
      nextErrors.sortOrder = "Sort order must be a valid number.";
    }

    if (!form.categoryId) {
      nextErrors.categoryId = "Please select a category.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateCategory = () => {
    const nextErrors = {};

    if (!categoryForm.name.trim()) {
      nextErrors.name = "Category name is required.";
    } else if (categoryForm.name.trim().length > 255) {
      nextErrors.name = "Category name must be 255 characters or less.";
    }

    if (
      categoryForm.sortOrder !== "" &&
      Number.isNaN(Number(categoryForm.sortOrder))
    ) {
      nextErrors.sortOrder = "Sort order must be a valid number.";
    }

    setCategoryErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleItemSubmit = (e) => {
    e.preventDefault();
    if (!validateItem()) return;

    onSubmitItem({
      categoryId: form.categoryId || null,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      sortOrder: form.sortOrder === "" ? 0 : Number(form.sortOrder),
    }, {
      trackingMode,
      selectedBaseId,
    });
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!validateCategory()) return;

    onCreateCategory(
      {
        name: categoryForm.name.trim(),
        sortOrder:
          categoryForm.sortOrder === "" ? null : Number(categoryForm.sortOrder),
      },
      {
        onSuccess: (createdCategory) => {
          setCategoryForm(initialCategoryState);
          setCategoryErrors({});
          setShowCategoryForm(false);
          if (createdCategory?.id) {
            setForm((prev) => ({ ...prev, categoryId: createdCategory.id }));
          }
        },
      }
    );
  };

  const handleTrackingModeChange = (newMode) => {
    setTrackingMode(newMode);
    setTrackingChanged(true);
    if (newMode === "individual") {
      setSelectedBaseId("");
      if (editingItem?.id) {
        onUnlinkIngredient?.({ productId: editingItem.id });
      }
    }
  };

  const handleBaseSelection = (baseId) => {
    setSelectedBaseId(baseId);
    setTrackingChanged(true);
    if (editingItem?.id && baseId) {
      onLinkIngredient?.({ productId: editingItem.id, rawMaterialId: baseId });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3a0a01]/60 backdrop-blur-[8px]"
        onClick={onClose}
      />
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#fef9f2] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[#ded9d3]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f8f3ec] border-b border-[#ded9d3] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#3d0c02]">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h2>
            <p className="text-xs text-[#54433f] mt-0.5">
              {editingItem
                ? "Update product details and tracking."
                : "Create a new product catalogue entry."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold text-[#3d0c02]/50 hover:text-[#3d0c02] transition-colors leading-none"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleItemSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-[#3d0c02]">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-[#ded9d3] bg-[#fef9f2] px-3 outline-none focus:border-[#E8A020]"
            >
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isActive ? "" : " (Inactive)"}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <p className="mt-1 text-xs font-bold text-red-600">
                {errors.categoryId}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-dashed border-[#ded9d3] bg-[#f8f3ec]/50 p-3">
            <div>
              <p className="text-sm font-bold text-[#3d0c02]">
                Need a new category?
              </p>
              <p className="text-xs text-[#54433f]">
                Create it here without leaving this page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCategoryForm((prev) => !prev)}
              className="rounded-lg bg-[#E8A020] px-3 py-2 text-xs font-bold text-white hover:bg-[#cf8e18] transition-colors"
            >
              {showCategoryForm ? "Close" : "Create Category"}
            </button>
          </div>

          {showCategoryForm ? (
            <div className="space-y-3 rounded-xl border border-[#ded9d3] bg-[#f8f3ec]/40 p-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-[#3d0c02]">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Example: Cakes"
                  className="h-11 w-full rounded-xl border border-[#ded9d3] bg-white px-3 outline-none focus:border-[#E8A020]"
                />
                {categoryErrors.name ? (
                  <p className="mt-1 text-xs font-bold text-red-600">
                    {categoryErrors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-[#3d0c02]">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      sortOrder: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-[#ded9d3] bg-white px-3 outline-none focus:border-[#E8A020]"
                />
                {categoryErrors.sortOrder ? (
                  <p className="mt-1 text-xs font-bold text-red-600">
                    {categoryErrors.sortOrder}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={handleCategorySubmit}
                disabled={categoryLoading}
                className={`h-11 w-full rounded-xl text-sm font-bold text-white ${
                  categoryLoading
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-[#3d0c02] hover:bg-[#5a1204] transition-colors"
                }`}
              >
                {categoryLoading ? "Saving Category..." : "Save Category"}
              </button>
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-bold text-[#3d0c02]">
              Item Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Example: Belgian Truffle Cake"
              className="h-11 w-full rounded-xl border border-[#ded9d3] bg-[#fef9f2] px-3 outline-none focus:border-[#E8A020]"
            />
            {errors.name ? (
              <p className="mt-1 text-xs font-bold text-red-600">{errors.name}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-[#3d0c02]">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Optional product description"
              className="w-full rounded-xl border border-[#ded9d3] bg-[#fef9f2] p-3 outline-none focus:border-[#E8A020] resize-none"
            />
            {errors.description ? (
              <p className="mt-1 text-xs font-bold text-red-600">
                {errors.description}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-[#3d0c02]">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
                className="h-11 w-full rounded-xl border border-[#ded9d3] bg-[#fef9f2] px-3 outline-none focus:border-[#E8A020]"
              />
              {errors.price ? (
                <p className="mt-1 text-xs font-bold text-red-600">
                  {errors.price}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-[#3d0c02]">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                }
                placeholder="0"
                className="h-11 w-full rounded-xl border border-[#ded9d3] bg-[#fef9f2] px-3 outline-none focus:border-[#E8A020]"
              />
              {errors.sortOrder ? (
                <p className="mt-1 text-xs font-bold text-red-600">
                  {errors.sortOrder}
                </p>
              ) : null}
            </div>
          </div>

          {/* ── Inventory Tracking ── */}
          <div className="rounded-xl border border-[#ded9d3] bg-[#f8f3ec]/60 p-4 space-y-3">
            <div>
              <p className="text-sm font-extrabold text-[#3d0c02]">
                🗄️ Inventory Tracking
              </p>
              <p className="text-xs text-[#54433f] mt-0.5">
                Choose how stock is tracked when this product is ordered.
              </p>
            </div>

            {/* Toggle buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTrackingModeChange("individual")}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-3 px-2 text-center font-bold transition-all border-2 ${
                  trackingMode === "individual"
                    ? "border-[#3d0c02] bg-[#3d0c02] text-white"
                    : "border-[#ded9d3] bg-white text-[#54433f] hover:border-[#3d0c02]"
                }`}
              >
                <span className="text-base leading-none">📦</span>
                <span className="text-[11px] leading-tight">Track Individually</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackingMode("base");
                  setTrackingChanged(true);
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-3 px-2 text-center font-bold transition-all border-2 ${
                  trackingMode === "base"
                    ? "border-[#3d0c02] bg-[#3d0c02] text-white"
                    : "border-[#ded9d3] bg-white text-[#54433f] hover:border-[#3d0c02]"
                }`}
              >
                <span className="text-base leading-none">🔗</span>
                <span className="text-[11px] leading-tight">Track via Base</span>
              </button>
            </div>

            {/* Base selector */}
            {trackingMode === "base" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#3d0c02]">
                  Select Raw Material Base
                </label>
                {rawMaterials.length === 0 ? (
                  <p className="text-xs text-[#54433f] italic">
                    No raw materials found. Create one in the Inventory page first.
                  </p>
                ) : (
                  <select
                    value={selectedBaseId}
                    onChange={(e) => handleBaseSelection(e.target.value)}
                    disabled={linkLoading}
                    className={`h-10 w-full rounded-xl border border-[#ded9d3] bg-white px-3 text-sm outline-none focus:border-[#E8A020] transition-colors ${
                      linkLoading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">-- Choose a base --</option>
                    {rawMaterials.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.name} ({rm.inHandCount} in stock)
                      </option>
                    ))}
                  </select>
                )}
                {linkLoading && (
                  <p className="text-xs text-[#54433f] flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border-2 border-[#3d0c02] border-t-transparent rounded-full animate-spin" />
                    Saving link...
                  </p>
                )}
              </div>
            )}

            {trackingMode === "individual" && (
              <p className="text-xs text-[#54433f] bg-white rounded-lg px-3 py-2 border border-[#ded9d3]">
                Stock is tracked per product. Use the Inventory page to update counts directly.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-xl border border-[#ded9d3] bg-white px-5 text-sm font-bold text-[#3d0c02] hover:bg-[#f8f3ec] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={itemLoading}
              className={`h-12 flex-[2] rounded-xl text-sm font-extrabold text-white shadow-lg ${
                itemLoading
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-[#3d0c02] hover:bg-[#5a1204] transition-colors"
              }`}
            >
              {itemLoading
                ? editingItem
                  ? "Updating..."
                  : "Saving..."
                : editingItem
                ? "Update Item"
                : "Save Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemForm;