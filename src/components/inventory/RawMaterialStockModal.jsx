// src/components/inventory/RawMaterialStockModal.jsx
import { useState } from "react";

function RawMaterialStockModal({ isOpen, material, onClose, onSubmit, isLoading }) {
  const [mode, setMode] = useState("add"); // "add" | "set"
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");

  const adjustQuantity = (delta) =>
    setQuantity((prev) => Math.max(0, prev + delta));

  const handleClose = () => {
    setMode("add");
    setQuantity(0);
    setNote("");
    onClose();
  };

  const handleConfirm = () => {
    if (quantity <= 0 && mode === "add") return;
    const payload = {};
    if (mode === "add") payload.addQuantity = quantity;
    else payload.setQuantity = quantity;
    if (note.trim()) payload.note = note.trim();
    onSubmit(payload);
  };

  if (!isOpen || !material) return null;

  const previewStock =
    mode === "add"
      ? material.inHandCount + quantity
      : quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#0e0100]/50 backdrop-blur-[6px]"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 bg-[#f8f3ec] border-b border-[#ece7e1]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#3d0c02]">
                Update Stock — {material.name}
              </h2>
              <p className="text-sm text-[#54433f] mt-0.5">
                Current stock:{" "}
                <span className="font-bold text-[#1d1c18]">
                  {material.inHandCount} pcs
                </span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-[#54433f]/60 hover:text-[#3d0c02] text-2xl leading-none mt-0.5"
            >
              ×
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { setMode("add"); setQuantity(0); }}
              className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${
                mode === "add"
                  ? "bg-[#3d0c02] text-white shadow"
                  : "bg-white border border-[#ded9d3] text-[#54433f]"
              }`}
            >
              ➕ Add / Subtract
            </button>
            <button
              onClick={() => { setMode("set"); setQuantity(0); }}
              className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${
                mode === "set"
                  ? "bg-[#3d0c02] text-white shadow"
                  : "bg-white border border-[#ded9d3] text-[#54433f]"
              }`}
            >
              ✏️ Set Exact Count
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Stepper */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#54433f]">
              {mode === "add" ? "Quantity to Add" : "New Stock Count"}
            </label>
            <div className="flex items-center gap-3">
              <button
                className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-[#ded9d3] text-[#3d0c02] hover:bg-gray-50 transition-colors"
                onClick={() => adjustQuantity(-1)}
              >
                <span className="text-2xl">−</span>
              </button>
              <input
                type="number"
                min="0"
                className="flex-1 h-14 text-center text-2xl font-bold border-2 border-[#ded9d3] rounded-xl focus:border-[#815500] outline-none transition-colors"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(0, parseInt(e.target.value) || 0))
                }
              />
              <button
                className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-[#ded9d3] text-[#3d0c02] hover:bg-gray-50 transition-colors"
                onClick={() => adjustQuantity(1)}
              >
                <span className="text-2xl">+</span>
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 25, 50].map((val) => (
              <button
                key={val}
                onClick={() => setQuantity(val)}
                className="h-10 rounded-xl border border-[#feb234] bg-[#feb234]/10 text-[#624000] text-sm font-bold hover:bg-[#feb234]/25 transition-colors"
              >
                {mode === "add" ? `+${val}` : val}
              </button>
            ))}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-bold text-[#54433f] mb-1">
              Note <span className="font-normal text-[#54433f]/60">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Reason for adjustment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 border border-[#d9c1bc] rounded-xl focus:ring-2 focus:ring-[#3d0c02] outline-none transition-all text-sm resize-none"
            />
          </div>

          {/* Preview */}
          <div className="flex justify-between items-center px-4 py-3 bg-[#f8f3ec] rounded-xl border border-[#ede7e0]">
            <span className="text-sm font-bold text-[#54433f]">
              {mode === "add" ? "Updated Total" : "New Count"}
            </span>
            <span className="text-xl font-bold text-[#1d1c18]">
              {previewStock} pcs
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 h-11 text-sm font-bold text-[#54433f] hover:text-[#1d1c18] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || (mode === "add" && quantity <= 0)}
              className={`flex-[2] h-11 rounded-xl text-sm font-extrabold text-[#6d4700] shadow transition-all ${
                isLoading || (mode === "add" && quantity <= 0)
                  ? "bg-gray-200 cursor-not-allowed text-gray-400"
                  : "bg-[#feb234] hover:bg-[#ffbd4d]"
              }`}
            >
              {isLoading ? "Saving..." : "Confirm Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RawMaterialStockModal;
