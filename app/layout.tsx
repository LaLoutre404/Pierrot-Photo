import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/content/site";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteTexts } from "@/lib/get-site-texts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: "%s — Pierre Bousquet",
  },
  description: siteConfig.description,
  applicationName: "Portfolio Pierre Bousquet",
  authors: [{ name: "Pierre Bousquet" }],
  creator: "Pierre Bousquet",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Pierre Bousquet — Photographe",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#141415",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getSiteTexts();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Pierre Bousquet — Photographe",
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    email: t["contact.email"],
    telephone: t["contact.phoneHref"],
    sameAs: [t["contact.instagramUrl"]],
  };

  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <SiteHeader t={t} />
        <main id="contenu">{children}</main>
        <SiteFooter t={t} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
