// src/components/inventory/LinkItemsModal.jsx
import { useState, useMemo } from "react";

function LinkItemsModal({
  isOpen,
  material,
  categories = [],
  rawMaterials = [],
  onClose,
  onSubmit,
  isLoading,
}) {
  const [search, setSearch] = useState("");

  // Original set of linked product IDs
  const originalLinkedIds = useMemo(() => {
    if (!material) return new Set();
    return new Set((material.linkedProducts || []).map((p) => p.id));
  }, [material]);

  const [selectedIds, setSelectedIds] = useState(() => originalLinkedIds);

  // Map of product ID -> base name for other bases
  const productToOtherBaseName = useMemo(() => {
    const map = {};
    rawMaterials.forEach((rm) => {
      if (material && rm.id !== material.id) {
        (rm.linkedProducts || []).forEach((p) => {
          map[p.id] = rm.name;
        });
      }
    });
    return map;
  }, [rawMaterials, material]);

  // Filter products by search query
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories
      .map((cat) => {
        const filteredProducts = (cat.products || []).filter((prod) =>
          prod.name?.toLowerCase().includes(query)
        );
        return {
          ...cat,
          products: filteredProducts,
        };
      })
      .filter((cat) => cat.products.length > 0);
  }, [categories, search]);

  // Calculate changes to apply
  const changes = useMemo(() => {
    const toLink = [];
    const toUnlink = [];

    // Checked but not originally linked -> need to link
    selectedIds.forEach((id) => {
      if (!originalLinkedIds.has(id)) {
        toLink.push(id);
      }
    });

    // Originally linked but not checked -> need to unlink
    originalLinkedIds.forEach((id) => {
      if (!selectedIds.has(id)) {
        toUnlink.push(id);
      }
    });

    return { toLink, toUnlink };
  }, [selectedIds, originalLinkedIds]);

  if (!isOpen || !material) return null;

  const handleToggleProduct = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleToggleCategory = (cat) => {
    const productIds = (cat.products || []).map((p) => p.id);
    const allSelected = productIds.every((id) => selectedIds.has(id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        // Deselect all
        productIds.forEach((id) => next.delete(id));
      } else {
        // Select all
        productIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSave = () => {
    onSubmit(changes.toLink, changes.toUnlink);
  };

  const hasChanges = changes.toLink.length > 0 || changes.toUnlink.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0e0100]/50 backdrop-blur-[6px]"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#f8f3ec] border-b border-[#ece7e1] shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#3d0c02] flex items-center gap-2">
                <span>🔗</span> Link Products to {material.name}
              </h2>
              <p className="text-sm text-[#54433f] mt-1">
                Select products that should draw stock from this base.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#54433f]/60 hover:text-[#3d0c02] text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#ece7e1] bg-white shrink-0">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search products to link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-[#fef9f2] border border-[#d9c1bc] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3d0c02] focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#54433f]/60 hover:text-[#3d0c02] text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white min-h-0">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-[#54433f]">
              <span className="text-3xl block mb-2">🍽️</span>
              <p className="font-semibold text-sm">No matching products found.</p>
              <p className="text-xs opacity-75 mt-0.5">Try searching with a different keyword.</p>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const productIds = (cat.products || []).map((p) => p.id);
              const allSelected = productIds.every((id) => selectedIds.has(id));

              return (
                <div
                  key={cat.id}
                  className="border border-[#ece7e1] rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Category Header */}
                  <div className="bg-[#fef9f2] px-4 py-3 flex items-center justify-between border-b border-[#ece7e1]">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#3d0c02]">
                        {cat.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#3d0c02]/10 text-[#3d0c02] text-[10px] font-bold">
                        {cat.products.length} {cat.products.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className="text-xs font-bold text-[#feb234] hover:text-[#e8a020] bg-white border border-[#feb234]/40 px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  {/* Category Products */}
                  <div className="divide-y divide-[#f3eee8]">
                    {cat.products.map((prod) => {
                      const isChecked = selectedIds.has(prod.id);
                      const isOriginallyLinked = originalLinkedIds.has(prod.id);
                      const otherBase = productToOtherBaseName[prod.id];

                      let badge = null;
                      if (isChecked) {
                        if (isOriginallyLinked) {
                          badge = (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              Linked
                            </span>
                          );
                        } else if (otherBase) {
                          badge = (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">
                              Reassign (from {otherBase})
                            </span>
                          );
                        } else {
                          badge = (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">
                              Will Link
                            </span>
                          );
                        }
                      } else {
                        if (isOriginallyLinked) {
                          badge = (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
                              Will Unlink
                            </span>
                          );
                        } else if (otherBase) {
                          badge = (
                            <span className="px-2 py-0.5 rounded-full bg-[#ece7e1] text-[#54433f]/70 text-[10px] font-bold border border-[#ded9d3]">
                              Linked to {otherBase}
                            </span>
                          );
                        }
                      }

                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleToggleProduct(prod.id)}
                          className={`px-4 py-3 flex items-center justify-between hover:bg-[#fdfbf7] cursor-pointer transition-colors ${
                            isChecked ? "bg-[#fef9f2]/50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="w-4.5 h-4.5 rounded border-[#d9c1bc] text-[#3d0c02] focus:ring-[#3d0c02] cursor-pointer accent-[#3d0c02]"
                            />
                            <span className="text-sm font-bold text-[#1d1c18]">
                              {prod.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {badge}
                            <span className="text-xs font-semibold text-[#54433f]/60">
                              ₹{prod.price}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f8f3ec] border-t border-[#ece7e1] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#54433f]">
            {hasChanges ? (
              <span className="font-bold flex gap-3">
                {changes.toLink.length > 0 && (
                  <span className="text-emerald-700">
                    ➕ {changes.toLink.length} to link
                  </span>
                )}
                {changes.toUnlink.length > 0 && (
                  <span className="text-red-600">
                    ➖ {changes.toUnlink.length} to unlink
                  </span>
                )}
              </span>
            ) : (
              <span>No changes made</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 h-10 text-sm font-bold text-[#54433f] hover:text-[#1d1c18] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className={`px-6 h-10 rounded-xl text-sm font-extrabold shadow transition-all ${
                isLoading || !hasChanges
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#feb234] text-[#6d4700] hover:bg-[#ffbd4d]"
              }`}
            >
              {isLoading ? "Saving..." : "Save Links"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkItemsModal;
