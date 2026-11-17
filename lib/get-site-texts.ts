import "server-only";
import { cache } from "react";
import { defaultSiteTexts, siteTextFields, type SiteTexts } from "@/lib/site-texts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getSiteTexts = cache(async (): Promise<SiteTexts> => {
  const client = await createSupabaseServerClient();
  if (!client) return defaultSiteTexts;
  const { data, error } = await client.from("site_texts").select("key, value");
  if (error) return defaultSiteTexts;
  const allowed = new Set<string>(siteTextFields.map((field) => field.key));
  return { ...defaultSiteTexts, ...Object.fromEntries((data ?? []).filter((row) => allowed.has(row.key)).map((row) => [row.key, row.value])) };
});
