import { FileText, Send, MapPin, Truck } from "lucide-react";
import { Reveal } from "./Reveal";
import { useLandingT } from "../LandingContext";

const ICONS = [FileText, Send, MapPin, Truck];

export function HowItWorks() {
  const { t } = useLandingT();
  return (
    <section id="how" className="py-24 lg:py-32 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.05]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t.how.label}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t.how.h2}
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 relative">
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {t.how.steps.map((step, i) => {
              const Icon = ICONS[i];
              return (
                <Reveal key={i} delay={i * 120}>
                  <div className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="relative h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-glow">
                      <Icon className="h-6 w-6" />
                      <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-secondary border border-primary/40 text-[11px] font-mono text-primary flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-secondary-foreground/60 leading-relaxed max-w-[220px]">
                      {step.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
