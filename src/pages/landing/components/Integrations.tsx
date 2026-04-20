import { Reveal } from "./Reveal";
import { useLandingT } from "../LandingContext";

const couriers = [
  { name: "Noor", color: "from-blue-500/20 to-blue-500/5", dot: "bg-blue-500" },
  { name: "Millennium", color: "from-purple-500/20 to-purple-500/5", dot: "bg-purple-500" },
  { name: "Yandex Go", color: "from-yellow-500/20 to-yellow-500/5", dot: "bg-yellow-500" },
];

export function Integrations() {
  const { t } = useLandingT();
  return (
    <section className="py-20 bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.integrations.h2}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.integrations.p}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {couriers.map((c) => (
              <div
                key={c.name}
                className={`inline-flex items-center gap-2.5 rounded-full border border-border bg-gradient-to-br ${c.color} px-5 py-2.5 backdrop-blur`}
              >
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className="font-semibold text-sm">{c.name}</span>
              </div>
            ))}
            <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-5 py-2.5 text-sm text-muted-foreground">
              {t.integrations.soon}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
