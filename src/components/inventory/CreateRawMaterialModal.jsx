// src/components/inventory/CreateRawMaterialModal.jsx
import { useState } from "react";

function CreateRawMaterialModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    name: "",
    inHandCount: "",
    reorderLevel: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Base name is required.";
    if (form.inHandCount !== "" && isNaN(Number(form.inHandCount)))
      next.inHandCount = "Must be a valid number.";
    if (Number(form.inHandCount) < 0)
      next.inHandCount = "Cannot be negative.";
    if (form.reorderLevel !== "" && isNaN(Number(form.reorderLevel)))
      next.reorderLevel = "Must be a valid number.";
    if (Number(form.reorderLevel) < 0)
      next.reorderLevel = "Cannot be negative.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { name: form.name.trim() };
    if (form.inHandCount !== "") payload.inHandCount = Number(form.inHandCount);
    if (form.reorderLevel !== "") payload.reorderLevel = Number(form.reorderLevel);
    onSubmit(payload);
  };

  const handleClose = () => {
    setForm({ name: "", inHandCount: "", reorderLevel: "" });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#0e0100]/50 backdrop-blur-[6px]"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-[#3d0c02] to-[#6b1504] text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg">
              🥣
            </div>
            <h2 className="text-xl font-bold">New Raw Material</h2>
          </div>
          <p className="text-white/70 text-sm">
            Create a shared base that multiple products can draw stock from.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-[#3d0c02] mb-1">
              Base Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Salankatiya Base"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl border border-[#ded9d3] bg-[#fef9f2] outline-none focus:border-[#E8A020] text-sm transition-colors"
            />
            {errors.name && (
              <p className="mt-1 text-xs font-bold text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Initial Count + Reorder Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-[#3d0c02] mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.inHandCount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, inHandCount: e.target.value }))
                }
                className="w-full h-11 px-3 rounded-xl border border-[#ded9d3] bg-[#fef9f2] outline-none focus:border-[#E8A020] text-sm transition-colors"
              />
              {errors.inHandCount && (
                <p className="mt-1 text-xs font-bold text-red-600">
                  {errors.inHandCount}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#3d0c02] mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.reorderLevel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reorderLevel: e.target.value }))
                }
                className="w-full h-11 px-3 rounded-xl border border-[#ded9d3] bg-[#fef9f2] outline-none focus:border-[#E8A020] text-sm transition-colors"
              />
              {errors.reorderLevel && (
                <p className="mt-1 text-xs font-bold text-red-600">
                  {errors.reorderLevel}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-[#54433f] bg-[#f8f3ec] rounded-xl px-4 py-3 border border-[#ede7e0]">
            💡 Products linked to this base will automatically draw stock from it
            when orders are placed.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-11 rounded-xl border-2 border-[#ded9d3] text-sm font-bold text-[#54433f] hover:border-[#3d0c02] hover:text-[#3d0c02] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex-[2] h-11 rounded-xl text-sm font-extrabold text-white shadow-lg transition-all ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#3d0c02] hover:bg-[#5a1204]"
              }`}
            >
              {isLoading ? "Creating..." : "Create Base"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRawMaterialModal;
