import Link from "next/link";
import { getSiteTexts } from "@/lib/get-site-texts";

export default async function NotFound() {
  const t = await getSiteTexts();
  return (
    <section className="not-found-page">
      <span>404</span>
      <p className="eyebrow">{t["notfound.eyebrow"]}</p>
      <h1>{t["notfound.title"]}</h1>
      <Link className="text-link" href="/">
        {t["notfound.link"]}
      </Link>
    </section>
  );
}
