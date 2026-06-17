function OrdersSearchDropdown({
  open,
  loading,
  result,
  error,
  onSelect,
}) {
  if (!open) return null;

  return (
    <div className="absolute top-[calc(100%+8px)] z-[150] w-full rounded-2xl border border-[#ded9d3] bg-white p-2 shadow-2xl text-[#3d0c02]">
      {loading ? (
        <div className="px-3 py-4 text-sm text-[#54433f]">Searching...</div>
      ) : error ? (
        <div className="px-3 py-4 text-sm text-red-600">Search failed.</div>
      ) : result ? (
        <button
          type="button"
          onClick={() => onSelect(result)}
          className="w-full rounded-xl px-3 py-3 text-left hover:bg-[#f8f3ec]"
        >
          <p className="text-sm font-bold">
            {result.type === "ORDER" ? result.data.orderNo : result.data.kotNo}
          </p>

          <p className="mt-1 text-xs text-[#54433f]">
            {result.type === "ORDER"
              ? `Token #${result.data.tokenNo} • ${result.data.status}`
              : `${result.data.order.orderNo} • Token #${result.data.order.tokenNo}`}
          </p>
        </button>
      ) : (
        <div className="px-3 py-4 text-sm text-[#54433f]">No ticket found.</div>
      )}
    </div>
  );
}

export default OrdersSearchDropdown;