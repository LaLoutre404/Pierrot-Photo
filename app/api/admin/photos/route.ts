import { NextResponse } from "next/server";
import { getWebPDimensions, MAX_WEBP_BYTES } from "@/lib/image-validation";
import { requireAdmin } from "@/lib/supabase/server";
import type { Category, Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
}

export async function GET() {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return unauthorized();

  const [{ data: categories, error: categoryError }, { data: photos, error: photoError }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("photos")
        .select("*")
        .order("category_id")
        .order("sort_order")
        .order("sequence_number"),
    ]);

  if (categoryError || photoError) {
    return NextResponse.json({ error: "Lecture de la photothèque impossible." }, { status: 500 });
  }

  const typedPhotos = (photos ?? []) as Photo[];
  const { data: signed } = typedPhotos.length
    ? await supabase.storage
        .from("portfolio")
        .createSignedUrls(
          typedPhotos.map((photo) => photo.storage_path),
          30 * 60,
        )
    : { data: [] };
  const urls = new Map(
    (signed ?? []).map((entry) => [entry.path ?? "", entry.signedUrl]),
  );

  return NextResponse.json({
    categories: (categories ?? []) as Category[],
    photos: typedPhotos.map((photo) => ({
      ...photo,
      signed_url: urls.get(photo.storage_path) ?? undefined,
    })),
  });
}

export async function POST(request: Request) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return unauthorized();

  const formData = await request.formData();
  const file = formData.get("file");
  const categoryId = String(formData.get("categoryId") ?? "");
  const altText = String(formData.get("altText") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const isPublished = String(formData.get("isPublished")) === "true";

  if (!(file instanceof File) || !categoryId || !altText) {
    return NextResponse.json(
      { error: "Fichier, catégorie et texte alternatif sont obligatoires." },
      { status: 400 },
    );
  }
  if (altText.length > 500 || caption.length > 1000) {
    return NextResponse.json({ error: "Le texte renseigné est trop long." }, { status: 400 });
  }
  if (file.size > MAX_WEBP_BYTES) {
    return NextResponse.json({ error: "L’image optimisée dépasse 12 Mo." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const dimensions = getWebPDimensions(bytes);
  if (!dimensions || dimensions.width < 1 || dimensions.height < 1) {
    return NextResponse.json({ error: "Le fichier WebP généré est invalide." }, { status: 400 });
  }
  if (dimensions.width > 5000 || dimensions.height > 5000) {
    return NextResponse.json({ error: "Les dimensions de l’image sont trop grandes." }, { status: 400 });
  }

  const { data: category } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("id", categoryId)
    .maybeSingle();
  if (!category) {
    return NextResponse.json({ error: "Catégorie introuvable." }, { status: 400 });
  }

  const { data: sequence, error: sequenceError } = await supabase.rpc(
    "allocate_photo_sequence",
  );
  if (sequenceError || typeof sequence !== "number") {
    return NextResponse.json({ error: "Impossible d’attribuer un numéro à la photo." }, { status: 500 });
  }

  const filename = `photo-${String(sequence).padStart(4, "0")}.webp`;
  const storagePath = `${category.slug}/${filename}`;
  const { error: uploadError } = await supabase.storage
    .from("portfolio")
    .upload(storagePath, bytes, { contentType: "image/webp", upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: "Le stockage de la photographie a échoué." }, { status: 500 });
  }

  const { data: last } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created, error: insertError } = await supabase
    .from("photos")
    .insert({
      sequence_number: sequence,
      filename,
      storage_path: storagePath,
      category_id: categoryId,
      alt_text: altText,
      caption: caption || null,
      width: dimensions.width,
      height: dimensions.height,
      sort_order: (last?.sort_order ?? -1) + 1,
      is_featured: false,
      is_published: isPublished,
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from("portfolio").remove([storagePath]);
    return NextResponse.json({ error: "L’enregistrement de la photographie a échoué." }, { status: 500 });
  }

  return NextResponse.json({ photo: created }, { status: 201 });
}
