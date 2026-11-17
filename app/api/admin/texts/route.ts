import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { defaultSiteTexts, siteTextFields, type SiteTextKey } from "@/lib/site-texts";
import { requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
  const { data, error } = await supabase.from("site_texts").select("key, value");
  if (error) return NextResponse.json({ error: "Appliquez la migration des textes à Supabase." }, { status: 503 });
  const values = { ...defaultSiteTexts };
  for (const row of data ?? []) {
    if (Object.hasOwn(values, row.key)) values[row.key as SiteTextKey] = row.value;
  }
  return NextResponse.json({ values });
}

export async function PATCH(request: Request) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (!payload || typeof payload !== "object" || !("key" in payload) || !("value" in payload)) {
    return NextResponse.json({ error: "Texte invalide." }, { status: 400 });
  }
  const { key, value } = payload as { key: unknown; value: unknown };
  if (typeof key !== "string" || !siteTextFields.some((field) => field.key === key) || typeof value !== "string" || !value.trim() || value.length > 5000) {
    return NextResponse.json({ error: "Texte invalide ou trop long." }, { status: 400 });
  }
  const cleanValue = value.trim();
  if (key === "contact.phoneHref" && !/^\+?[0-9 .-]{6,25}$/.test(cleanValue)) return NextResponse.json({ error: "Numéro de téléphone invalide." }, { status: 400 });
  if (key === "contact.email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  if (key === "contact.instagramUrl" && !/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/i.test(cleanValue)) return NextResponse.json({ error: "Lien Instagram invalide." }, { status: 400 });
  const { error } = await supabase.from("site_texts").upsert({ key, value: cleanValue }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: "Enregistrement impossible. Vérifiez la migration Supabase." }, { status: 500 });
  for (const path of ["/", "/contact", "/avis-clients", "/mentions-legales", "/politique-confidentialite", "/galerie/shooting", "/galerie/spectacle-vivant", "/galerie/sport"]) revalidatePath(path);
  return NextResponse.json({ key, value: cleanValue });
}
