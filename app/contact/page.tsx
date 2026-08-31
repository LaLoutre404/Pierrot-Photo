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
      <p className="eyebrow">Votre projet commence ici</p>
      <h1>Contacts</h1>
      <p className="contact-page__intro">{contactIntro}</p>
      <div className="contact-links">
        <a href={`tel:${siteConfig.phoneHref}`}>
          <span>Téléphone</span>
          <strong>{siteConfig.phoneDisplay}</strong>
          <i>Appeler →</i>
        </a>
        <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
          <span>Instagram</span>
          <strong>@{siteConfig.instagramHandle}</strong>
          <i>Voir le profil →</i>
        </a>
        <a href={`mailto:${siteConfig.email}`}>
          <span>E-mail</span>
          <strong>{siteConfig.email}</strong>
          <i>Écrire →</i>
        </a>
      </div>
    </section>
  );
}
