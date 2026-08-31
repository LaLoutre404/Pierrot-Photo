import type { Metadata } from "next";
import Link from "next/link";
import { PhotoFrame } from "@/components/photo-frame";
import {
  about,
  categoryContent,
  categorySlugs,
  quote,
  skills,
} from "@/content/site";
import { getHomePhotos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Découvrez le portfolio photographique de Pierre Bousquet : portraits, spectacle vivant, sport et scènes urbaines.",
};

export const revalidate = 60;

export default async function HomePage() {
  const photos = await getHomePhotos();
  const pick = (index: number) => photos[index % Math.max(photos.length, 1)];

  return (
    <>
      <section className="home-hero" aria-labelledby="portfolio-title">
        <PhotoFrame
          photo={pick(0)}
          className="home-hero__image"
          priority
          sizes="100vw"
          label="Photographie principale du portfolio à importer"
        />
        <div className="home-hero__veil" />
        <div className="home-hero__content">
          <p>Pierre Bousquet</p>
          <h1 id="portfolio-title">Portfolio</h1>
          <span>Photographe</span>
        </div>
        <a className="home-hero__scroll" href="#a-propos">
          Découvrir ↓
        </a>
      </section>

      <section className="about-section" id="a-propos">
        <div className="section-number">01</div>
        <div className="about-section__image">
          <PhotoFrame
            photo={pick(1)}
            label="Portrait de Pierre Bousquet à importer"
            sizes="(max-width: 768px) 100vw, 42vw"
          />
        </div>
        <div className="about-section__copy">
          <p className="eyebrow">Le regard derrière l’objectif</p>
          <h2>{about.title}</h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="skills-section" aria-labelledby="skills-title">
        <div className="skills-section__heading">
          <p className="eyebrow">Savoir-faire</p>
          <h2 id="skills-title">Mes compétences</h2>
        </div>
        <ol className="skills-list">
          {skills.map((skill, index) => (
            <li key={skill}>
              <span>0{index + 1}</span>
              <p>{skill}</p>
            </li>
          ))}
        </ol>
        <div className="editorial-row" aria-label="Sélection photographique">
          {[2, 3, 4, 5].map((index) => (
            <PhotoFrame
              key={index}
              photo={pick(index)}
              label={`Photographie ${index - 1} à importer`}
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ))}
        </div>
      </section>

      <section className="quote-section">
        <PhotoFrame
          photo={pick(6)}
          className="quote-section__image"
          sizes="100vw"
          label="Photographie du bandeau citation à importer"
        />
        <div className="quote-section__veil" />
        <blockquote>
          <p>« {quote.text} »</p>
          <cite>— {quote.author}</cite>
        </blockquote>
      </section>

      <section className="univers-section" id="univers" aria-labelledby="univers-title">
        <header>
          <p className="eyebrow">Quatre écritures</p>
          <h2 id="univers-title">Univers photographiques</h2>
        </header>
        <div className="univers-grid">
          {categorySlugs.map((slug, index) => {
            const category = categoryContent[slug];
            return (
              <Link
                href={`/galerie/${slug}`}
                className="universe-card"
                key={slug}
                style={{ "--category-color": category.themeColor } as React.CSSProperties}
              >
                <PhotoFrame
                  photo={pick(7 + index)}
                  label={`Série ${category.title} à importer`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span className="universe-card__index">0{index + 1}</span>
                <div>
                  <p>{category.eyebrow}</p>
                  <h3>{category.title}</h3>
                  <span>Voir la galerie →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="contact-callout">
        <p>Un projet, une histoire, un instant à préserver.</p>
        <h2>Créons ensemble des images qui vous ressemblent.</h2>
        <Link className="text-link" href="/contact">
          Prendre contact <span>→</span>
        </Link>
      </section>
    </>
  );
}
