import { useState, useEffect } from "react";
import { fetchOrderById } from "../../services/orderService";
import { printBill } from "../../utils/printHelpers";

function StatusBadge({ status }) {
  const map = {
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    OPEN: "bg-yellow-100 text-yellow-800",
    DUE: "bg-orange-100 text-orange-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[status] || "bg-gray-100 text-gray-700"
        }`}
    >
      {status}
    </span>
  );
}

function PaymentMethodBadge({ method }) {
  const map = {
    CASH: "bg-[#3d0c02]/10 text-[#3d0c02]",
    UPI: "bg-[#feb234]/20 text-[#7a4d00]",
    CARD: "bg-blue-100 text-blue-800",
    SPLIT: "bg-purple-100 text-purple-800",
    NOTPAID: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[method] || "bg-gray-100 text-gray-700"
        }`}
    >
      {method}
    </span>
  );
}

export default function OrdersTable({
  ordersLoading,
  ordersError,
  ordersQueryError,
  orderRows,
  pagination,
  page,
  setPage,
  limit,
}) {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fullOrder, setFullOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    if (!selectedOrderId || !modalOpen) return;

    const fetchDetails = async () => {
      setModalLoading(true);
      setModalError("");
      try {
        const order = await fetchOrderById(selectedOrderId);
        setFullOrder(order);
      } catch (err) {
        setModalError(err?.response?.data?.message || "Failed to load order details.");
      } finally {
        setModalLoading(false);
      }
    };

    fetchDetails();
  }, [selectedOrderId, modalOpen]);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#54433f]/60">
          All Orders {pagination ? `(${pagination.totalCount})` : ""}
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#d9c1bc]/20 bg-white shadow-sm">
        <div className="hidden grid-cols-[70px_130px_120px_1fr_120px_90px_90px_95px] gap-2 border-b border-[#f0ece6] bg-[#faf7f3] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#54433f]/60 md:grid">
          <span>Token</span>
          <span>Order No</span>
          <span>KOT No</span>
          <span>Items</span>
          <span>Time</span>
          <span>Total Paid</span>
          <span>Payment</span>
          <span>Status</span>
        </div>

        {ordersLoading ? (
          <div className="divide-y divide-[#f0ece6]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-3 animate-pulse">
                <div className="h-4 w-12 rounded bg-[#f3ede7]" />
                <div className="h-4 flex-grow rounded bg-[#f3ede7]" />
                <div className="h-4 w-24 rounded bg-[#f3ede7]" />
              </div>
            ))}
          </div>
        ) : ordersError ? (
          <p className="px-4 py-6 text-[13px] text-[#a12c7b]">
            {ordersQueryError?.response?.data?.message ||
              ordersQueryError?.message ||
              "Failed to load orders."}
          </p>
        ) : orderRows.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-[#54433f]/40">
            <span className="text-[36px]">🧾</span>
            <p className="mt-2 text-[14px] font-semibold">No orders found</p>
            <p className="text-[12px]">Try a different date range</p>
          </div>
        ) : (
          <>
            <div className="hidden divide-y divide-[#f0ece6] md:block">
              {orderRows.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setModalOpen(true);
                  }}
                  className="grid grid-cols-[70px_130px_120px_1fr_120px_90px_90px_95px] items-center gap-2 px-4 py-3 text-[13px] transition hover:bg-[#faf7f3] cursor-pointer"
                >
                  <span className="font-bold text-[#3d0c02]">#{order.tokenNo}</span>
                  <span className="font-semibold text-[#1d1c18]">{order.orderNo || "—"}</span>
                  <span className="font-semibold text-[#54433f]/80">{order.kot?.kotNo || "—"}</span>
                  <span className="truncate text-[#54433f]">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </span>
                  <span className="text-[11px] text-[#54433f]/60">
                    {new Date(order.orderTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-bold text-[#1d1c18]">
                    ₹{order.totalPaid.toLocaleString("en-IN")}
                  </span>
                  <PaymentMethodBadge method={order.paymentMethod} />
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>

            <div className="divide-y divide-[#f0ece6] md:hidden">
              {orderRows.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setModalOpen(true);
                  }}
                  className="space-y-3 px-4 py-4 cursor-pointer hover:bg-[#faf7f3]/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3d0c02]">#{order.tokenNo}</span>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#54433f]/80 font-bold bg-[#faf7f3] px-2.5 py-1.5 rounded-xl border border-[#f0ece6]">
                    <span>Order: {order.orderNo || "—"}</span>
                    {order.kot?.kotNo && <span>• KOT: {order.kot.kotNo}</span>}
                  </div>

                  <p className="text-[13px] text-[#54433f]">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#54433f]/70">
                    <span>
                      {new Date(order.orderTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-bold text-[#1d1c18]">
                      ₹{order.totalPaid.toLocaleString("en-IN")}
                    </span>
                    <PaymentMethodBadge method={order.paymentMethod} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-[#f0ece6] px-4 py-3 md:flex-row md:items-center md:justify-between">
            <p className="text-[12px] text-[#54433f]/60">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, pagination.totalCount)} of {pagination.totalCount}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-[#d9c1bc] px-3 py-1.5 text-[12px] font-bold text-[#54433f] transition hover:bg-[#f3ede7] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>

              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-lg text-[12px] font-bold transition ${page === p
                        ? "bg-[#3d0c02] text-white"
                        : "border border-[#d9c1bc] text-[#54433f] hover:bg-[#f3ede7]"
                      }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[#d9c1bc] px-3 py-1.5 text-[12px] font-bold text-[#54433f] transition hover:bg-[#f3ede7] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Receipt/Bill Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-[360px] bg-white text-[#1d1c18] font-mono p-6 shadow-2xl rounded-2xl border-4 border-double border-[#ded9d3] max-h-[85vh] overflow-y-auto flex flex-col">
            
            {/* Close trigger top-right */}
            <button
              onClick={() => {
                setModalOpen(false);
                setFullOrder(null);
                setSelectedOrderId(null);
              }}
              className="absolute right-4 top-4 text-[#86736e] hover:text-[#0e0100] text-xl transition-colors font-sans"
            >
              ✕
            </button>

            {modalLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <span className="inline-block w-8 h-8 border-4 border-[#3d0c02] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-[#54433f]/70">Retrieving Bill...</span>
              </div>
            ) : modalError ? (
              <div className="py-12 text-center text-red-600 text-xs font-bold space-y-4">
                <p>⚠️ {modalError}</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 bg-[#3d0c02] text-white rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            ) : fullOrder ? (
              <div className="space-y-4">
                {/* Receipt Header */}
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-extrabold tracking-widest text-[#3d0c02]">HEY LEBAN</h3>
                  <p className="text-[10px] text-[#54433f]/70 uppercase font-semibold">Gourmet Mediterranean</p>
                  <div className="border-b border-dashed border-[#d9c1bc] my-2" />
                  <p className="text-[11px] font-bold text-[#1d1c18]">{fullOrder.orderNo}</p>
                  <p className="text-[13px] font-black text-[#E8A020]">TOKEN #{fullOrder.tokenNo}</p>
                  <p className="text-[10px] text-[#54433f]/80">
                    {new Date(fullOrder.createdAt || fullOrder.orderTime).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-[10px] font-bold text-[#54433f]/70 uppercase">
                    TYPE: {fullOrder.orderType?.replace(/_/g, " ") || "DINE IN"}
                  </p>
                </div>

                <div className="border-b border-dashed border-[#d9c1bc]" />

                {/* Items list */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-[#54433f] uppercase">
                    <span>Item & Qty</span>
                    <span>Total</span>
                  </div>
                  <div className="border-b border-dotted border-[#d9c1bc]/60 my-1" />
                  <div className="space-y-1.5">
                    {fullOrder.orderItems?.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs items-start leading-tight">
                        <div className="pr-4">
                          <p className="font-bold text-[#1d1c18]">{item.name}</p>
                          <p className="text-[10px] text-[#54433f]/80 font-semibold">
                            {Number(item.quantity)} x ₹{Number(item.price).toFixed(2)}
                          </p>
                          {item.note && (
                            <p className="text-[9px] text-[#ba1a1a] italic mt-0.5">
                              * Note: {item.note}
                            </p>
                          )}
                        </div>
                        <span className="font-bold shrink-0">₹{Number(item.total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-b border-dashed border-[#d9c1bc]" />

                {/* Bill totals */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-80">Subtotal</span>
                    <span>₹{Number(fullOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {Number(fullOrder.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-[#ba1a1a]">
                      <span className="opacity-80">Discount</span>
                      <span>-₹{Number(fullOrder.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-b border-dotted border-[#d9c1bc]/60 my-1" />
                  <div className="flex justify-between text-sm font-black text-[#1d1c18]">
                    <span>Grand Total</span>
                    <span>₹{Number(fullOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-green-700">
                    <span>Amount Paid</span>
                    <span>₹{Number(fullOrder.totalPaid || 0).toFixed(2)}</span>
                  </div>
                  {Number(fullOrder.balanceDue || 0) > 0 && (
                    <div className="flex justify-between text-xs font-bold text-red-600">
                      <span>Balance Due</span>
                      <span>₹{Number(fullOrder.balanceDue).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Payment split breakdown */}
                {fullOrder.payments && fullOrder.payments.length > 0 && (
                  <div className="bg-[#f8f3ec]/40 rounded-lg p-2.5 space-y-1 text-[10px] border border-[#f2ede6]">
                    <p className="font-bold text-[#54433f] uppercase mb-1">Payment Method Split:</p>
                    {fullOrder.payments.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-[#1d1c18]">
                        <span className="capitalize">• {(p.paymentMethod || p.method || "CASH").toLowerCase()}</span>
                        <span className="font-bold">₹{Number(p.amount || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Note */}
                {fullOrder.note && (
                  <div className="bg-yellow-50/60 rounded-lg p-2.5 text-[10px] text-[#54433f] border border-yellow-100">
                    <p className="font-bold uppercase mb-0.5">Order Note:</p>
                    <p className="italic">{fullOrder.note}</p>
                  </div>
                )}

                <div className="border-b border-dashed border-[#d9c1bc]" />

                {/* Greeting footer */}
                <div className="text-center text-[10px] text-[#54433f]/70 font-bold space-y-0.5 uppercase tracking-wider">
                  <p>Thank you for dining with us!</p>
                  <p>Have a wonderful day!</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => printBill(fullOrder)}
                    className="flex-1 h-10 bg-[#feb234] hover:bg-[#e8a020] text-[#3d0c02] text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 uppercase font-sans"
                  >
                    <span>🖨️</span> Print Bill
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setFullOrder(null);
                      setSelectedOrderId(null);
                    }}
                    className="flex-1 h-10 border border-[#ded9d3] hover:bg-[#f8f3ec] text-[#3d0c02] text-xs font-bold rounded-xl transition-all active:scale-95 uppercase font-sans"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}