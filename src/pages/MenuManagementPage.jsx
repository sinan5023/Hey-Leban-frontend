// src/pages/MenuManagementPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../components/settings/items/DeleteConfirmModal";
import ItemForm from "../components/settings/items/ItemForm";
import ItemsTable from "../components/settings/items/ItemsTable";
import { useCatalogueQuery } from "../hooks/items/useCatalogueQuery";
import { useItemMutations } from "../hooks/items/useItemMutations";

function MenuManagementPage() {
    const navigate = useNavigate();
    const { data: categories = [], isLoading, isError, error } = useCatalogueQuery();
    const {
        createItemMutation,
        updateItemMutation,
        deleteItemMutation,
        toggleItemActiveMutation,
        createCategoryMutation,
        updateCategoryMutation,
        deleteCategoryMutation,
        toggleCategoryActiveMutation,
        linkIngredientMutation,
        unlinkIngredientMutation,
    } = useItemMutations();

    const [searchQuery, setSearchQuery] = useState("");
    const [editingItem, setEditingItem] = useState(null);
    const [showDisabledItems, setShowDisabledItems] = useState(true);
    const [isItemFormOpen, setIsItemFormOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [deleteState, setDeleteState] = useState({
        open: false,
        type: null,
        target: null,
    });
    const [editCategoryState, setEditCategoryState] = useState({
        open: false,
        category: null,
        name: "",
        sortOrder: "",
    });

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    const normalizedCategories = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        return (categories || [])
            .map((category) => {
                const normalizedProducts = (category.products || []).map((product) => ({
                    ...product,
                    categoryId: product.categoryId || category.id,
                    isActive: product.isActive !== false,
                }));

               const visibleProducts = normalizedProducts;

                return {
                    ...category,
                    isActive: category.isActive !== false,
                    products: visibleProducts,
                };
            })
            .filter((category) => {
                if (!normalizedSearch) return category.products.length > 0;

                const categoryMatch = category.name?.toLowerCase().includes(normalizedSearch);

                const productMatch = category.products.filter((product) =>
                    [product.name, product.description]
                        .filter(Boolean)
                        .some((value) => value.toLowerCase().includes(normalizedSearch))
                );

                return categoryMatch || productMatch.length > 0;
            });
    }, [categories, searchQuery, showDisabledItems]);

    const totalItems = useMemo(
        () =>
            (categories || []).reduce(
                (sum, category) => sum + (category.products?.length || 0),
                0
            ),
        [categories]
    );

    const activeCategoriesCount = useMemo(
        () => (categories || []).filter((category) => category.isActive !== false).length,
        [categories]
    );

    const showToast = ({ type = "success", title, message }) => {
        setToast({
            id: Date.now(),
            type,
            title,
            message,
        });
    };

    const getErrorMessage = (err, fallback) =>
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        fallback;

    useEffect(() => {
        if (isError) {
            showToast({
                type: "error",
                title: "Load failed",
                message: getErrorMessage(error, "Failed to load catalogue."),
            });
        }
    }, [isError, error]);

    const handleSubmitItem = async (payload, trackingInfo = {}) => {
        try {
            if (editingItem?.id) {
                await updateItemMutation.mutateAsync({ id: editingItem.id, payload });
                showToast({
                    type: "success",
                    title: "Product updated",
                    message: `${payload.name} updated successfully.`,
                });
                setEditingItem(null);
                setIsItemFormOpen(false);
                return;
            }

            const createdProduct = await createItemMutation.mutateAsync(payload);

            if (trackingInfo.trackingMode === "base" && trackingInfo.selectedBaseId) {
                try {
                    await linkIngredientMutation.mutateAsync({
                        productId: createdProduct.id,
                        rawMaterialId: trackingInfo.selectedBaseId,
                    });
                } catch (linkErr) {
                    console.error("Failed to auto-link base during creation", linkErr);
                }
            }

            showToast({
                type: "success",
                title: "Product created",
                message: `${payload.name} created successfully.`,
            });
            setIsItemFormOpen(false);
        } catch (err) {
            showToast({
                type: "error",
                title: editingItem?.id ? "Update failed" : "Create failed",
                message: getErrorMessage(
                    err,
                    editingItem?.id
                        ? "Failed to update product."
                        : "Failed to create product."
                ),
            });
        }
    };

    const handleCreateCategory = async (payload, options = {}) => {
        try {
            const response = await createCategoryMutation.mutateAsync(payload);
            showToast({
                type: "success",
                title: "Category created",
                message: `${payload.name} created successfully.`,
            });

            const createdCategory =
                response?.category || response?.data || response || null;

            options.onSuccess?.(createdCategory);
        } catch (err) {
            showToast({
                type: "error",
                title: "Category failed",
                message: getErrorMessage(err, "Failed to create category."),
            });
        }
    };

    const handleEditItem = (item, category) => {
        setEditingItem({
            ...item,
            categoryId: item.categoryId || category.id,
        });
        setIsItemFormOpen(true);
    };

    const handleLinkIngredient = async ({ productId, rawMaterialId }) => {
        try {
            await linkIngredientMutation.mutateAsync({ productId, rawMaterialId });
            showToast({
                type: "success",
                title: "Ingredient linked",
                message: "Product is now tracked via the selected base.",
            });
        } catch (err) {
            showToast({
                type: "error",
                title: "Link failed",
                message: getErrorMessage(err, "Failed to link product to base."),
            });
        }
    };

    const handleUnlinkIngredient = async ({ productId }) => {
        try {
            await unlinkIngredientMutation.mutateAsync({ productId });
            showToast({
                type: "success",
                title: "Ingredient unlinked",
                message: "Product will now be tracked individually.",
            });
        } catch (err) {
            showToast({
                type: "error",
                title: "Unlink failed",
                message: getErrorMessage(err, "Failed to unlink product from base."),
            });
        }
    };

    const handleDeleteItem = (item) => {
        setDeleteState({
            open: true,
            type: "item",
            target: item,
        });
    };

    const handleToggleItem = async (item) => {
        try {
            const nextActive = item.isActive === false;
            await toggleItemActiveMutation.mutateAsync({
                id: item.id,
                isActive: nextActive,
            });

            showToast({
                type: "success",
                title: nextActive ? "Product activated" : "Product disabled",
                message: `${item.name} ${nextActive ? "activated" : "disabled"} successfully.`,
            });
        } catch (err) {
            showToast({
                type: "error",
                title: "Status failed",
                message: getErrorMessage(err, "Failed to update product status."),
            });
        }
    };

    const handleEditCategory = (category) => {
        setEditCategoryState({
            open: true,
            category,
            name: category.name || "",
            sortOrder: category.sortOrder === null || category.sortOrder === undefined ? "" : String(category.sortOrder),
        });
    };

    const handleSaveCategoryEdit = async () => {
        const { category, name, sortOrder } = editCategoryState;
        if (!category) return;

        const trimmedName = name.trim();
        if (!trimmedName) {
            showToast({
                type: "error",
                title: "Invalid category",
                message: "Category name is required.",
            });
            return;
        }

        try {
            await updateCategoryMutation.mutateAsync({
                id: category.id,
                payload: {
                    name: trimmedName,
                    sortOrder: sortOrder === "" ? 0 : Number(sortOrder),
                },
            });

            showToast({
                type: "success",
                title: "Category updated",
                message: `${trimmedName} updated successfully.`,
            });
            setEditCategoryState({ open: false, category: null, name: "", sortOrder: "" });
        } catch (err) {
            showToast({
                type: "error",
                title: "Category failed",
                message: getErrorMessage(err, "Failed to update category."),
            });
        }
    };

    const handleDeleteCategory = (category) => {
        setDeleteState({
            open: true,
            type: "category",
            target: category,
        });
    };

    const handleToggleCategory = async (category) => {
        try {
            const nextActive = category.isActive === false;
            await toggleCategoryActiveMutation.mutateAsync({
                id: category.id,
                isActive: nextActive,
            });

            showToast({
                type: "success",
                title: nextActive ? "Category activated" : "Category disabled",
                message: `${category.name} ${nextActive ? "activated" : "disabled"} successfully.`,
            });
        } catch (err) {
            showToast({
                type: "error",
                title: "Category failed",
                message: getErrorMessage(err, "Failed to update category status."),
            });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteState.target || !deleteState.type) return;

        try {
            if (deleteState.type === "item") {
                await deleteItemMutation.mutateAsync(deleteState.target.id);
                showToast({
                    type: "success",
                    title: "Product deleted",
                    message: `${deleteState.target.name} deleted successfully.`,
                });

                if (editingItem?.id === deleteState.target.id) {
                    setEditingItem(null);
                }
            } else {
                await deleteCategoryMutation.mutateAsync(deleteState.target.id);
                showToast({
                    type: "success",
                    title: "Category deleted",
                    message: `${deleteState.target.name} deleted successfully.`,
                });
            }

            setDeleteState({ open: false, type: null, target: null });
        } catch (err) {
            showToast({
                type: "error",
                title: "Delete failed",
                message: getErrorMessage(err, "Failed to delete."),
            });
        }
    };

    const deleteLoading =
        deleteItemMutation.isPending || deleteCategoryMutation.isPending;

    return (
        <div className="min-h-screen bg-[#fef9f2] font-sans text-[#1d1c18]">
            <header className="fixed left-0 top-0 z-50 flex h-[80px] w-full items-center justify-between bg-[#3d0c02] px-6 text-white shadow-md">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-white/10"
                        aria-label="Back to Settings"
                    >
                        <span className="text-[28px]">←</span>
                    </button>

                    <div className="flex flex-col">
                        <h1 className="text-[24px] font-bold leading-tight text-white">
                            Manage Menu
                        </h1>
                        <p className="text-[14px] font-bold text-white/70">
                            Create, update, disable, and organize categories and products
                        </p>
                    </div>
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[14px] font-bold">
                        Total Items: {totalItems}
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[14px] font-bold">
                        Active Categories: {activeCategoriesCount}
                    </div>
                </div>
            </header>

            <main className="px-6 pb-6 pt-[96px]">
                <div className="mx-auto max-w-7xl py-6">
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-[#ded9d3] bg-white p-5 shadow-sm">
                            <p className="text-sm font-bold text-[#54433f]">Total Items</p>
                            <p className="mt-2 text-4xl font-extrabold text-[#3d0c02]">{totalItems}</p>
                        </div>

                        <div className="rounded-2xl border border-[#ded9d3] bg-white p-5 shadow-sm">
                            <p className="text-sm font-bold text-[#54433f]">Active Categories</p>
                            <p className="mt-2 text-4xl font-extrabold text-[#3d0c02]">
                                {activeCategoriesCount}
                            </p>
                        </div>
                    </div>

                    <div className="w-full">
                        {isLoading ? (
                            <div className="rounded-2xl border border-[#ded9d3] bg-white p-6 shadow-sm">
                                <div className="space-y-4">
                                    <div className="h-12 animate-pulse rounded-xl bg-[#ece7e1]" />
                                    <div className="h-24 animate-pulse rounded-xl bg-[#ece7e1]" />
                                    <div className="h-24 animate-pulse rounded-xl bg-[#ece7e1]" />
                                    <div className="h-24 animate-pulse rounded-xl bg-[#ece7e1]" />
                                </div>
                            </div>
                        ) : (
                            <ItemsTable
                                categories={normalizedCategories}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                onEditCategory={handleEditCategory}
                                onDeleteCategory={handleDeleteCategory}
                                onToggleCategory={handleToggleCategory}
                                onEditItem={handleEditItem}
                                onDeleteItem={handleDeleteItem}
                                onToggleItem={handleToggleItem}
                                showDisabledItems={showDisabledItems}
                                onToggleShowDisabledItems={() => setShowDisabledItems((prev) => !prev)}
                                onAddItem={() => {
                                    setEditingItem(null);
                                    setIsItemFormOpen(true);
                                }}
                            />
                        )}
                    </div>

                    <ItemForm
                        categories={categories}
                        editingItem={editingItem}
                        itemLoading={
                            createItemMutation.isPending || updateItemMutation.isPending
                        }
                        categoryLoading={createCategoryMutation.isPending}
                        onSubmitItem={handleSubmitItem}
                        onCancelEdit={() => {
                            setEditingItem(null);
                            setIsItemFormOpen(false);
                        }}
                        onCreateCategory={handleCreateCategory}
                        onLinkIngredient={handleLinkIngredient}
                        onUnlinkIngredient={handleUnlinkIngredient}
                        linkLoading={linkIngredientMutation.isPending || unlinkIngredientMutation.isPending}
                        isOpen={isItemFormOpen}
                        onClose={() => {
                            setEditingItem(null);
                            setIsItemFormOpen(false);
                        }}
                    />
                </div>
            </main>

            <DeleteConfirmModal
                open={deleteState.open}
                loading={deleteLoading}
                title={
                    deleteState.type === "category" ? "Delete Category" : "Delete Product"
                }
                message={
                    deleteState.type === "category"
                        ? `Are you sure you want to delete ${deleteState.target?.name}? This will soft delete the category.`
                        : `Are you sure you want to delete ${deleteState.target?.name}? This will soft delete the product.`
                }
                confirmLabel="Delete"
                onClose={() => setDeleteState({ open: false, type: null, target: null })}
                onConfirm={handleConfirmDelete}
            />

            {editCategoryState.open && editCategoryState.category && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#3a0a01]/60 p-4">
                    <div className="w-full max-w-[440px] rounded-2xl border border-[#ded9d3] bg-[#fef9f2] shadow-2xl">
                        <div className="flex flex-col gap-5 p-6">
                            <div>
                                <h2 className="text-2xl font-bold text-[#3d0c02]">Edit Category</h2>
                                <p className="mt-1 text-sm text-[#54433f]">Update category details below.</p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-[#3d0c02]">Category Name</label>
                                <input
                                    type="text"
                                    value={editCategoryState.name}
                                    onChange={(e) => setEditCategoryState((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full rounded-xl border border-[#ded9d3] bg-white p-3 text-sm outline-none focus:border-[#E8A020]"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-[#3d0c02]">Sort Order</label>
                                <input
                                    type="number"
                                    value={editCategoryState.sortOrder}
                                    onChange={(e) => setEditCategoryState((prev) => ({ ...prev, sortOrder: e.target.value }))}
                                    placeholder="0"
                                    className="w-full rounded-xl border border-[#ded9d3] bg-white p-3 text-sm outline-none focus:border-[#E8A020]"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditCategoryState({ open: false, category: null, name: "", sortOrder: "" })}
                                    className="h-12 flex-1 rounded-xl border-2 border-[#ded9d3] font-bold text-[#3d0c02]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveCategoryEdit}
                                    disabled={updateCategoryMutation.isPending}
                                    className={`h-12 flex-1 rounded-xl font-extrabold text-white shadow-lg ${
                                        updateCategoryMutation.isPending ? "cursor-not-allowed bg-gray-400" : "bg-[#3d0c02]"
                                    }`}
                                >
                                    {updateCategoryMutation.isPending ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast ? (
                <div className="pointer-events-none fixed right-6 top-20 z-[200]">
                    <div
                        className={`pointer-events-auto min-w-[320px] max-w-[420px] rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur-sm transition-all ${toast.type === "success"
                                ? "border-emerald-200 bg-white text-[#3d0c02]"
                                : "border-red-200 bg-white text-[#3d0c02]"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toast.type === "success"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-red-100 text-red-600"
                                    }`}
                            >
                                {toast.type === "success" ? "✓" : "!"}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-extrabold">{toast.title}</h4>
                                <p className="mt-1 text-sm text-[#54433f]">{toast.message}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setToast(null)}
                                className="text-lg leading-none text-[#3d0c02]/50 hover:text-[#3d0c02]"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#f3eee8]">
                            <div
                                className={`h-full rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
                                    }`}
                                style={{ animation: "toastShrink 3s linear forwards" }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}

            <style>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}

export default MenuManagementPage;