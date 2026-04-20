import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { DashboardMockup } from "./DashboardMockup";
import { useLandingT } from "../LandingContext";

const APP_URL = "https://app.tezyubor.uz";

export function Hero() {
  const { t } = useLandingT();
  return (
    <section id="top" className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="absolute inset-0 bg-radial-fade" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              {t.hero.badge}
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-gradient-brand">
              {t.hero.h1a}{" "}
              <span className="text-primary">{t.hero.h1b}</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t.hero.p}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="rounded-full text-base h-12 px-6 shadow-glow" asChild>
                <a href={`${APP_URL}/login`}>
                  {t.hero.btn1}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base h-12 px-6">
                {t.hero.btn2}
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {[t.hero.f1, t.hero.f2, t.hero.f3].map((text) => (
                <li key={text} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
