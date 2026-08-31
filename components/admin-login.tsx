"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const configured = Boolean(createSupabaseBrowserClient());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase n’est pas encore configuré. Consultez le README.");
      return;
    }

    setPending(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage("Connexion impossible. Vérifiez l’adresse e-mail et le mot de passe.");
      setPending(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <section className="admin-login">
      <div>
        <p className="eyebrow">Espace privé</p>
        <h1>Administration</h1>
        <p>Connectez-vous avec le compte créé manuellement dans Supabase.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Adresse e-mail
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {searchParams.get("refuse") ? (
          <p className="form-message form-message--error" role="alert">
            Ce compte n’est pas autorisé à administrer le portfolio.
          </p>
        ) : null}
        {!configured ? (
          <p className="form-message" role="status">
            Configuration Supabase requise avant la première connexion.
          </p>
        ) : null}
        {message ? (
          <p className="form-message form-message--error" role="alert">
            {message}
          </p>
        ) : null}
        <button type="submit" disabled={pending || !configured}>
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </section>
  );
}
