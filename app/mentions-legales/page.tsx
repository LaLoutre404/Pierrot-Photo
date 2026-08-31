import type { Metadata } from "next";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalPage() {
  return (
    <article className="legal-page">
      <p className="eyebrow">Informations légales</p>
      <h1>Mentions légales</h1>
      <h2>Éditeur du site</h2>
      <p>Pierre Bousquet — Photographe</p>
      <p>Adresse : {siteConfig.legal.address}</p>
      <p>SIRET : {siteConfig.legal.siret}</p>
      <p>Directeur de la publication : {siteConfig.legal.publicationDirector}</p>
      <h2>Hébergement</h2>
      <p>{siteConfig.legal.host}</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les photographies et les textes présents sur ce site sont protégés par le droit
        d’auteur. Toute reproduction, diffusion ou exploitation sans autorisation écrite
        préalable est interdite.
      </p>
      <h2>Contact</h2>
      <p>
        Pour toute question : <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
      </p>
    </article>
  );
}
