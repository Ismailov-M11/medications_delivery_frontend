import { Logo } from "./Logo";
import { Send, Instagram, Mail } from "lucide-react";
import { useLandingT } from "../LandingContext";

export function Footer() {
  const { t } = useLandingT();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-14">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">{t.footer.tagline}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">{t.footer.product}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#pricing" className="hover:text-foreground">{t.footer.links.pricing}</a>
              </li>
              <li>
                <a href="#how" className="hover:text-foreground">{t.footer.links.how}</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">{t.footer.links.contactLink}</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">{t.footer.contact}</h4>
            <a
              href="mailto:hello@tezyubor.uz"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              hello@tezyubor.uz
            </a>
            <div className="mt-4 flex gap-2">
              <a
                href="#"
                aria-label="Telegram"
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Tezyubor. {t.footer.copyright}</span>
          <span>{t.footer.location}</span>
        </div>
      </div>
    </footer>
  );
}
