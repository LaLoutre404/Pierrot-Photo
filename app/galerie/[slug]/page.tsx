import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoFrame } from "@/components/photo-frame";
import { PhotoGallery } from "@/components/photo-gallery";
import { categoryContent, categorySlugs } from "@/content/site";
import { getGallery } from "@/lib/photos";
import type { CategorySlug } from "@/lib/types";

export const revalidate = 60;

export function generateStaticParams() {
  return categorySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!categorySlugs.includes(slug as CategorySlug)) return {};
  const category = categoryContent[slug as CategorySlug];
  return {
    title: `Galerie ${category.title}`,
    description: category.description,
    openGraph: {
      title: `${category.title} — Pierre Bousquet`,
      description: category.description,
    },
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!categorySlugs.includes(slug as CategorySlug)) notFound();
  const typedSlug = slug as CategorySlug;
  const content = categoryContent[typedSlug];
  const { photos } = await getGallery(typedSlug);
  const featured = photos.find((photo) => photo.is_featured) ?? photos[0];

  return (
    <article
      className="gallery-page"
      style={
        {
          "--category-color": content.themeColor,
          "--category-text": content.textColor,
        } as React.CSSProperties
      }
    >
      <header className="gallery-hero">
        <div className="gallery-hero__copy">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          {content.bullets ? (
            <ul>
              {content.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          <p>{content.description}</p>
          <span>{photos.length ? `${photos.length} photographies` : "Série en préparation"}</span>
        </div>
        <PhotoFrame
          photo={featured}
          className="gallery-hero__image"
          priority
          sizes="(max-width: 768px) 100vw, 58vw"
          label={`Image de couverture ${content.title} à importer`}
        />
      </header>
      <section className="gallery-body" aria-label={`Photographies — ${content.title}`}>
        <PhotoGallery photos={photos} />
      </section>
    </article>
  );
}
