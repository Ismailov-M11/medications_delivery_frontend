import { Banknote, Wallet } from "lucide-react";
import { Reveal } from "./Reveal";

const modes = [
  {
    icon: Banknote,
    title: "Yetkazganda naqd",
    desc: "Mijoz faqat yetkazib berish narxini kuryerga naqd to'laydi.",
    tag: "Eng mashhur",
  },
  {
    icon: Wallet,
    title: "To'liq naqd",
    desc: "Mijoz mahsulot + yetkazib berish summasini kuryerga to'laydi.",
    tag: null,
  },
];

export function PaymentModes() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">To'lov</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Mijoz to'lovni{" "}
              <span className="text-primary">o'zi tanlaydi</span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-5">
          {modes.map((m, i) => (
            <Reveal key={m.title} delay={i * 100}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-8 shadow-card overflow-hidden">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5" />
                <div className="relative flex items-start gap-5">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <m.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-semibold">{m.title}</h3>
                      {m.tag && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {m.tag}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
