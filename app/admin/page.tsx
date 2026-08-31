import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { isSupabaseConfigured, requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isSupabaseConfigured()) redirect("/admin/connexion?configuration=requise");
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/connexion");
  if (!isAdmin) redirect("/admin/connexion?refuse=1");
  return <AdminDashboard userEmail={user.email ?? "compte administrateur"} />;
}
