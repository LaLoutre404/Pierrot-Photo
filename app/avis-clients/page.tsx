import type { Metadata } from "next";
import { siteConfig } from "@/content/site";
import { getSiteTexts } from "@/lib/get-site-texts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Avis clients",
  description: "Partagez votre expérience avec Studio Pierro et laissez un avis Google sur le travail de Pierre Bousquet.",
};

export default async function TestimonialsPage() {
  const t = await getSiteTexts();

  return (
    <div className="testimonials-page">
      <section className="reviews-invite" aria-labelledby="reviews-invite-title">
        <div className="reviews-invite__copy">
          <p className="eyebrow">{t["reviews.ctaEyebrow"]}</p>
          <h1 id="reviews-invite-title">{t["reviews.ctaTitle"]}</h1>
          <p className="reviews-invite__body">{t["reviews.ctaBody"]}</p>
          <a className="reviews-invite__button" href={siteConfig.googleWriteReviewUrl} target="_blank" rel="noopener noreferrer">
            <span>{t["reviews.leave"]}</span>
            <span aria-hidden="true">↗</span>
          </a>
          <p className="reviews-invite__note">{t["reviews.googleNote"]}</p>
        </div>
        <div className="reviews-invite__art" aria-hidden="true">
          <span className="reviews-invite__art-top">{t["reviews.artTop"]}</span>
          <span className="reviews-invite__art-quote">“</span>
          <span className="reviews-invite__art-stars">★★★★★</span>
          <span className="reviews-invite__art-bottom">{t["reviews.artBottom"]}</span>
        </div>
      </section>
    </div>
  );
}
