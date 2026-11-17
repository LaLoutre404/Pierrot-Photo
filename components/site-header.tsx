"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categorySlugs } from "@/content/site";
import type { SiteTexts } from "@/lib/site-texts";

export function SiteHeader({ t }: { t: SiteTexts }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <nav className="desktop-nav desktop-nav--left" aria-label="Navigation principale">
          <Link href="/#univers">{t["nav.projects"]}</Link>
          <div className="gallery-menu">
            <Link href="/galerie/shooting">{t["nav.gallery"]}</Link>
            <div className="gallery-menu__panel">
              {categorySlugs.map((slug) => (
                <Link key={slug} href={`/galerie/${slug}`}>
                  {t[`gallery.${slug}.title`]}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <Link className="wordmark" href="/" aria-label={`Accueil — ${t["brand.name"]}`}>
          <span>{t["brand.name"]}</span>
          <small>{t["brand.role"]}</small>
        </Link>

        <nav className="desktop-nav desktop-nav--right" aria-label="Navigation secondaire">
          <Link href="/avis-clients">{t["nav.reviews"]}</Link>
          <Link href="/contact">{t["nav.contact"]}</Link>
        </nav>

        <button
          className={`menu-toggle${open ? " is-open" : ""}`}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <nav
        id="mobile-menu"
        className={`mobile-menu${open ? " is-open" : ""}`}
        aria-label="Navigation mobile"
        aria-hidden={!open}
      >
        <Link href="/#univers" onClick={() => setOpen(false)}>{t["nav.projects"]}</Link>
        <span className="mobile-menu__label">{t["nav.gallery"]}</span>
        <div className="mobile-menu__categories">
          {categorySlugs.map((slug) => (
            <Link key={slug} href={`/galerie/${slug}`} onClick={() => setOpen(false)}>
              {t[`gallery.${slug}.title`]}
            </Link>
          ))}
        </div>
        <Link href="/avis-clients" onClick={() => setOpen(false)}>{t["nav.reviews"]}</Link>
        <Link href="/contact" onClick={() => setOpen(false)}>{t["nav.contact"]}</Link>
      </nav>
    </header>
  );
}
