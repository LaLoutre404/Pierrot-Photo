import type { Metadata } from "next";
import { getSiteTexts } from "@/lib/get-site-texts";

export const metadata: Metadata = { title: "Mentions légales" };

export default async function LegalPage() {
  const t = await getSiteTexts();
  return (
    <article className="legal-page">
      <p className="eyebrow">{t["legal.eyebrow"]}</p>
      <h1>{t["legal.title"]}</h1>
      <h2>{t["legal.publisherTitle"]}</h2>
      <p>{t["legal.publisher"]}</p>
      <p>Adresse : {t["legal.address"]}</p>
      <p>SIRET : {t["legal.siret"]}</p>
      <p>Directeur de la publication : {t["legal.publicationDirector"]}</p>
      <h2>{t["legal.hostTitle"]}</h2>
      <p>{t["legal.host"]}</p>
      <h2>{t["legal.copyrightTitle"]}</h2>
      <p>{t["legal.copyright"]}</p>
      <h2>{t["legal.contactTitle"]}</h2>
      <p>
        {t["legal.contactIntro"]} <a href={`mailto:${t["contact.email"]}`}>{t["contact.email"]}</a>.
      </p>
    </article>
  );
}
