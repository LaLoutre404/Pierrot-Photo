import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export function isSupabaseConfigured() {
  return Boolean(getPublicSupabaseConfig());
}

export async function createSupabaseServerClient() {
  const config = getPublicSupabaseConfig();
  if (!config) return null;

  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Les Server Components en lecture seule ne peuvent pas toujours
          // rafraîchir les cookies. Les Route Handlers le feront au besoin.
        }
      },
    },
  });
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null, isAdmin: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, isAdmin: Boolean(data) };
}
