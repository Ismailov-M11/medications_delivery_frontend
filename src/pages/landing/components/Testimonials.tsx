import { Reveal } from "./Reveal";

const testimonials = [
  {
    quote:
      "Avval xar xil yetkazib berish ilovalariga alohida kirib, vaqtimning yarmini yo'qotardim. Tezyubor bilan ikkala xizmatga bir zumda buyurtma beraman.",
    name: "Nodira X.",
    role: "Dorixona egasi",
    city: "Toshkent",
    initials: "NX",
  },
  {
    quote:
      "Mijozlarga link yuboraman — ular xaritada aniq joyni belgilashadi. Adashish, qo'ng'iroqlar tugadi. Kuniga 30+ buyurtma — muammosiz.",
    name: "Sardor T.",
    role: "Onlayn do'kon egasi",
    city: "Samarqand",
    initials: "ST",
  },
  {
    quote:
      "Eng arzon va eng tez kuryerni bir nigohda ko'rish — bu menga oyiga 2 mln so'mga arziydi. Tezyubor bizning ish jarayonimizni butunlay o'zgartirdi.",
    name: "Madina A.",
    role: "Restoran direktori",
    city: "Toshkent",
    initials: "MA",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Mijozlar</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Ishonchli kompaniyalar tanlovi
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="h-full rounded-2xl border border-border bg-card p-7 shadow-card flex flex-col">
                <div className="text-primary text-4xl font-display leading-none">"</div>
                <blockquote className="mt-2 text-[15px] leading-relaxed text-foreground/90 flex-1">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-border flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_30)] text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role} · {t.city}
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
