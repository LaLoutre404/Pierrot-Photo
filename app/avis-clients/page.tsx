import type { Metadata } from "next";
import Link from "next/link";
import { testimonials } from "@/content/site";

export const metadata: Metadata = {
  title: "Avis clients",
  description: "Retours de clients ayant confié leurs images à Pierre Bousquet.",
};

export default function TestimonialsPage() {
  return (
    <section className="testimonials-page">
      <header>
        <p className="eyebrow">Collaborations</p>
        <h1>Avis clients</h1>
        <p>
          Cette page accueillera les témoignages authentiques des personnes et structures
          accompagnées. Aucun avis fictif n’est publié.
        </p>
      </header>
      {testimonials.length ? (
        <div className="testimonials-list">
          {testimonials.map((testimonial) => (
            <blockquote key={`${testimonial.author}-${testimonial.quote}`}>
              <p>« {testimonial.quote} »</p>
              <footer>
                {testimonial.author}
                {testimonial.context ? ` — ${testimonial.context}` : ""}
              </footer>
            </blockquote>
          ))}
        </div>
      ) : (
        <div className="testimonials-empty">
          <span>Les premiers témoignages seront ajoutés ici.</span>
          <Link className="text-link" href="/contact">
            Parler de votre projet →
          </Link>
        </div>
      )}
    </section>
  );
}
