import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReportStatCards from "../components/reports/ReportStatCards";
import RevenueSection from "../components/reports/RevenueSection";
import PaymentsSection from "../components/reports/PaymentsSection";
import OrdersTable from "../components/reports/OrdersTable";
import useSalesSummaryQuery from "../hooks/reports/useSalesSummaryQuery";
import useReportOrdersQuery from "../hooks/reports/useReportOrdersQuery";

export default function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("sessionId");
  const startDate = queryParams.get("startDate");
  const endDate = queryParams.get("endDate");

  const [page, setPage] = useState(1);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryQueryError,
  } = useSalesSummaryQuery({ sessionId, startDate, endDate });

  const filterForOrders = { sessionId, startDate, endDate, type: "custom" };

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersQueryError,
  } = useReportOrdersQuery(filterForOrders, page, 20);

  const orders = summaryData?.orders;
  const payments = summaryData?.payments;
  const orderRows = ordersData?.orders ?? [];
  const pagination = ordersData?.pagination;

  const displayDate = sessionId 
    ? `Session: ${sessionId.slice(-6).toUpperCase()}` 
    : (startDate && endDate) ? `${startDate} to ${endDate}` : "Summary";

  return (
    <div className="min-h-screen bg-[#fef9f2] font-sans text-[#1d1c18]">
      <header className="fixed left-0 top-0 z-50 flex h-[80px] w-full items-center justify-between bg-[#3d0c02] px-4 text-white shadow-md md:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-white/10"
            aria-label="Back"
          >
            <span className="text-[28px]">←</span>
          </button>

          <div className="flex flex-col">
            <h1 className="text-[24px] font-bold leading-tight text-white">
              Summary
            </h1>
            <p className="text-[13px] font-semibold text-white/60">
              {displayDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-[#feb234] px-5 py-2 text-[13px] font-bold text-[#3d0c02] transition hover:bg-[#ffd06a]"
        >
          <span>⬇</span> Export PDF
        </button>
      </header>

      <main className="min-h-screen px-4 pb-10 pt-[96px] md:px-6">
        <div className="mx-auto max-w-6xl">
          <section className="mb-6">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-widest text-[#54433f]/60">
              Orders
            </h2>

            {summaryLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse space-y-2 rounded-2xl border border-[#d9c1bc]/20 bg-white p-4 shadow-sm"
                  >
                    <div className="h-3 w-24 rounded bg-[#f3ede7]" />
                    <div className="h-8 w-32 rounded bg-[#f3ede7]" />
                    <div className="h-3 w-20 rounded bg-[#f3ede7]" />
                  </div>
                ))}
              </div>
            ) : summaryError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                {summaryQueryError?.response?.data?.message ||
                  summaryQueryError?.message ||
                  "Failed to load summary."}
              </p>
            ) : (
              <ReportStatCards orders={orders} />
            )}
          </section>

          {!summaryLoading && !summaryError && (
            <RevenueSection orders={orders} />
          )}

          {!summaryLoading && !summaryError && (
            <PaymentsSection payments={payments} navigate={navigate} />
          )}

          <OrdersTable
            ordersLoading={ordersLoading}
            ordersError={ordersError}
            ordersQueryError={ordersQueryError}
            orderRows={orderRows}
            pagination={pagination}
            page={page}
            setPage={setPage}
            limit={20}
          />
        </div>
      </main>
    </div>
  );
}