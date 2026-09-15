import type { Metadata } from "next";
import { contactIntro, siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Pierre Bousquet pour un shooting, un reportage de spectacle, de sport ou un projet photographique.",
};

export default function ContactPage() {
  return (
    <section className="contact-page">
      <h1>Contacts</h1>
      <p className="contact-page__intro">{contactIntro}</p>
      <div className="contact-links">
        <a href={`tel:${siteConfig.phoneHref}`} aria-label={`Téléphoner au ${siteConfig.phoneDisplay}`}>
          <span aria-hidden="true">●</span>
          <strong>{siteConfig.phoneDisplay}</strong>
        </a>
        <a
          href={siteConfig.instagramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Voir le compte Instagram ${siteConfig.instagramHandle}`}
        >
          <span aria-hidden="true">◎</span>
          <strong>@{siteConfig.instagramHandle}</strong>
        </a>
        <a href={`mailto:${siteConfig.email}`} aria-label={`Écrire à ${siteConfig.email}`}>
          <span aria-hidden="true">@</span>
          <strong>{siteConfig.email}</strong>
        </a>
      </div>
    </section>
  );
}
