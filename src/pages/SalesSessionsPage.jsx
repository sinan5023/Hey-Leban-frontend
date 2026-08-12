import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSalesSessionsQuery from "../hooks/reports/useSalesSessionsQuery";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};


export default function SalesSessionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const nextRoute = queryParams.get("next") || "summary"; // 'summary' or 'business-report'

  const [page, setPage] = useState(1);
  const [specificDate, setSpecificDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }, []);

  const { data: sessionsData, isLoading, isError } = useSalesSessionsQuery(page, 20);

  const handleSpecificDateSearch = () => {
    if (!specificDate) return;
    navigate(`/${nextRoute}?startDate=${specificDate}&endDate=${specificDate}`);
  };

  const handleDateRangeSearch = () => {
    if (!startDate || !endDate) return;
    navigate(`/${nextRoute}?startDate=${startDate}&endDate=${endDate}`);
  };

  const handleSessionSelect = (sessionId) => {
    navigate(`/${nextRoute}?sessionId=${sessionId}`);
  };

  const sessions = sessionsData?.sessions || [];
  const pagination = sessionsData?.pagination || { totalCount: 0, page: 1, limit: 20, totalPages: 1 };
  
  const startItem = (page - 1) * pagination.limit + 1;
  const endItem = Math.min(page * pagination.limit, pagination.totalCount);

  return (
    <div className="bg-[#fef9f2] text-[#1d1c18] min-h-screen font-sans">
      <header className="bg-[#3d0c02]  top-0 sticky z-50 shadow-sm shadow-[#0e0100]/10 flex justify-between items-center text-white px-6 py-4 w-full">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5"
            aria-label="Back to Settings"
          >
            <span className="text-[24px]">←</span>
          </button>
        </div>
        {/* <div className="flex items-center gap-2">
           <button className="ml-2 flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-[#d9c1bc] hover:bg-[#e6e2db]/50 transition-colors">
            <span className="text-sm font-bold text-[#0e0100]">Admin</span>
            <div className="w-8 h-8 rounded-full bg-[#feb234] flex items-center justify-center">
              <span className="text-[#6d4700] text-sm">👤</span>
            </div>
          </button>
        </div> */}
      </header>
      
      <div className="flex">
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#3d0c02]">Sales Sessions</h1>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffdbd2] text-[#3a0a01]">
                {pagination.totalCount} Total Sessions
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-[#815500] text-white px-5 py-2.5 rounded-lg font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="text-sm">⬇</span> Export PDF
            </button>
          </div>

          <section className="bg-white rounded-xl p-6 shadow-sm border border-[#d9c1bc]/30 mb-8">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-bold text-[#54433f] mb-1 ml-1">Specific Date</label>
                  <div className="flex gap-2">
                    <input 
                      className="bg-[#f8f3ec] border-[#d9c1bc] rounded-lg focus:ring-[#815500] focus:border-[#815500] text-[#1d1c18] px-4 py-2 w-full md:w-64" 
                      type="date"
                      value={specificDate}
                      max={maxDate}
                      onChange={(e) => setSpecificDate(e.target.value)}
                    />
                    <button 
                      onClick={handleSpecificDateSearch}
                      className="bg-[#3d0c02] text-[#bf715c] px-6 py-2 rounded-lg font-bold hover:bg-[#0e0100] transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#d9c1bc]/30"></div>

              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="w-full">
                    <label className="block text-sm font-bold text-[#54433f] mb-1 ml-1">Start Date</label>
                    <input 
                      className="bg-[#f8f3ec] border-[#d9c1bc] rounded-lg focus:ring-[#815500] focus:border-[#815500] text-[#1d1c18] px-4 py-2 w-full" 
                      type="date" 
                      value={startDate}
                      max={maxDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-bold text-[#54433f] mb-1 ml-1">End Date</label>
                    <input 
                      className="bg-[#f8f3ec] border-[#d9c1bc] rounded-lg focus:ring-[#815500] focus:border-[#815500] text-[#1d1c18] px-4 py-2 w-full" 
                      type="date" 
                      value={endDate}
                      max={maxDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleDateRangeSearch}
                  className="w-full md:w-auto border border-[#3d0c02] text-[#3d0c02] px-8 py-2 rounded-lg font-bold hover:bg-[#f2ede6] transition-colors"
                >
                  Apply Range
                </button>
              </div>
            </div>
          </section>

          <div className="overflow-hidden rounded-xl border border-[#d9c1bc]/50 bg-white shadow-sm">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#ece7e1]">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-[#54433f] border-b border-[#d9c1bc]">Session ID</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#54433f] border-b border-[#d9c1bc]">Business Date</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#54433f] border-b border-[#d9c1bc]">Opened At</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#54433f] border-b border-[#d9c1bc]">Closed At</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#54433f] border-b border-[#d9c1bc]">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#54433f] border-b border-[#d9c1bc] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d9c1bc]/30">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-red-500">Failed to load sessions.</td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">No closed sessions found.</td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr 
                        key={session.id} 
                        onClick={() => handleSessionSelect(session.id)}
                        className="hover:bg-[#f2ede6]/60 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-mono text-sm text-[#0e0100] font-semibold">{session.id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-sm font-medium">{formatDate(session.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold">{formatDate(session.openedAt)}</div>
                          <div className="text-xs text-[#54433f] opacity-70">{formatTime(session.openedAt)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold">{formatDate(session.closedAt)}</div>
                          <div className="text-xs text-[#54433f] opacity-70">{formatTime(session.closedAt)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#e6e2db] text-[#54433f] border border-[#d9c1bc]/50">
                            {session.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-[#f2ede6] rounded-full text-[#0e0100]">
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-[#d9c1bc]/30">
               {isLoading ? (
                  <div className="p-4 text-center">Loading...</div>
                ) : isError ? (
                  <div className="p-4 text-center text-red-500">Failed to load sessions.</div>
                ) : sessions.length === 0 ? (
                  <div className="p-4 text-center">No closed sessions found.</div>
                ) : (
                  sessions.map((session) => (
                  <div key={session.id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-sm font-bold text-[#0e0100]">{session.id.slice(-6).toUpperCase()}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#e6e2db] text-[#54433f] border border-[#d9c1bc]/50">
                        {session.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-[#54433f] uppercase tracking-tighter opacity-60">Opened</p>
                        <p className="text-sm font-semibold">{formatDate(session.openedAt)}</p>
                        <p className="text-xs opacity-70">{formatTime(session.openedAt)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#54433f] uppercase tracking-tighter opacity-60">Closed</p>
                        <p className="text-sm font-semibold">{formatDate(session.closedAt)}</p>
                        <p className="text-xs opacity-70">{formatTime(session.closedAt)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSessionSelect(session.id)}
                      className="w-full mt-2 py-2 bg-[#f2ede6] text-[#3d0c02] font-bold text-sm rounded-lg flex items-center justify-center gap-2"
                    >
                      👁️ View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#54433f]">
              Showing <span className="font-bold text-[#1d1c18]">{pagination.totalCount > 0 ? startItem : 0}-{endItem}</span> of <span className="font-bold text-[#1d1c18]">{pagination.totalCount}</span>
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg text-[#86736e] border border-[#d9c1bc]/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f2ede6] transition-colors"
              >
                ←
              </button>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#815500] text-white font-bold">{page}</div>
              <button 
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages || pagination.totalCount === 0}
                className="p-2 rounded-lg text-[#0e0100] border border-[#d9c1bc] hover:bg-[#f2ede6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 right-0 w-1/3 h-1/3 opacity-[0.03] pointer-events-none -z-10">
        <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(#3d0c02 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
      </div>
    </div>
  );
}
