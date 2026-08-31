import { categoryContent, categorySlugs } from "@/content/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, CategorySlug, GalleryData, Photo } from "@/lib/types";

function fallbackCategory(slug: CategorySlug): Category {
  const content = categoryContent[slug];
  return {
    id: slug,
    slug,
    title: content.title,
    description: content.description,
    theme_color: content.themeColor,
    sort_order: categorySlugs.indexOf(slug),
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
    .maybeSingle();

  const category = (categoryData as Category | null) ?? fallbackCategory(slug);
  if (!categoryData) return { category, photos: [] };

  const { data } = await client
    .from("photos")
    .select("*")
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("sequence_number", { ascending: true });

  return {
    category,
    photos: await signPhotos((data ?? []) as Photo[], client),
  };
}

export async function getHomePhotos() {
  const client = await createSupabaseServerClient();
  if (!client) return [] as Photo[];

  const { data } = await client
    .from("photos")
    .select("*")
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("sequence_number", { ascending: true })
    .limit(18);

  return signPhotos((data ?? []) as Photo[], client);
}
