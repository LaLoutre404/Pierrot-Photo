import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found-page">
      <span>404</span>
      <p className="eyebrow">Hors champ</p>
      <h1>Cette page n’est pas dans la sélection.</h1>
      <Link className="text-link" href="/">
        Revenir au portfolio →
      </Link>
    </section>
  );
}
