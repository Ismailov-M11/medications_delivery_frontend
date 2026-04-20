import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  BarChart3,
  Zap,
  Search,
  Bell,
  Plus,
  MapPin,
} from "lucide-react";

type Order = {
  id: string;
  customer: string;
  address: string;
  courier: "Noor" | "Millennium" | "Yandex Go";
  price: string;
  eta: string;
  status: "Yo'lda" | "Tayyor" | "Yetkazildi";
};

const orders: Order[] = [
  {
    id: "TZ-2841",
    customer: "Aziza K.",
    address: "Yunusobod, 19-kvartal",
    courier: "Noor",
    price: "24 000",
    eta: "28 daq",
    status: "Yo'lda",
  },
  {
    id: "TZ-2840",
    customer: "Bekzod M.",
    address: "Chilonzor, Bunyodkor 12",
    courier: "Millennium",
    price: "31 500",
    eta: "42 daq",
    status: "Tayyor",
  },
  {
    id: "TZ-2839",
    customer: "Dilnoza R.",
    address: "Mirzo Ulug'bek, Mustaqillik 7",
    courier: "Yandex Go",
    price: "19 000",
    eta: "—",
    status: "Yetkazildi",
  },
];

const statusStyles: Record<Order["status"], string> = {
  "Yo'lda": "bg-primary/15 text-primary border border-primary/25",
  Tayyor: "bg-warning/20 text-[oklch(0.45_0.12_70)] border border-warning/30",
  Yetkazildi: "bg-success/15 text-[oklch(0.45_0.12_155)] border border-success/30",
};

const courierStyles: Record<Order["courier"], string> = {
  Noor: "bg-blue-500/15 text-blue-300 border-blue-400/20",
  Millennium: "bg-purple-500/15 text-purple-300 border-purple-400/20",
  "Yandex Go": "bg-yellow-500/15 text-yellow-300 border-yellow-400/20",
};

export function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-radial-fade pointer-events-none" />

      <div className="relative rounded-2xl overflow-hidden border border-border shadow-glow bg-[#1a1a18]">
        <div className="flex items-center gap-2 px-4 h-9 border-b border-white/5 bg-[#141412]">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-0.5 text-[10px] text-white/40 bg-white/5 rounded-md">
              app.tezyubor.uz / orders
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[180px_1fr] min-h-[460px]">
          <aside className="bg-[#141412] border-r border-white/5 p-3 flex flex-col gap-1">
            <div className="flex items-center gap-2 px-2 py-3 mb-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground fill-primary-foreground" strokeWidth={0} />
              </div>
              <span className="text-white/90 font-display font-bold text-sm">
                tez<span className="text-primary">yubor</span>
              </span>
            </div>

            {[
              { icon: LayoutDashboard, label: "Boshqaruv" },
              { icon: Package, label: "Buyurtmalar", active: true },
              { icon: Users, label: "Mijozlar" },
              { icon: BarChart3, label: "Hisobot" },
              { icon: Settings, label: "Sozlamalar" },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-default ${
                  item.active
                    ? "bg-primary/15 text-primary"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </div>
            ))}

            <div className="mt-auto p-3 rounded-xl bg-white/[0.04] border border-white/5">
              <div className="text-[10px] text-white/40 mb-1">Bu oy</div>
              <div className="text-white text-lg font-semibold">
                284{" "}
                <span className="text-[10px] text-white/40 font-normal">buyurtma</span>
              </div>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-primary rounded-full" />
              </div>
            </div>
          </aside>

          <div className="bg-[#1a1a18]">
            <div className="flex items-center justify-between px-5 h-12 border-b border-white/5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-xs w-64">
                <Search className="h-3.5 w-3.5" />
                <span>Buyurtma yoki mijoz qidirish...</span>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-white/40" />
                <button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg">
                  <Plus className="h-3.5 w-3.5" />
                  Yangi
                </button>
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-[oklch(0.6_0.2_30)]" />
              </div>
            </div>

            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-white text-sm font-semibold">Bugungi buyurtmalar</h3>
                <p className="text-white/40 text-[11px] mt-0.5">3 faol · 1 yetkazildi</p>
              </div>
              <div className="flex gap-1">
                {["Hammasi", "Yo'lda", "Tayyor"].map((t, i) => (
                  <div
                    key={t}
                    className={`px-2.5 py-1 rounded-md text-[10px] ${
                      i === 0 ? "bg-white/10 text-white" : "text-white/40"
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <div className="grid grid-cols-[80px_1fr_110px_90px_90px] px-4 py-2.5 bg-white/[0.03] text-[10px] uppercase tracking-wider text-white/40">
                  <span>ID</span>
                  <span>Mijoz / Manzil</span>
                  <span>Kuryer</span>
                  <span>Narx</span>
                  <span>Status</span>
                </div>
                {orders.map((o, i) => (
                  <div
                    key={o.id}
                    className={`grid grid-cols-[80px_1fr_110px_90px_90px] items-center px-4 py-3 text-xs ${
                      i !== orders.length - 1 ? "border-b border-white/5" : ""
                    }`}
                  >
                    <span className="text-white/60 font-mono text-[11px]">{o.id}</span>
                    <div>
                      <div className="text-white">{o.customer}</div>
                      <div className="flex items-center gap-1 text-white/40 text-[10px] mt-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {o.address}
                      </div>
                    </div>
                    <span className={`inline-flex w-fit px-2 py-0.5 rounded-md text-[10px] border ${courierStyles[o.courier]}`}>
                      {o.courier}
                    </span>
                    <span className="text-white/80 text-[11px]">
                      {o.price}
                      <span className="text-white/40"> so'm</span>
                    </span>
                    <span className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md text-[10px] ${statusStyles[o.status]}`}>
                      {o.status === "Yo'lda" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                      )}
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex absolute -left-6 bottom-12 bg-card border border-border rounded-2xl p-4 shadow-card animate-float w-56">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">Eng tez taklif</div>
            <div className="text-sm font-semibold mt-0.5">Noor · 22 daq</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">22 000 so'm</div>
          </div>
        </div>
      </div>

      <div
        className="hidden sm:flex absolute -right-4 top-20 bg-card border border-border rounded-2xl p-4 shadow-card animate-float w-60"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="w-full">
          <div className="text-[11px] text-muted-foreground">Aqlli havola yuborildi</div>
          <div className="font-mono text-[11px] mt-1 text-foreground bg-muted px-2 py-1 rounded">
            tezyubor.uz/d/k4n9
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            Mijoz manzil tanlamoqda
          </div>
        </div>
      </div>
    </div>
  );
}
