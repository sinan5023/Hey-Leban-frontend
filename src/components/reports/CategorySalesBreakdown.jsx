import { useEffect, useState, useMemo } from "react";
import { fetchCatalogue } from "../../services/catalogueService";

export default function CategorySalesBreakdown({ topSellingProducts = [] }) {
  const [catalogue, setCatalogue] = useState([]);
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchCatalogue()
      .then((cats) => {
        if (isMounted) setCatalogue(cats || []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const salesBreakdown = useMemo(() => {
    if (!topSellingProducts || topSellingProducts.length === 0) return null;

    // Build lookup: product name (lowercase) → category name
    const nameToCat = {};
    catalogue.forEach((cat) => {
      (cat.products || []).forEach((p) => {
        nameToCat[p.name?.toLowerCase()] = cat.name;
      });
    });

    const catMap = {};
    const itemList = [];
    topSellingProducts.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const catName = nameToCat[item.name?.toLowerCase()] || "Others";
      catMap[catName] = (catMap[catName] || 0) + qty;
      itemList.push({ name: item.name, qty, category: catName });
    });

    const categories = Object.entries(catMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    itemList.sort((a, b) => b.qty - a.qty);

    return { categories, items: itemList };
  }, [topSellingProducts, catalogue]);

  if (!salesBreakdown || salesBreakdown.categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-[#d9c1bc]/30 bg-[#fef9f2] p-5 shadow-[0_4px_8px_rgba(61,12,2,0.08)]">
      <h3 className="mb-4 flex items-center gap-2 text-[18px] font-bold text-[#0e0100]">
        🧾 Sales Breakdown (Category & Items)
        <span className="ml-auto text-[12px] font-semibold text-[#54433f] opacity-70">
          {salesBreakdown.items.length} item{salesBreakdown.items.length !== 1 ? "s" : ""} sold
        </span>
      </h3>

      {/* Category Filter Pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {salesBreakdown.categories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setExpandedCat(expandedCat === cat.name ? null : cat.name)}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-bold transition-all ${
              expandedCat === cat.name
                ? "border-[#3d0c02] bg-[#3d0c02] text-white shadow-md"
                : "border-[#d9c1bc] bg-[#f8f3ec] text-[#3d0c02] hover:border-[#3d0c02]/40"
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold ${
                expandedCat === cat.name
                  ? "bg-white/20 text-white"
                  : "bg-[#3d0c02]/10 text-[#3d0c02]"
              }`}
            >
              {cat.total}
            </span>
          </button>
        ))}
      </div>

      {/* Expanded items for selected category */}
      {expandedCat && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="overflow-hidden rounded-xl border border-[#e6e2db] bg-[#f8f3ec]">
            <div className="border-b border-[#e6e2db] bg-[#f2ede6] px-4 py-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#54433f]">
                {expandedCat} — Items
              </span>
            </div>
            <div className="divide-y divide-[#e6e2db]">
              {salesBreakdown.items
                .filter((i) => i.category === expandedCat)
                .map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[14px] font-semibold text-[#0e0100]">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#e6e2db]">
                        <div
                          className="h-full rounded-full bg-[#E8A020] transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.qty /
                                (salesBreakdown.categories.find((c) => c.name === expandedCat)?.total ||
                                  1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="min-w-[28px] text-right text-[14px] font-extrabold text-[#3d0c02]">
                        {item.qty}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* All items table */}
      <div className="overflow-hidden rounded-xl border border-[#e6e2db]">
        <div className="grid grid-cols-[1fr_auto_auto] border-b border-[#e6e2db] bg-[#f2ede6] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#54433f]">
          <span>Item</span>
          <span className="pr-6 text-center">Category</span>
          <span className="text-right">Qty Sold</span>
        </div>
        <div className="max-h-64 overflow-y-auto divide-y divide-[#f2ede6]">
          {salesBreakdown.items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_auto_auto] items-center px-4 py-2.5 transition-colors hover:bg-[#f8f3ec]/80"
            >
              <span className="text-[13px] font-semibold text-[#0e0100]">{item.name}</span>
              <span className="pr-6 text-[11px] font-medium text-[#54433f]">{item.category}</span>
              <span className="min-w-[32px] text-right text-[14px] font-extrabold text-[#3d0c02]">
                {item.qty}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
