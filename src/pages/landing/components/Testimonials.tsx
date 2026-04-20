import { Reveal } from "./Reveal";
import { useLandingT } from "../LandingContext";

export function Testimonials() {
  const { t } = useLandingT();
  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t.testimonials.label}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t.testimonials.h2}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {t.testimonials.items.map((item, i) => (
            <Reveal key={i} delay={i * 100}>
              <figure className="h-full rounded-2xl border border-border bg-card p-7 shadow-card flex flex-col">
                <div className="text-primary text-4xl font-display leading-none">"</div>
                <blockquote className="mt-2 text-[15px] leading-relaxed text-foreground/90 flex-1">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-border flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_30)] text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {item.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.role} · {item.city}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
