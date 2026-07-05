// src/pages/InventoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateRawMaterialModal from "../components/inventory/CreateRawMaterialModal";
import RawMaterialStockModal from "../components/inventory/RawMaterialStockModal";
import { useRawMaterialsQuery } from "../hooks/rawMaterials/useRawMaterialsQuery";
import { useRawMaterialsMutations } from "../hooks/rawMaterials/useRawMaterialsMutations";
import { useCatalogueQuery } from "../hooks/items/useCatalogueQuery";
import { useInventoryQuery } from "../hooks/inventory/useInventoryQuery";
import { useInventoryMutations } from "../hooks/inventory/useInventoryMutations";

// ──────────────────────────────────────────────────────
// Toast component
// ──────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div className="pointer-events-none fixed right-6 top-20 z-[200]">
      <div
        className={`pointer-events-auto min-w-[320px] max-w-[420px] rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur-sm ${
          isSuccess
            ? "border-emerald-200 bg-white text-[#3d0c02]"
            : "border-red-200 bg-white text-[#3d0c02]"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isSuccess ? "✓" : "!"}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-extrabold">{toast.title}</h4>
            <p className="mt-1 text-sm text-[#54433f]">{toast.message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-lg leading-none text-[#3d0c02]/50 hover:text-[#3d0c02]"
          >
            ×
          </button>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#f3eee8]">
          <div
            className={`h-full rounded-full ${
              isSuccess ? "bg-emerald-500" : "bg-red-500"
            }`}
            style={{ animation: "toastShrink 3s linear forwards" }}
          />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Tab 1: Raw Materials
// ──────────────────────────────────────────────────────
function RawMaterialsTab({ onToast }) {
  const { data: rawMaterials = [], isLoading } = useRawMaterialsQuery();
  const { createRawMaterialMutation, updateRawMaterialStockMutation } =
    useRawMaterialsMutations();

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stockModal, setStockModal] = useState({ open: false, material: null });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rawMaterials;
    return rawMaterials.filter((m) => m.name?.toLowerCase().includes(q));
  }, [rawMaterials, search]);

  const handleCreate = async (payload) => {
    try {
      await createRawMaterialMutation.mutateAsync(payload);
      setShowCreateModal(false);
      onToast({ type: "success", title: "Base Created", message: `${payload.name} was added successfully.` });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create raw material.";
      onToast({ type: "error", title: "Create Failed", message: msg });
    }
  };

  const handleStockUpdate = async (payload) => {
    try {
      await updateRawMaterialStockMutation.mutateAsync({
        id: stockModal.material.id,
        payload,
      });
      setStockModal({ open: false, material: null });
      onToast({
        type: "success",
        title: "Stock Updated",
        message: `${stockModal.material.name} stock updated.`,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update stock.";
      onToast({ type: "error", title: "Update Failed", message: msg });
    }
  };

  const getStatus = (m) => {
    if (m.inHandCount <= 0) return { label: "Out of Stock", cls: "bg-red-100 text-[#C62828]" };
    if (m.reorderLevel > 0 && m.inHandCount <= m.reorderLevel)
      return { label: "Low Stock", cls: "bg-orange-100 text-[#E65100]" };
    return { label: "In Stock", cls: "bg-green-100 text-[#2E7D32]" };
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#54433f]">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bases..."
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#d9c1bc] rounded-xl focus:ring-2 focus:ring-[#3d0c02] focus:border-transparent transition-all placeholder:text-[#54433f]/60 text-sm outline-none"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-11 px-5 bg-[#3d0c02] text-white rounded-xl text-sm font-bold hover:bg-[#5a1204] transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span className="text-base">+</span> New Base
        </button>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-[#ece7e1] animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#ece7e1] p-16 text-center">
          <div className="text-5xl mb-4">🥣</div>
          <p className="text-[#54433f] font-semibold text-lg">
            {search ? "No bases match your search." : "No raw materials yet."}
          </p>
          {!search && (
            <p className="text-[#54433f]/70 text-sm mt-1">
              Create your first base to start tracking shared stock.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((material) => {
            const status = getStatus(material);
            const linked = material.linkedProducts || [];
            return (
              <div
                key={material.id}
                className="bg-white rounded-2xl shadow-sm border border-[#ece7e1] overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon + info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3d0c02] to-[#6b1504] flex items-center justify-center text-white text-xl shrink-0">
                      🫙
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#1d1c18] truncate">
                        {material.name}
                      </h3>
                      <p className="text-sm text-[#54433f] mt-0.5">
                        Last updated:{" "}
                        {material.updatedAt
                          ? new Date(material.updatedAt).toLocaleString()
                          : "Never"}
                      </p>
                    </div>
                  </div>

                  {/* Stock count */}
                  <div className="text-center px-4">
                    <p className="text-3xl font-extrabold text-[#1d1c18] leading-tight">
                      {material.inHandCount}
                    </p>
                    <p className="text-xs text-[#54433f] font-semibold">units</p>
                  </div>

                  {/* Status + action */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${status.cls}`}
                    >
                      {status.label}
                    </span>
                    <button
                      onClick={() =>
                        setStockModal({ open: true, material })
                      }
                      className="h-10 px-4 border-2 border-[#3d0c02] text-[#3d0c02] rounded-xl text-sm font-bold hover:bg-[#3d0c02] hover:text-white transition-all whitespace-nowrap"
                    >
                      Update Stock
                    </button>
                  </div>
                </div>

                {/* Linked products strip */}
                {linked.length > 0 && (
                  <div className="border-t border-[#f3eee8] bg-[#fef9f2] px-5 py-3 flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-[#54433f] mr-1">
                      Powers:
                    </span>
                    {linked.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#feb234]/20 text-[#624000] text-xs font-bold border border-[#feb234]/40"
                      >
                        🔗 {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateRawMaterialModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createRawMaterialMutation.isPending}
      />
      <RawMaterialStockModal
        isOpen={stockModal.open}
        material={stockModal.material}
        onClose={() => setStockModal({ open: false, material: null })}
        onSubmit={handleStockUpdate}
        isLoading={updateRawMaterialStockMutation.isPending}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────
// Tab 2: Individual Products
// ──────────────────────────────────────────────────────
function IndividualProductsTab({ onToast }) {
  const { data: categories = [], isLoading: catLoading } = useCatalogueQuery();
  const { data: inventoryData = [], isLoading: invLoading } = useInventoryQuery();
  const { data: rawMaterials = [], isLoading: rmLoading } = useRawMaterialsQuery();
  const { updateInventoryMutation } = useInventoryMutations();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalState, setModalState] = useState({
    isOpen: false,
    product: null,
    currentStock: 0,
    addQuantity: 0,
    note: "",
  });

  // Build productId → base name map from rawMaterials.linkedProducts
  const baseMap = useMemo(() => {
    const map = {};
    rawMaterials.forEach((rm) => {
      (rm.linkedProducts || []).forEach((p) => {
        map[p.id] = rm.name;
      });
    });
    return map;
  }, [rawMaterials]);

  const inventoryMap = useMemo(() => {
    const map = {};
    if (Array.isArray(inventoryData)) {
      inventoryData.forEach((inv) => {
        map[inv.productId] = inv;
      });
    }
    return map;
  }, [inventoryData]);

  const products = useMemo(() => {
    const list = [];
    categories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        const inv = inventoryMap[prod.id] || {};
        list.push({
          ...prod,
          categoryName: cat.name,
          inHandCount: inv.inHandCount || 0,
          reorderLevel: inv.reorderLevel || 0,
          updatedAt: inv.updatedAt || null,
          trackedViaBase: baseMap[prod.id] || null,
        });
      });
    });
    return list;
  }, [categories, inventoryMap, baseMap]);

  const categoryNames = useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch = p.name?.toLowerCase().includes(q);
      const matchCat =
        selectedCategory === "All" || p.categoryName === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  const openModal = (product) => {
    setModalState({
      isOpen: true,
      product,
      currentStock: product.inHandCount,
      addQuantity: 0,
      note: "",
    });
  };

  const closeModal = () =>
    setModalState({
      isOpen: false,
      product: null,
      currentStock: 0,
      addQuantity: 0,
      note: "",
    });

  const adjustQty = (delta) =>
    setModalState((prev) => ({
      ...prev,
      addQuantity: Math.max(0, prev.addQuantity + delta),
    }));

  const handleConfirm = async () => {
    if (modalState.addQuantity <= 0) {
      onToast({ type: "error", title: "Invalid Quantity", message: "Please enter a quantity greater than 0." });
      return;
    }
    try {
      const payload = { addQuantity: modalState.addQuantity };
      if (modalState.note.trim()) payload.note = modalState.note.trim();
      await updateInventoryMutation.mutateAsync({
        productId: modalState.product.id,
        payload,
      });
      onToast({
        type: "success",
        title: "Stock Added",
        message: `Added ${modalState.addQuantity} to ${modalState.product.name}.`,
      });
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.error?.[0]?.message || err?.response?.data?.message || "Failed to update stock.";
      onToast({ type: "error", title: "Update Failed", message: msg });
    }
  };

  const isLoading = catLoading || invLoading || rmLoading;

  const getStatus = (prod) => {
    if (prod.inHandCount <= 0) return { label: "Out of Stock", cls: "bg-red-100 text-[#C62828]" };
    if (prod.reorderLevel > 0 && prod.inHandCount <= prod.reorderLevel)
      return { label: "Low Stock", cls: "bg-orange-100 text-[#E65100]" };
    return { label: "In Stock", cls: "bg-green-100 text-[#2E7D32]" };
  };

  return (
    <>
      {/* Search + Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#54433f]">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#d9c1bc] rounded-xl focus:ring-2 focus:ring-[#3d0c02] focus:border-transparent transition-all placeholder:text-[#54433f]/60 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {categoryNames.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 h-9 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-[#feb234] text-[#6d4700] shadow-sm"
                : "bg-[#ece7e1] text-[#54433f] hover:bg-[#e6e2db]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#ece7e1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f3ec] border-b border-[#ece7e1]">
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">#</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Item Name</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Category</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Stock</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Status</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f]">Last Updated</th>
                <th className="px-5 py-4 text-sm font-semibold text-[#54433f] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7e1]">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center">
                    <div className="flex items-center justify-center gap-3 text-[#54433f]">
                      <div className="w-5 h-5 border-2 border-[#3d0c02] border-t-transparent rounded-full animate-spin" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-[#54433f]">
                    No products found.
                  </td>
                </tr>
              ) : (
                visible.map((prod, idx) => {
                  const status = getStatus(prod);
                  const isLinked = !!prod.trackedViaBase;
                  return (
                    <tr
                      key={prod.id}
                      className={`transition-colors ${isLinked ? "bg-[#fef9f2]" : "hover:bg-[#fefcf9]"}`}
                    >
                      <td className="px-5 py-4 text-sm text-[#54433f]">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[#1d1c18]">
                            {prod.name}
                          </span>
                          {isLinked && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#feb234]/20 text-[#624000] text-[11px] font-bold border border-[#feb234]/40 whitespace-nowrap">
                              🔗 Via {prod.trackedViaBase}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#54433f]">
                        {prod.categoryName}
                      </td>
                      <td className="px-5 py-4">
                        {isLinked ? (
                          <span className="text-sm text-[#54433f]/60 italic">
                            See Raw Materials tab
                          </span>
                        ) : (
                          <span className="text-xl font-bold text-[#1d1c18]">
                            {prod.inHandCount}{" "}
                            <span className="text-xs font-semibold opacity-60">pcs</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isLinked ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                            Base Tracked
                          </span>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${status.cls}`}
                          >
                            {status.label}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#54433f]">
                        {isLinked
                          ? "—"
                          : prod.updatedAt
                          ? new Date(prod.updatedAt).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isLinked ? (
                          <span className="text-xs text-[#54433f]/50 italic">
                            Managed by base
                          </span>
                        ) : (
                          <button
                            onClick={() => openModal(prod)}
                            className="px-4 py-2 border border-[#3d0c02] text-[#3d0c02] rounded-lg text-sm font-bold hover:bg-[#3d0c02] hover:text-white transition-all"
                          >
                            Add Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#0e0100]/40 backdrop-blur-[8px]"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden mx-6">
            <div className="px-6 pt-8 pb-5 bg-[#f8f3ec] border-b border-[#ece7e1]">
              <h2 className="text-xl font-bold text-[#3d0c02]">
                Add Stock — {modalState.product?.name}
              </h2>
              <p className="text-sm text-[#54433f] mt-0.5">
                Current: {modalState.currentStock} pcs
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#54433f]">
                  Add Quantity (pcs)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-[#DED9D3] text-[#3d0c02] hover:bg-gray-50"
                    onClick={() => adjustQty(-1)}
                  >
                    <span className="text-2xl">−</span>
                  </button>
                  <input
                    className="flex-1 h-14 text-center text-2xl font-bold border-2 border-[#DED9D3] rounded-xl focus:border-[#815500] outline-none"
                    min="0"
                    type="number"
                    value={modalState.addQuantity}
                    onChange={(e) =>
                      setModalState((prev) => ({
                        ...prev,
                        addQuantity: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                  />
                  <button
                    className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-[#DED9D3] text-[#3d0c02] hover:bg-gray-50"
                    onClick={() => adjustQty(1)}
                  >
                    <span className="text-2xl">+</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((val) => (
                  <button
                    key={val}
                    className="h-10 rounded-xl border border-[#feb234] bg-[#feb234]/10 text-[#624000] text-sm font-bold hover:bg-[#feb234]/20 transition-colors"
                    onClick={() =>
                      setModalState((prev) => ({ ...prev, addQuantity: val }))
                    }
                  >
                    +{val}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-bold text-[#54433f]">
                  Note (Optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full mt-1 p-3 border border-[#d9c1bc] rounded-xl focus:ring-2 focus:ring-[#3d0c02] outline-none text-sm resize-none"
                  placeholder="Reason for adjustment..."
                  value={modalState.note}
                  onChange={(e) =>
                    setModalState((prev) => ({ ...prev, note: e.target.value }))
                  }
                />
              </div>
              <div className="p-4 bg-[#F8F3EC] rounded-xl border border-[#DED9D3] flex justify-between items-center">
                <span className="text-sm font-bold text-[#54433f]">
                  Updated Total
                </span>
                <span className="text-xl font-bold text-[#1d1c18]">
                  {modalState.currentStock + modalState.addQuantity} pcs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex-1 h-11 text-sm font-bold text-[#54433f] hover:text-[#1d1c18] transition-colors"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className={`flex-[2] h-11 rounded-xl bg-[#feb234] text-[#6d4700] text-sm font-extrabold shadow hover:bg-[#ffbd4d] transition-colors flex justify-center items-center ${
                    updateInventoryMutation.isPending
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                  onClick={handleConfirm}
                  disabled={updateInventoryMutation.isPending}
                >
                  {updateInventoryMutation.isPending
                    ? "Updating..."
                    : "Confirm Add Stock"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────
const InventoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("raw"); // "raw" | "products"
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = ({ type = "success", title, message }) => {
    setToast({ id: Date.now(), type, title, message });
  };

  return (
    <div className="bg-[#fef9f2] text-[#1d1c18] font-sans min-h-screen">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#3d0c02] text-white shadow-md flex items-center w-full px-6 h-16">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-white/10 mr-4"
          aria-label="Back to Settings"
        >
          <span className="text-[28px]">←</span>
        </button>
        <div>
          <span className="text-xl font-bold leading-tight">
            Inventory Management
          </span>
          <p className="text-white/60 text-xs font-medium hidden sm:block">
            Track bases and individual product stock
          </p>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-24 pb-10">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#3d0c02]">Stock Management</h1>
          <p className="text-[#54433f] text-sm font-medium mt-0.5">
            Monitor and update your artisanal inventory levels.
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex gap-1 bg-[#ece7e1] p-1.5 rounded-2xl mb-7 w-full max-w-sm">
          <button
            onClick={() => setActiveTab("raw")}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${
              activeTab === "raw"
                ? "bg-white text-[#3d0c02] shadow-sm"
                : "text-[#54433f] hover:text-[#3d0c02]"
            }`}
          >
            🥣 Raw Materials
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${
              activeTab === "products"
                ? "bg-white text-[#3d0c02] shadow-sm"
                : "text-[#54433f] hover:text-[#3d0c02]"
            }`}
          >
            📦 Products
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "raw" ? (
          <RawMaterialsTab onToast={showToast} />
        ) : (
          <IndividualProductsTab onToast={showToast} />
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InventoryPage;
