import type { Metadata } from "next";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <article className="legal-page">
      <p className="eyebrow">Protection des données</p>
      <h1>Politique de confidentialité</h1>
      <p>
        Ce site public n’installe aucun outil publicitaire et ne dépose aucun cookie de
        suivi par défaut. Il ne comporte pas de formulaire collectant des données.
      </p>
      <h2>Administration</h2>
      <p>
        L’accès à l’administration utilise un cookie de session strictement nécessaire à
        l’authentification. Les comptes sont créés manuellement et aucune inscription
        publique n’est proposée.
      </p>
      <h2>Hébergement des photographies</h2>
      <p>
        Les photographies et leurs métadonnées sont stockées dans le projet Supabase du
        photographe. Seules les images marquées comme publiées sont accessibles au public.
      </p>
      <h2>Vos droits</h2>
      <p>
        Pour exercer un droit d’accès, de rectification ou de suppression, contactez
        <a href={`mailto:${siteConfig.email}`}> {siteConfig.email}</a>.
      </p>
      <p>Responsable de traitement et durée de conservation : À COMPLÉTER PAR LE CLIENT.</p>
    </article>
  );
}
