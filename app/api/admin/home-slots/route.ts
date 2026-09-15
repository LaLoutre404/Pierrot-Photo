import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { HOME_PHOTO_SLOT_KEYS } from "@/lib/home-slots";
import { requireAdmin } from "@/lib/supabase/server";
import type { HomePhotoSlotKey } from "@/lib/home-slots";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
}

export async function PATCH(request: Request) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) return unauthorized();

  const payload = (await request.json()) as {
    slotKey?: HomePhotoSlotKey;
    photoId?: string | null;
  };
  if (!payload.slotKey || !HOME_PHOTO_SLOT_KEYS.includes(payload.slotKey)) {
    return NextResponse.json({ error: "Emplacement d’accueil invalide." }, { status: 400 });
  }

  const photoId = payload.photoId || null;
  if (photoId) {
    const { data: photo } = await supabase
      .from("photos")
      .select("id, categories!inner(is_active)")
      .eq("id", photoId)
      .eq("categories.is_active", true)
      .maybeSingle();
    if (!photo) {
      return NextResponse.json({ error: "Photographie introuvable." }, { status: 404 });
    }
  }

  const { data, error } = await supabase
    .from("home_photo_slots")
    .upsert(
      { slot_key: payload.slotKey, photo_id: photoId },
      { onConflict: "slot_key" },
    )
    .select("slot_key, photo_id")
    .single();
  if (error) {
    return NextResponse.json({ error: "L’emplacement n’a pas pu être enregistré." }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ slot: data });
}
