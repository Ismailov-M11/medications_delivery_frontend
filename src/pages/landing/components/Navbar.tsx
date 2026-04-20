import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLandingT } from "../LandingContext";

const APP_URL = "https://app.tezyubor.uz";

export function Navbar() {
  const { lang, setLang, t } = useLandingT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#problem", label: t.nav.problem },
    { href: "#solution", label: t.nav.solution },
    { href: "#how", label: t.nav.how },
    { href: "#pricing", label: t.nav.pricing },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-background/80 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 text-sm">
            <button
              onClick={() => setLang("uz")}
              className={`px-2 py-1 rounded-md transition-colors ${
                lang === "uz"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              UZ
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => setLang("ru")}
              className={`px-2 py-1 rounded-md transition-colors ${
                lang === "ru"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              RU
            </button>
          </div>
          <Button variant="ghost" className="text-sm" asChild>
            <a href={`${APP_URL}/login`}>{t.nav.login}</a>
          </Button>
          <Button className="text-sm rounded-full px-5" asChild>
            <a href={`${APP_URL}/login`}>{t.nav.start}</a>
          </Button>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg hover:bg-muted"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="px-5 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-2 py-1">
              <button
                onClick={() => setLang("uz")}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  lang === "uz"
                    ? "border-primary text-primary font-medium"
                    : "border-border text-muted-foreground"
                }`}
              >
                UZ
              </button>
              <button
                onClick={() => setLang("ru")}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  lang === "ru"
                    ? "border-primary text-primary font-medium"
                    : "border-border text-muted-foreground"
                }`}
              >
                RU
              </button>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-full" asChild>
                <a href={`${APP_URL}/login`}>{t.nav.login}</a>
              </Button>
              <Button className="flex-1 rounded-full" asChild>
                <a href={`${APP_URL}/login`}>{t.nav.start}</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
