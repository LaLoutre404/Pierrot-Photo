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
  const orderedPhotos = featured
    ? [featured, ...photos.filter((photo) => photo.id !== featured.id)]
    : photos;
  const heroPhotoCount = typedSlug === "sport" ? 3 : 2;
  const heroPhotos = orderedPhotos.slice(0, heroPhotoCount);
  const galleryPhotos = orderedPhotos.slice(heroPhotoCount);

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
      <header className={`gallery-hero gallery-hero--${typedSlug}`}>
        <div className="gallery-hero__copy">
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
        <PhotoFrame
          photo={heroPhotos[0]}
          className="gallery-hero__image gallery-hero__image--lead"
          priority
          sizes="(max-width: 768px) 50vw, 50vw"
          label={`Image principale ${content.title} à importer`}
        />
        <PhotoFrame
          photo={heroPhotos[1]}
          className="gallery-hero__image gallery-hero__image--secondary"
          sizes="(max-width: 768px) 50vw, 32vw"
          label={`Deuxième image ${content.title} à importer`}
        />
        {typedSlug === "sport" ? (
          <PhotoFrame
            photo={heroPhotos[2]}
            className="gallery-hero__image gallery-hero__image--tertiary"
            sizes="(max-width: 768px) 100vw, 32vw"
            label="Troisième image Sport à importer"
          />
        ) : null}
      </header>
      {galleryPhotos.length ? (
        <section className="gallery-body" aria-label={`Photographies — ${content.title}`}>
          <PhotoGallery photos={galleryPhotos} />
        </section>
      ) : null}
    </article>
  );
}
