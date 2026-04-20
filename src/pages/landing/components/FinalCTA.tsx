import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

const APP_URL = "https://app.tezyubor.uz";

export function FinalCTA() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="absolute inset-0 opacity-[0.08]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              />
            </div>
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl mx-auto leading-[1.1]">
                Bugun boshlang — 7 kun bepul
              </h2>
              <p className="mt-5 text-base sm:text-lg text-primary-foreground/85 max-w-xl mx-auto">
                Karta kerak emas. 5 daqiqada sozlang va birinchi buyurtmangizni bugun yarating.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  asChild
                  className="rounded-full h-12 px-7 text-base bg-white text-secondary hover:bg-white/95"
                >
                  <a href={`${APP_URL}/login`}>
                    Ro'yxatdan o'tish
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-7 text-base bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-white/10 hover:text-primary-foreground"
                >
                  Biz bilan bog'laning
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
