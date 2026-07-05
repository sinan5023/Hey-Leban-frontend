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
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#54433f]/60">
          All Orders {pagination ? `(${pagination.totalCount})` : ""}
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#d9c1bc]/20 bg-white shadow-sm">
        <div className="hidden grid-cols-[80px_1fr_140px_100px_90px_100px] gap-2 border-b border-[#f0ece6] bg-[#faf7f3] px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#54433f]/60 md:grid">
          <span>Token</span>
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
                  className="grid grid-cols-[80px_1fr_140px_100px_90px_100px] items-center gap-2 px-4 py-3 text-[13px] transition hover:bg-[#faf7f3]"
                >
                  <span className="font-bold text-[#3d0c02]">#{order.tokenNo}</span>
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
                <div key={order.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3d0c02]">#{order.tokenNo}</span>
                    <StatusBadge status={order.status} />
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
    </section>
  );
}