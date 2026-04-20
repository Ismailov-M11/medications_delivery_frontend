import { LayoutGrid, MapPinOff, FileWarning } from "lucide-react";
import { Reveal } from "./Reveal";
import { useLandingT } from "../LandingContext";

const ICONS = [LayoutGrid, MapPinOff, FileWarning];

export function Problem() {
  const { t } = useLandingT();
  return (
    <section id="problem" className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t.problem.label}
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t.problem.h2a}{" "}
              <span className="text-primary">{t.problem.h2b}</span>{" "}
              {t.problem.h2c}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {t.problem.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={i} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-border bg-card p-7 shadow-card hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
