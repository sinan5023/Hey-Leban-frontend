import { useNavigate } from "react-router-dom";
import SettingsCard from "../components/settings/SettingsCard";

function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fef9f2] font-sans text-[#1d1c18]">
      <header className="fixed left-0 top-0 z-50 flex h-[80px] w-full items-center justify-between bg-[#3d0c02] px-6 text-white shadow-md">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/pos")}
            className="flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-white/10"
            aria-label="Back to POS"
          >
            <span className="text-[28px]">←</span>
          </button>

          <div className="flex flex-col">
            <h1 className="text-[24px] font-bold leading-tight text-white">
              Settings
            </h1>
            <p className="text-[14px] font-bold text-white/70">
              System tools and shop controls
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {/* <button
            type="button"
            className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2"
          >
            <span className="text-[18px]">🕘</span>
            <span className="text-[14px] font-bold">Activity</span>
          </button> */}

          {/* <div className="mx-2 h-10 w-px bg-white/20" /> */}

          {/* <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[14px] font-bold leading-none text-white">
                Admin User
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/60">
                Store Manager
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-[#feb234] bg-[#e6e2db] text-xs font-bold text-[#3d0c02]">
              AU
            </div>
          </div> */}
        </div>
      </header>

      <main className="min-h-screen px-6 pb-6 pt-[80px]">
        <div className="mx-auto max-w-6xl py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <SettingsCard
              title="Business Reports"
              description="View daily sales, net profits, payment split, and top selling items across all registers."
              icon="📊"
              tags={["Today's Sales", "Orders", "Cash/UPI"]}
              onClick={() => navigate("/sales-sessions?next=business-report")}
            />

            <SettingsCard
  title="Summary"
  description="Review order and sales summaries for full accountability."
  icon="🧾"
  tags={["Open", "Completed", "Due", "Cancelled"]}
  onClick={() => navigate("/sales-sessions?next=summary")}
/>

            <SettingsCard
              title="Add Items"
              description="Manage products, pricing, categories, and inventory availability in real-time."
              icon="🗃️"
              tags={["Sweets", "Namkeen", "Drinks"]}
              buttonLabel="Manage Menu"
              buttonType="button"
              onClick={() => navigate("/settings/items")}
            />

            <SettingsCard
              title="Stock Management"
              description="Monitor and update your artisanal inventory levels."
              icon="📦"
              tags={["In Stock", "Low Stock", "Out of Stock"]}
              buttonLabel="Add Stock"
              buttonType="button"
              onClick={() => navigate("/settings/inventory")}
            />
          </div>

          <div className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-[32px] font-bold text-[#3a0a01]">
                General Controls
              </h3>
              <div className="ml-8 h-[2px] flex-grow bg-[#d9c1bc]/30" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-6 rounded-2xl border border-[#d9c1bc]/20 bg-[#f8f3ec] p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <span className="text-[18px]">🖨️</span>
                </div>

                <div className="flex-grow">
                  <p className="text-[18px] font-bold text-[#1d1c18]">
                    Receipt Printer
                  </p>
                  <p className="text-[12px] text-[#54433f]/70">
                    Kitchen & Counter connected via IP
                  </p>
                </div>

                <div className="flex h-8 w-14 shrink-0 items-center rounded-full bg-[#feb234] px-1">
                  <div className="ml-auto h-6 w-6 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/change-password")}
                className="flex items-center gap-6 rounded-2xl border border-[#d9c1bc]/20 bg-[#f8f3ec] p-6 text-left transition hover:bg-[#f2ede6]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <span className="text-[18px]">🛡️</span>
                </div>

                <div className="flex-grow">
                  <p className="text-[18px] font-bold text-[#1d1c18]">
                    Change Password
                  </p>
                  <p className="text-[12px] text-[#54433f]/70">
                    Manage and update your system access password.
                  </p>
                </div>

                <span className="shrink-0 text-xl text-[#86736e]">›</span>
              </button>

              <div className="flex items-center gap-6 rounded-2xl border border-[#d9c1bc]/20 bg-[#f8f3ec] p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <span className="text-[18px]">☁️</span>
                </div>

                <div className="flex-grow">
                  <p className="text-[18px] font-bold text-[#1d1c18]">
                    Data Backup
                  </p>
                  <p className="text-[12px] text-[#54433f]/70">
                    Last backup: 2 hours ago
                  </p>
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-lg bg-[#3d0c02] px-4 py-2 text-[14px] font-bold text-white"
                >
                  Backup Now
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 text-[#54433f]/40 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">©</span>
              <span className="text-[12px]">Confectionery POS v4.2.0-stable</span>
            </div>

            <div className="flex gap-6 text-[12px]">
              <button type="button" className="underline decoration-dotted underline-offset-4">
                Terms of Service
              </button>
              <button type="button" className="underline decoration-dotted underline-offset-4">
                Privacy Policy
              </button>
              <button type="button" className="underline decoration-dotted underline-offset-4">
                Support Hub
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;