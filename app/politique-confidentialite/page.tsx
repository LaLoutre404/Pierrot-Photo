import type { Metadata } from "next";
import { getSiteTexts } from "@/lib/get-site-texts";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default async function PrivacyPage() {
  const t = await getSiteTexts();
  return (
    <article className="legal-page">
      <p className="eyebrow">{t["privacy.eyebrow"]}</p>
      <h1>{t["privacy.title"]}</h1>
      <p>{t["privacy.public"]}</p>
      <h2>{t["privacy.adminTitle"]}</h2>
      <p>{t["privacy.admin"]}</p>
      <h2>{t["privacy.photosTitle"]}</h2>
      <p>{t["privacy.photos"]}</p>
      <h2>{t["privacy.rightsTitle"]}</h2>
      <p>
        {t["privacy.rights"]}
        <a href={`mailto:${t["contact.email"]}`}> {t["contact.email"]}</a>.
      </p>
      <p>{t["privacy.retention"]}</p>
    </article>
  );
}
