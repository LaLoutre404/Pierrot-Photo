import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLogin } from "@/components/admin-login";

export const metadata: Metadata = {
  title: "Connexion administration",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="admin-loading">Chargement…</p>}>
      <AdminLogin />
    </Suspense>
  );
}
