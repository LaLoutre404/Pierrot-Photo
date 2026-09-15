import { categoryContent, categorySlugs } from "@/content/site";
import { HOME_PHOTO_SLOTS } from "@/lib/home-slots";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Category,
  CategorySlug,
  GalleryData,
  HomePhotoSlotAssignment,
  HomePhotosBySlot,
  Photo,
} from "@/lib/types";

function fallbackCategory(slug: CategorySlug): Category {
  const content = categoryContent[slug];
  return {
    id: slug,
    slug,
    title: content.title,
    description: content.description,
    theme_color: content.themeColor,
    sort_order: categorySlugs.indexOf(slug),
    is_active: true,
  };
}

async function signPhotos(
  photos: Photo[],
  client: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
) {
  if (!photos.length) return photos;
  const { data } = await client.storage
    .from("portfolio")
    .createSignedUrls(
      photos.map((photo) => photo.storage_path),
      60 * 60,
    );

  const urls = new Map(
    (data ?? []).map((entry) => [entry.path ?? "", entry.signedUrl]),
  );
  return photos.map((photo) => ({
    ...photo,
    signed_url: urls.get(photo.storage_path) ?? undefined,
  }));
}

export async function getGallery(slug: CategorySlug): Promise<GalleryData> {
  const client = await createSupabaseServerClient();
  if (!client) return { category: fallbackCategory(slug), photos: [] };

  const { data: categoryData } = await client
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const category = (categoryData as Category | null) ?? fallbackCategory(slug);
  if (!categoryData) return { category, photos: [] };

  const [{ data }, { data: homeSlots }] = await Promise.all([
    client
      .from("photos")
      .select("*")
      .eq("category_id", category.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("sequence_number", { ascending: true }),
    client.from("home_photo_slots").select("photo_id"),
  ]);

  const homePhotoIds = new Set(
    (homeSlots ?? []).flatMap((slot) => slot.photo_id ?? []),
  );
  const galleryPhotos = ((data ?? []) as Photo[]).filter(
    (photo) => !homePhotoIds.has(photo.id),
  );

  return {
    category,
    photos: await signPhotos(galleryPhotos, client),
  };
}

async function fallbackHomePhotos(
  client: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  categoryIds: string[],
): Promise<HomePhotosBySlot> {
  if (!categoryIds.length) return {};
  const { data } = await client
    .from("photos")
    .select("*")
    .in("category_id", categoryIds)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("sequence_number", { ascending: true })
    .limit(HOME_PHOTO_SLOTS.length);
  const signed = await signPhotos((data ?? []) as Photo[], client);
  return Object.fromEntries(
    HOME_PHOTO_SLOTS.map((slot, index) => [slot.key, signed[index]]).filter((entry) => entry[1]),
  ) as HomePhotosBySlot;
}

export async function getHomePhotos(): Promise<HomePhotosBySlot> {
  const client = await createSupabaseServerClient();
  if (!client) return {};

  const { data: activeCategories } = await client
    .from("categories")
    .select("id")
    .eq("is_active", true)
    .in("slug", categorySlugs);
  const categoryIds = (activeCategories ?? []).map((category) => category.id);

  const { data: slots, error: slotError } = await client
    .from("home_photo_slots")
    .select("slot_key, photo_id")
    .order("slot_key");
  if (slotError || !slots?.length) return fallbackHomePhotos(client, categoryIds);

  const assignments = slots as HomePhotoSlotAssignment[];
  const photoIds = [...new Set(assignments.flatMap((slot) => slot.photo_id ?? []))];
  if (!photoIds.length || !categoryIds.length) return {};

  const { data: photos } = await client
    .from("photos")
    .select("*")
    .in("id", photoIds)
    .in("category_id", categoryIds)
    .eq("is_published", true);
  const signed = await signPhotos((photos ?? []) as Photo[], client);
  const byId = new Map(signed.map((photo) => [photo.id, photo]));

  return Object.fromEntries(
    assignments
      .map((slot) => [slot.slot_key, slot.photo_id ? byId.get(slot.photo_id) : undefined])
      .filter((entry) => entry[1]),
  ) as HomePhotosBySlot;
}
