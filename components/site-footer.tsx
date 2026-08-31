import Link from "next/link";
import { siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="footer-kicker">Une image à construire ?</p>
          <Link className="footer-title" href="/contact">
            Parlons de votre projet
          </Link>
        </div>
        <div className="footer-contact">
          <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
            @{siteConfig.instagramHandle}
          </a>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Pierre Bousquet</span>
        <div>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/politique-confidentialite">Confidentialité</Link>
          <Link href="/admin" aria-label="Administration du portfolio">
            Administration
          </Link>
        </div>
      </div>
    </footer>
  );
}
