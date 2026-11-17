import type { Metadata } from "next";
import { getSiteTexts } from "@/lib/get-site-texts";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Pierre Bousquet pour un shooting, un reportage de spectacle, de sport ou un projet photographique.",
};

export default async function ContactPage() {
  const t = await getSiteTexts();
  return (
    <section className="contact-page">
      <h1>{t["contact.title"]}</h1>
      <p className="contact-page__intro">{t["contact.intro"]}</p>
      <div className="contact-links">
        <a href={`tel:${t["contact.phoneHref"]}`} aria-label={`Téléphoner au ${t["contact.phoneDisplay"]}`}>
          <span aria-hidden="true">●</span>
          <strong>{t["contact.phoneDisplay"]}</strong>
        </a>
        <a
          href={t["contact.instagramUrl"]}
          target="_blank"
          rel="noreferrer"
          aria-label={`Voir le compte Instagram ${t["contact.instagramHandle"]}`}
        >
          <span aria-hidden="true">◎</span>
          <strong>@{t["contact.instagramHandle"]}</strong>
        </a>
        <a href={`mailto:${t["contact.email"]}`} aria-label={`Écrire à ${t["contact.email"]}`}>
          <span aria-hidden="true">@</span>
          <strong>{t["contact.email"]}</strong>
        </a>
      </div>
    </section>
  );
}
