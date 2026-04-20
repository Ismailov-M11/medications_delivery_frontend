import { Layers, MapPin, Gauge } from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  {
    icon: Layers,
    title: "Bitta platforma — barcha kuryer xizmatlar",
    desc: "Noor, Millennium va boshqalarga bitta dashboarddan ulaning. Bir marta yarating — buyurtma siz tanlagan kuryerga zudlik bilan ketadi.",
    visual: (
      <div className="flex items-end gap-1.5 h-20">
        {["Noor", "Mlnm", "YGo", "+"].map((label, i) => (
          <div
            key={label}
            className={`flex-1 rounded-md flex items-end justify-center pb-1.5 text-[9px] font-medium ${
              i === 3
                ? "bg-muted text-muted-foreground border border-dashed border-border"
                : "bg-primary/15 text-primary"
            }`}
            style={{ height: `${60 + i * 8}%` }}
          >
            {label}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: MapPin,
    title: "Mijoz o'zi aniq manzilni kiritadi",
    desc: "Mijozga aqlli havola yuboring. U xaritada aniq nuqta, qavat, eshik kodi va vaqt oralig'ini tanlaydi.",
    visual: (
      <div className="relative h-20 rounded-lg bg-muted overflow-hidden border border-border">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-dot scale-[2.5]" />
            <MapPin className="relative h-6 w-6 text-primary fill-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Gauge,
    title: "Narx va ETA bir zumda",
    desc: "Tasdiqlashdan oldin har bir kuryerdan real vaqtdagi narx va yetib borish vaqtini ko'ring. Eng yaxshisini tanlang.",
    visual: (
      <div className="space-y-1.5">
        {[
          { name: "Noor", price: "22 000", eta: "22 daq", best: true },
          { name: "Millennium", price: "26 500", eta: "31 daq" },
          { name: "Yandex Go", price: "29 000", eta: "27 daq" },
        ].map((c) => (
          <div
            key={c.name}
            className={`flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-md border ${
              c.best
                ? "bg-primary/10 border-primary/30 text-foreground"
                : "bg-muted border-border text-muted-foreground"
            }`}
          >
            <span className="font-medium">{c.name}</span>
            <span className="flex gap-2.5">
              <span>{c.price}</span>
              <span className={c.best ? "text-primary font-medium" : ""}>{c.eta}</span>
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export function Solution() {
  return (
    <section id="solution" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Yechim
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Tezyubor bilan{" "}
              <span className="text-primary">1 bosishda</span> buyurtma
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="h-full rounded-2xl border border-border bg-card p-7 shadow-card flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold leading-snug">{f.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="mt-6 pt-5 border-t border-border">{f.visual}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
