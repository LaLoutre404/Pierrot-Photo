import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!supabase || !isAdmin) {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
  }

  const payload = (await request.json()) as { categoryId?: string; orderedIds?: string[] };
  if (!payload.categoryId || !Array.isArray(payload.orderedIds) || !payload.orderedIds.length) {
    return NextResponse.json({ error: "Ordre invalide." }, { status: 400 });
  }
  if (new Set(payload.orderedIds).size !== payload.orderedIds.length) {
    return NextResponse.json({ error: "La liste contient des doublons." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("photos")
    .select("id")
    .eq("category_id", payload.categoryId)
    .in("id", payload.orderedIds);
  if ((existing ?? []).length !== payload.orderedIds.length) {
    return NextResponse.json({ error: "Une photographie ne correspond pas à la catégorie." }, { status: 400 });
  }

  for (const [index, id] of payload.orderedIds.entries()) {
    const { error } = await supabase.from("photos").update({ sort_order: index }).eq("id", id);
    if (error) return NextResponse.json({ error: "Réorganisation impossible." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
