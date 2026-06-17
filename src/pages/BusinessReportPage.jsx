import { useLocation, useNavigate } from "react-router-dom";
import useBusinessReportQuery from "../hooks/reports/useBusinessReportQuery";

export default function BusinessReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("sessionId");
  const startDate = queryParams.get("startDate");
  const endDate = queryParams.get("endDate");

  const { data, isLoading, isError } = useBusinessReportQuery({ sessionId, startDate, endDate });

  const report = data || {};

  // KPI mappings
  const grossRevenue = Number(report.orders?.totalRevenueAmount ?? 4280.50);
  const collected = Number(report.payments?.totalCollectedPayments ?? 3950.00);
  const outstanding = Number(report.payments?.liability?.unpaidAmount ?? 330.50);
  const netProfit = Number(report.profitAndLoss?.netProfit ?? 1840.25);
  const totalOrders = Number(report.orders?.totalOrderCount ?? 148);
  
  // PnL Statement
  const cogs = Number(report.profitAndLoss?.cogs ?? 1540.25);
  const grossProfit = Number(report.profitAndLoss?.grossProfit ?? 2740.25);
  const operatingExpenses = Number(report.profitAndLoss?.operatingExpenses?.totalExpenses ?? 900.00);

  // Payments
  const paymentBreakdown = report.payments?.paymentBreakdown || { cash: 1250, upi: 2100, card: 600 };
  const paymentsCash = Number(paymentBreakdown.cash ?? 1250);
  const paymentsUpi = Number(paymentBreakdown.upi ?? 2100);
  const paymentsCard = Number(paymentBreakdown.card ?? 600);
  const totalPayments = (paymentsCash + paymentsUpi + paymentsCard) || 1; // avoid div 0
  
  // Orders Performance
  const ordersPerformance = { 
    completed: Number(report.orders?.completedOrdersCount ?? 134), 
    cancelled: Number(report.orders?.cancelledOrderCount ?? 6), 
    due: Number(report.orders?.dueOrderCount ?? 8) 
  };

  // Cash Drawer
  const cashDrawer = { 
    opening: Number(report.cashDrawer?.openingCash ?? 200), 
    collected: Number(report.cashDrawer?.cashCollected ?? 1250), 
    expenses: Number(report.cashDrawer?.cashExpenses ?? 150), 
    expected: Number(report.cashDrawer?.expectedCashInDrawer ?? 1300) 
  };

  // Expenses Breakdown
  const expensesList = report.expenses && report.expenses.length > 0 
    ? report.expenses.map(e => ({
        category: e.categoryName,
        amount: Number(e.amount || 0),
        date: e.expenseDate ? new Date(e.expenseDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-",
        note: e.note || "-"
      }))
    : [
        { category: "Salary", amount: 450, date: "Oct 12, 2023", note: "Part-time staff weekly wages" },
        { category: "Packaging", amount: 130, date: "Oct 12, 2023", note: "Premium Gift Boxes" },
        { category: "Utilities", amount: 120, date: "Oct 11, 2023", note: "Internet + Power Top-up" },
        { category: "Rent", amount: 200, date: "Oct 10, 2023", note: "Daily stall prorated rent" }
      ];

  const maxExpenseAmount = Math.max(...expensesList.map(e => e.amount), 1);

  // Top Sellers
  const topSellers = report.orders?.topSellingProducts && report.orders.topSellingProducts.length > 0 
    ? report.orders.topSellingProducts.map(item => ({
        itemName: item.name || "Unknown Item",
        quantitySold: Number(item.quantity || 0)
      }))
    : [
        { itemName: "Signature Chocolate Cake", quantitySold: 42 },
        { itemName: "Almond Croissant", quantitySold: 38 },
        { itemName: "Espresso Truffle", quantitySold: 25 },
        { itemName: "Vanilla Bean Macaron", quantitySold: 20 }
      ];

  const maxTopSellerQuantity = Math.max(...topSellers.map(i => i.quantitySold), 1);

  // Peak Hours Calculation
  const peakHoursRaw = report.orders?.peakHours || [];
  let startHour = 9; // Default 9 AM
  if (peakHoursRaw.length > 0) {
    const hours = peakHoursRaw.map(p => parseInt(p.hour.split(':')[0], 10)).filter(h => !isNaN(h));
    if (hours.length > 0) {
      const minHr = Math.min(...hours);
      startHour = Math.max(0, minHr - 2); 
    }
  }
  const hoursData = Array.from({ length: 10 }, (_, i) => {
    const hour24 = startHour + i;
    const hourStr = `${hour24.toString().padStart(2, '0')}:00`;
    const found = peakHoursRaw.find(p => p.hour === hourStr);
    const orderCount = found ? found.orderCount : 0;
    const ampm = hour24 >= 12 ? 'pm' : 'am';
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
    return { hourStr, label: `${hour12}${ampm}`, count: orderCount };
  });
  const maxPeakCount = Math.max(...hoursData.map(h => h.count), 1);
  const peakThreshold = maxPeakCount > 1 ? maxPeakCount * 0.7 : 9999;

  if (isLoading) {
    return <div className="min-h-screen bg-[#fef9f2] flex items-center justify-center">Loading Report...</div>;
  }

  if (isError) {
    return <div className="min-h-screen bg-[#fef9f2] flex items-center justify-center text-red-500">Failed to load business report.</div>;
  }

  return (
    <div className="min-h-screen bg-[#fef9f2] font-sans text-[#1d1c18]">
      <header className="fixed top-0 w-full z-50 bg-[#0e0100] dark:bg-[#3d0c02] text-white dark:text-[#bf715c] font-sans font-bold shadow-md shadow-[0_4px_8px_-2px_rgba(61,12,2,0.08)] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:opacity-80">← Back</button>
        </div>
        <div className="flex items-center gap-6">
          <button className="hover:opacity-90 transition-opacity active:scale-95 duration-200">
            <span className="text-xl">👤</span>
          </button>
        </div>
      </header>

      <main className="mt-16 p-6 min-h-screen bg-[#fef9f2] max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(61,12,2,0.06)] border border-[#f2ede6]">
            <p className="text-[#54433f] text-xs font-bold uppercase tracking-wider mb-2">Gross Revenue</p>
            <h3 className="text-3xl font-extrabold text-[#0e0100]">₹{grossRevenue.toFixed(2)}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(61,12,2,0.06)] border border-[#f2ede6]">
            <p className="text-[#54433f] text-xs font-bold uppercase tracking-wider mb-2">Collected</p>
            <h3 className="text-3xl font-extrabold text-[#0e0100]">₹{collected.toFixed(2)}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(61,12,2,0.06)] border border-[#f2ede6]">
            <p className="text-[#54433f] text-xs font-bold uppercase tracking-wider mb-2">Outstanding</p>
            <h3 className="text-3xl font-extrabold text-[#ba1a1a]">₹{outstanding.toFixed(2)}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(61,12,2,0.06)] border border-[#f2ede6]">
            <p className="text-[#54433f] text-xs font-bold uppercase tracking-wider mb-2">Net Profit</p>
            <h3 className="text-3xl font-extrabold text-green-700">₹{netProfit.toFixed(2)}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(61,12,2,0.06)] border border-[#f2ede6]">
            <p className="text-[#54433f] text-xs font-bold uppercase tracking-wider mb-2">Total Orders</p>
            <h3 className="text-3xl font-extrabold text-[#0e0100]">{totalOrders}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_16px_rgba(61,12,2,0.06)] overflow-hidden border border-[#f2ede6]">
            <div className="px-6 py-4 bg-[#3d0c02] text-[#bf715c] flex justify-between items-center">
              <h2 className="font-bold text-lg text-white">Profit &amp; Loss Statement</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#f2ede6]">
                <span className="text-[#54433f] font-medium">Total Revenue</span>
                <span className="text-[#1d1c18] font-bold">₹{grossRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#f2ede6]">
                <span className="text-[#54433f] font-medium">Cost of Goods Sold (COGS)</span>
                <span className="text-[#1d1c18] font-bold text-[#ba1a1a]">(₹{cogs.toFixed(2)})</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-[#f8f3ec] px-4 rounded-xl">
                <span className="text-[#0e0100] font-bold">Gross Profit</span>
                <span className="text-[#0e0100] font-bold text-xl">₹{grossProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#f2ede6]">
                <span className="text-[#54433f] font-medium">Operating Expenses</span>
                <span className="text-[#1d1c18] font-bold text-[#ba1a1a]">(₹{operatingExpenses.toFixed(2)})</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-xl border border-green-100">
                <span className="text-green-800 font-bold">Net Profit</span>
                <span className="text-green-800 font-bold text-2xl">₹{netProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(61,12,2,0.06)] border border-[#f2ede6]">
              <h2 className="font-bold text-lg mb-4 text-[#0e0100]">Payment Breakdown</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Cash</span>
                    <span className="text-[#0e0100]">₹{paymentsCash.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full bg-[#f2ede6] rounded-full">
                    <div className="h-full bg-[#3d0c02] rounded-full" style={{ width: `${(paymentsCash/totalPayments)*100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>UPI / Digital</span>
                    <span className="text-[#0e0100]">₹{paymentsUpi.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full bg-[#f2ede6] rounded-full">
                    <div className="h-full bg-[#feb234] rounded-full" style={{ width: `${(paymentsUpi/totalPayments)*100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Card Payments</span>
                    <span className="text-[#0e0100]">₹{paymentsCard.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full bg-[#f2ede6] rounded-full">
                    <div className="h-full bg-[#86736e] rounded-full" style={{ width: `${(paymentsCard/totalPayments)*100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(61,12,2,0.06)] border border-[#f2ede6]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-[#0e0100]">Orders Performance</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-3 bg-[#f8f3ec] rounded-xl">
                <p className="text-[10px] uppercase font-bold text-[#54433f]">Completed</p>
                <p className="text-xl font-extrabold text-[#0e0100]">{ordersPerformance.completed}</p>
              </div>
              <div className="p-3 bg-[#f8f3ec] rounded-xl">
                <p className="text-[10px] uppercase font-bold text-[#54433f]">Cancelled</p>
                <p className="text-xl font-extrabold text-[#ba1a1a]">{ordersPerformance.cancelled}</p>
              </div>
              <div className="p-3 bg-[#f8f3ec] rounded-xl">
                <p className="text-[10px] uppercase font-bold text-[#54433f]">Due / Open</p>
                <p className="text-xl font-extrabold text-[#815500]">{ordersPerformance.due}</p>
              </div>
            </div>
            
            <h3 className="text-sm font-bold text-[#54433f] mb-4">Peak Hours (Volume)</h3>
            <div className="flex items-end justify-between h-32 gap-1 px-2">
              {hoursData.map((hr, idx) => {
                const isPeak = hr.count > 0 && hr.count >= peakThreshold;
                const heightPct = Math.max((hr.count / maxPeakCount) * 100, 5); // min 5% height for visual
                return (
                  <div key={idx} className={`w-full rounded-t-sm group relative transition-colors ${isPeak ? 'bg-[#feb234]' : 'bg-[#f2ede6] hover:bg-[#feb234]'}`} style={{ height: `${heightPct}%` }}>
                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded font-bold text-[10px] whitespace-nowrap ${isPeak ? 'opacity-100 bg-[#0e0100] text-white' : 'opacity-0 group-hover:opacity-100 bg-[#0e0100] text-white'}`}>
                      {isPeak ? 'Peak' : hr.label}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-[#54433f] font-bold mt-2 px-1">
              <span>{hoursData[0].label.toUpperCase()}</span>
              <span>{hoursData[2].label.toUpperCase()}</span>
              <span>{hoursData[5].label.toUpperCase()}</span>
              <span>{hoursData[7].label.toUpperCase()}</span>
              <span>{hoursData[9].label.toUpperCase()}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(61,12,2,0.06)] border border-[#f2ede6] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-[#0e0100]">Cash Drawer Summary</h2>
            </div>
            <div className="space-y-6 flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#54433f]">Opening Cash</p>
                  <p className="text-lg font-bold">₹{cashDrawer.opening.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#54433f]">Cash Collected</p>
                  <p className="text-lg font-bold text-green-700">+ ₹{cashDrawer.collected.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#54433f]">Drawer Expenses</p>
                  <p className="text-lg font-bold text-[#ba1a1a]">- ₹{cashDrawer.expenses.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[#f2ede6]">
              <div className="flex justify-between items-end">
                <p className="text-sm font-bold text-[#54433f]">Expected Cash In Hand</p>
                <p className="text-3xl font-extrabold text-[#0e0100]">₹{cashDrawer.expected.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(61,12,2,0.06)] border border-[#f2ede6] overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#f2ede6] flex justify-between items-center">
            <h2 className="font-bold text-lg text-[#0e0100]">Top Sellers Items</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#3d0c02]"></span>
                <span className="text-[10px] font-bold text-[#54433f] uppercase">Top 1</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#feb234]"></span>
                <span className="text-[10px] font-bold text-[#54433f] uppercase">Top 2</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#86736e]"></span>
                <span className="text-[10px] font-bold text-[#54433f] uppercase">Top 3</span>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              {topSellers.slice(0, 4).map((item, idx) => {
                const colors = ['bg-[#3d0c02]', 'bg-[#feb234]', 'bg-[#86736e]', 'bg-[#b27947]'];
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="truncate pr-2">{item.itemName}</span>
                      <span className="text-[#0e0100]">{item.quantitySold} units</span>
                    </div>
                    <div className="h-3 w-full bg-[#f2ede6] rounded-full overflow-hidden">
                      <div className={`h-full ${colors[idx % colors.length]}`} style={{ width: `${(item.quantitySold / maxTopSellerQuantity) * 100}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-[#54433f] uppercase tracking-wider border-b border-[#f2ede6]">
                    <th className="pb-3 px-2">Item Name</th>
                    <th className="pb-3 px-2">Quantity Sold</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ede6]">
                  {topSellers.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#f2ede6] text-sm">
                      <td className="py-3 px-2 font-bold text-[#0e0100]">{item.itemName}</td>
                      <td className="py-3 px-2 text-[#54433f] font-medium">{item.quantitySold} units</td>
                      <td className="py-3 px-2 text-right">
                        <button className="text-[#86736e] hover:text-[#0e0100] transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(61,12,2,0.06)] border border-[#f2ede6] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f2ede6] flex justify-between items-center">
            <h2 className="font-bold text-lg text-[#0e0100]">Operating Expenses Breakdown</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#3d0c02]"></span>
                <span className="text-[10px] font-bold text-[#54433f] uppercase">Staff</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#feb234]"></span>
                <span className="text-[10px] font-bold text-[#54433f] uppercase">Admin</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#86736e]"></span>
                <span className="text-[10px] font-bold text-[#54433f] uppercase">Utility</span>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              {expensesList.slice(0, 4).map((exp, idx) => {
                const colors = ['bg-[#3d0c02]', 'bg-[#feb234]', 'bg-[#86736e]', 'bg-[#b27947]'];
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="truncate pr-2">{exp.category}</span>
                      <span className="text-[#0e0100]">₹{exp.amount.toFixed(2)}</span>
                    </div>
                    <div className="h-3 w-full bg-[#f2ede6] rounded-full overflow-hidden">
                      <div className={`h-full ${colors[idx % colors.length]}`} style={{ width: `${(exp.amount / maxExpenseAmount) * 100}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-[#54433f] uppercase tracking-wider border-b border-[#f2ede6]">
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Note / Vendor</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ede6]">
                  {expensesList.map((exp, idx) => (
                    <tr key={idx} className="hover:bg-[#f2ede6] text-sm">
                      <td className="py-3 px-2 font-bold text-[#0e0100]">{exp.category}</td>
                      <td className="py-3 px-2 font-bold">₹{exp.amount.toFixed(2)}</td>
                      <td className="py-3 px-2 text-[#54433f]">{exp.date}</td>
                      <td className="py-3 px-2 text-xs">{exp.note}</td>
                      <td className="py-3 px-2 text-right">
                        <button className="text-[#86736e] hover:text-[#0e0100] transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
