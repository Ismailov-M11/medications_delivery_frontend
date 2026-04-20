import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";

const APP_URL = "https://app.tezyubor.uz";

const features = [
  "Cheksiz buyurtmalar",
  "Barcha kuryer integratsiyalari",
  "Aqlli mijoz havolalari",
  "Real vaqtda narx va ETA",
  "Hisobotlar va analitika",
  "Email va Telegram qo'llab-quvvatlash",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Narxlar</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Oddiy narxlar
            </h2>
            <p className="mt-4 text-muted-foreground">
              Yashirin to'lovlarsiz. Bitta tarif — barcha imkoniyatlar.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-14 max-w-md mx-auto">
            <div className="relative rounded-3xl border border-border bg-card p-8 shadow-card">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                BASE
              </div>

              <div className="text-center pt-3">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold tracking-tight">100 000</span>
                  <span className="text-muted-foreground">so'm</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">oyiga, soliqlarsiz</p>
              </div>

              <ul className="mt-8 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button className="w-full mt-8 rounded-full h-12 text-base shadow-glow" asChild>
                <a href={`${APP_URL}/login`}>7 kun bepul boshlash</a>
              </Button>
              <p className="mt-3 text-xs text-center text-muted-foreground">Karta talab qilinmaydi</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
