// src/components/settings/items/ItemsTable.jsx
import React, { useState, useMemo, useEffect } from "react";

function ItemsTable({
  categories,
  searchQuery,
  onSearchChange,
  onEditCategory,
  onDeleteCategory,
  onToggleCategory,
  onEditItem,
  onDeleteItem,
  onToggleItem,
  showDisabledItems,
  onToggleShowDisabledItems,
  onAddItem,
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("All");

  // Fallback to "All" if the selected category is deleted or no longer exists
  useEffect(() => {
    if (selectedCategoryId !== "All" && !categories.some((cat) => cat.id === selectedCategoryId)) {
      setSelectedCategoryId("All");
    }
  }, [categories, selectedCategoryId]);

  // Construct the list of category pills
  const categoryPills = useMemo(() => {
    return [
      { id: "All", name: "All", isActive: true },
      ...categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        isActive: cat.isActive !== false,
      })),
    ];
  }, [categories]);

  // Find the currently selected category object for category-level actions
  const selectedCategory = useMemo(() => {
    if (selectedCategoryId === "All") return null;
    return categories.find((cat) => cat.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Flatten, filter, and sort products
  const filteredProducts = useMemo(() => {
    const list = [];
    categories.forEach((cat) => {
      const isCatActive = cat.isActive !== false;
      (cat.products || []).forEach((prod) => {
        const isItemActive = prod.isActive !== false;

        // Filter based on "Show Disabled Items" toggle
        if (!showDisabledItems && !isItemActive) {
          return;
        }

        list.push({
          ...prod,
          categoryName: cat.name,
          categoryId: cat.id,
          categoryIsActive: isCatActive,
          categorySortOrder: cat.sortOrder ?? 0,
        });
      });
    });

    // Filter by category selection and search query
    const q = searchQuery.trim().toLowerCase();
    const filtered = list.filter((p) => {
      const matchCat = selectedCategoryId === "All" || p.categoryId === selectedCategoryId;
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q);

      return matchCat && matchSearch;
    });

    // Sort: Category Sort Order -> Product Sort Order -> Product Name
    return filtered.sort((a, b) => {
      if (a.categorySortOrder !== b.categorySortOrder) {
        return a.categorySortOrder - b.categorySortOrder;
      }
      const aSort = a.sortOrder ?? 0;
      const bSort = b.sortOrder ?? 0;
      if (aSort !== bSort) {
        return aSort - bSort;
      }
      return a.name.localeCompare(b.name);
    });
  }, [categories, selectedCategoryId, searchQuery, showDisabledItems]);

  return (
    <div className="rounded-2xl border border-[#ded9d3] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#ded9d3] pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#3d0c02]">Current Inventory</h2>
          <p className="mt-1 text-sm text-[#54433f]">
            View categories, edit products, and control active status.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full md:w-auto">
          <div className="w-full sm:w-64 md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items..."
              className="h-11 w-full rounded-xl border border-[#ded9d3] bg-[#fef9f2] px-4 text-sm outline-none focus:border-[#E8A020]"
            />
          </div>
          <button
            type="button"
            onClick={onToggleShowDisabledItems}
            className="h-11 rounded-xl border border-[#ded9d3] bg-white px-4 text-sm font-bold text-[#3d0c02] whitespace-nowrap hover:bg-[#f8f3ec] transition-colors"
          >
            {showDisabledItems ? "Hide Disabled" : "Show Disabled"}
          </button>
          <button
            type="button"
            onClick={onAddItem}
            className="h-11 px-5 bg-[#3d0c02] text-white rounded-xl text-sm font-bold hover:bg-[#5a1204] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="text-base font-bold">+</span> Add Item
          </button>
        </div>
      </div>

      {/* Category Pills Filters */}
      <div className="flex items-center gap-2 my-5 overflow-x-auto pb-1.5 scrollbar-hide">
        {categoryPills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setSelectedCategoryId(pill.id)}
            className={`px-5 h-9 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              selectedCategoryId === pill.id
                ? "bg-[#feb234] text-[#6d4700] shadow-sm"
                : pill.isActive === false
                ? "bg-[#ece7e1]/60 text-[#54433f]/60 hover:bg-[#ece7e1]/80"
                : "bg-[#ece7e1] text-[#54433f] hover:bg-[#e6e2db]"
            }`}
          >
            <span>{pill.name}</span>
            {pill.isActive === false && pill.id !== "All" && (
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" title="Inactive category"></span>
            )}
          </button>
        ))}
      </div>

      {/* Dynamic Category Actions Banner */}
      {selectedCategory && (
        <div className="mb-5 rounded-2xl border border-[#ded9d3] bg-[#fef9f2] p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-extrabold text-[#3d0c02]">{selectedCategory.name}</h3>
                {selectedCategory.isActive === false && (
                  <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                    Inactive Category
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-[#54433f]">
                Sort Order: {selectedCategory.sortOrder ?? 0} · {(selectedCategory.products || []).length} item(s)
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onEditCategory(selectedCategory)}
                className="rounded-lg border border-[#ded9d3] bg-white px-3 py-2 text-xs font-bold text-[#3d0c02] hover:bg-[#f8f3ec] transition-colors"
              >
                Edit Category
              </button>
              <button
                type="button"
                onClick={() => onToggleCategory(selectedCategory)}
                className="rounded-lg border border-[#ded9d3] bg-white px-3 py-2 text-xs font-bold text-[#3d0c02] hover:bg-[#f8f3ec] transition-colors"
              >
                {selectedCategory.isActive !== false ? "Disable Category" : "Enable Category"}
              </button>
              <button
                type="button"
                onClick={() => onDeleteCategory(selectedCategory)}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#ece7e1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f3ec] border-b border-[#ece7e1]">
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">#</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Item Name</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Category</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Description</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Price</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Sort</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Status</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7e1]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-[#54433f] text-sm">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item, idx) => {
                  const isItemActive = item.isActive !== false;
                  const itemCategory = categories.find((c) => c.id === item.categoryId);

                  return (
                    <tr key={item.id} className="hover:bg-[#fefcf9] transition-colors">
                      <td className="px-5 py-4 text-sm text-[#54433f]">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-[#1d1c18]">{item.name}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#54433f]">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f8f3ec] text-[#54433f] text-xs font-bold border border-[#ded9d3]">
                          {item.categoryName}
                        </span>
                      </td>
                      <td
                        className="px-5 py-4 text-sm text-[#54433f] max-w-[200px] truncate"
                        title={item.description}
                      >
                        {item.description || <span className="opacity-50">—</span>}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#54433f]">
                        ₹{Number(item.price || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#54433f]">{item.sortOrder ?? 0}</td>
                      <td className="px-5 py-4">
                        {isItemActive ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-green-100 text-[#2E7D32]">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEditItem(item, itemCategory)}
                            className="rounded-lg border border-[#ded9d3] bg-white px-3 py-1.5 text-xs font-bold text-[#3d0c02] hover:bg-[#f8f3ec]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleItem(item)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                              isItemActive
                                ? "border border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                                : "border border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {isItemActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default ItemsTable;