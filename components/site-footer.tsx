import Link from "next/link";
import type { SiteTexts } from "@/lib/site-texts";

export function SiteFooter({ t }: { t: SiteTexts }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="footer-kicker">{t["footer.kicker"]}</p>
          <Link className="footer-title" href="/contact">
            {t["footer.title"]}
          </Link>
        </div>
        <div className="footer-contact">
          <a href={`tel:${t["contact.phoneHref"]}`}>{t["contact.phoneDisplay"]}</a>
          <a href={`mailto:${t["contact.email"]}`}>{t["contact.email"]}</a>
          <a href={t["contact.instagramUrl"]} target="_blank" rel="noreferrer">
            @{t["contact.instagramHandle"]}
          </a>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} {t["footer.copyright"]}</span>
        <div>
          <Link href="/mentions-legales">{t["footer.legal"]}</Link>
          <Link href="/politique-confidentialite">{t["footer.privacy"]}</Link>
          <Link href="/admin" aria-label="Administration du portfolio">
            {t["footer.admin"]}
          </Link>
        </div>
      </div>
    </footer>
  );
}
