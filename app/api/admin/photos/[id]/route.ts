import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";
import type { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

const editableFields = [
  "category_id",
  "alt_text",
  "caption",
  "is_featured",
  "is_published",
] as const;

function unauthorized() {
  return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return unauthorized();
  const { id } = await params;
  const payload = (await request.json()) as Partial<Photo>;
  const updates: Record<string, string | number | boolean | null> = {};

  for (const field of editableFields) {
    if (field in payload) updates[field] = payload[field] as string | number | boolean | null;
  }
  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Aucune modification valide." }, { status: 400 });
  }
  if (typeof updates.alt_text === "string") {
    updates.alt_text = updates.alt_text.trim();
    if (!updates.alt_text || updates.alt_text.length > 500) {
      return NextResponse.json({ error: "Le texte alternatif est invalide." }, { status: 400 });
    }
  }
  if (typeof updates.caption === "string") {
    updates.caption = updates.caption.trim() || null;
  }

  const { data: current } = await supabase
    .from("photos")
    .select("id, category_id, is_featured")
    .eq("id", id)
    .maybeSingle();
  if (!current) return NextResponse.json({ error: "Photographie introuvable." }, { status: 404 });

  if (updates.category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", updates.category_id)
      .maybeSingle();
    if (!category) return NextResponse.json({ error: "Catégorie introuvable." }, { status: 400 });
    const { data: last } = await supabase
      .from("photos")
      .select("sort_order")
      .eq("category_id", updates.category_id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    updates.sort_order = (last?.sort_order ?? -1) + 1;
  }

  const targetCategory = String(updates.category_id ?? current.category_id);
  if (
    updates.is_featured === true ||
    (updates.category_id && current.is_featured === true)
  ) {
    const { error } = await supabase
      .from("photos")
      .update({ is_featured: false })
      .eq("category_id", targetCategory);
    if (error) return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("photos")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  return NextResponse.json({ photo: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return unauthorized();
  const { id } = await params;

  const { data: photo } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!photo) return NextResponse.json({ error: "Photographie introuvable." }, { status: 404 });

  const { error: storageError } = await supabase.storage
    .from("portfolio")
    .remove([photo.storage_path]);
  if (storageError) {
    return NextResponse.json({ error: "Suppression du fichier impossible." }, { status: 500 });
  }
  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Suppression en base impossible." }, { status: 500 });
  return NextResponse.json({ success: true });
}
