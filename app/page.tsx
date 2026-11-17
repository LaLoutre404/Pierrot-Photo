import type { Metadata } from "next";
import Link from "next/link";
import { PhotoFrame } from "@/components/photo-frame";
import { HomeHeroMotion } from "@/components/home-hero-motion";
import {
  categoryContent,
  categorySlugs,
} from "@/content/site";
import { getSiteTexts } from "@/lib/get-site-texts";
import { HOME_UNIVERSE_SLOTS } from "@/lib/home-slots";
import { getHomePhotos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Découvrez le portfolio photographique de Pierre Bousquet : portraits, spectacle vivant et sport.",
};

export const revalidate = 60;

export default async function HomePage() {
  const [photos, t] = await Promise.all([getHomePhotos(), getSiteTexts()]);

  return (
    <>
      <noscript>
        <style>{`body:has(.home-hero) .wordmark{visibility:visible!important;transform:none!important} .home-hero .home-hero__content{visibility:visible!important;opacity:1!important}`}</style>
      </noscript>
      <section className="home-hero" aria-labelledby="portfolio-title">
        <HomeHeroMotion />
        <PhotoFrame
          photo={photos.hero}
          className="home-hero__image"
          priority
          sizes="100vw"
          label="Photographie principale du portfolio à importer"
        />
        <div className="home-hero__veil" />
        <div className="home-hero__content">
          <p>{t["home.hero.name"]}</p>
          <h1 id="portfolio-title">{t["home.hero.title"]}</h1>
          <span>{t["brand.role"]}</span>
        </div>
        <a className="home-hero__scroll" href="#a-propos">
          {t["home.hero.scroll"]}
        </a>
      </section>

      <section className="about-section" id="a-propos">
        <div className="section-number">01</div>
        <div className="about-section__image">
          <PhotoFrame
            photo={photos.about}
            label="Portrait de Pierre Bousquet à importer"
            sizes="(max-width: 768px) 100vw, 42vw"
          />
        </div>
        <div className="about-section__copy">
          <p className="eyebrow">{t["home.about.eyebrow"]}</p>
          <h2>{t["home.about.title"]}</h2>
          <p>{t["home.about.paragraph1"]}</p>
          <p>{t["home.about.paragraph2"]}</p>
        </div>
      </section>

      <section className="skills-section" aria-labelledby="skills-title">
        <div className="skills-section__heading">
          <p className="eyebrow">{t["home.skills.eyebrow"]}</p>
          <h2 id="skills-title">{t["home.skills.title"]}</h2>
        </div>
        <ol className="skills-list">
          {([1, 2, 3, 4] as const).map((number, index) => (
            <li key={number}>
              <span>0{index + 1}</span>
              <p>{t[`home.skills.item${number}`]}</p>
            </li>
          ))}
        </ol>
        <div className="editorial-row" aria-label="Sélection photographique">
          {(["skills-1", "skills-2", "skills-3", "skills-4"] as const).map((slot, index) => (
            <PhotoFrame
              key={slot}
              photo={photos[slot]}
              label={`Photographie de compétences ${index + 1} à choisir dans l’administration`}
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ))}
        </div>
      </section>

      <section className="quote-section">
        <PhotoFrame
          photo={photos.quote}
          className="quote-section__image"
          sizes="100vw"
          label="Photographie du bandeau citation à importer"
        />
        <div className="quote-section__veil" />
        <blockquote>
          <p>« {t["home.quote.text"]} »</p>
          <cite>— {t["home.quote.author"]}</cite>
        </blockquote>
      </section>

      <section className="univers-section" id="univers" aria-labelledby="univers-title">
        <header>
          <p className="eyebrow">{t["home.univers.eyebrow"]}</p>
          <h2 id="univers-title">{t["home.univers.title"]}</h2>
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
                  photo={photos[HOME_UNIVERSE_SLOTS[slug]]}
                  label={`Série ${t[`gallery.${slug}.title`]} à importer`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span className="universe-card__index">0{index + 1}</span>
                <div>
                  <p>{t[`gallery.${slug}.eyebrow`]}</p>
                  <h3>{t[`gallery.${slug}.title`]}</h3>
                  <span>{t["home.univers.link"]}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="contact-callout">
        <p>{t["home.contact.kicker"]}</p>
        <h2>{t["home.contact.title"]}</h2>
        <Link className="text-link" href="/contact">
          {t["home.contact.link"]} <span>→</span>
        </Link>
      </section>
    </>
  );
}
