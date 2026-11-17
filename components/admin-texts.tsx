"use client";

import { useEffect, useState } from "react";
import { defaultSiteTexts, siteTextFields, type SiteTextKey, type SiteTexts } from "@/lib/site-texts";

export function AdminTexts() {
  const [values, setValues] = useState<SiteTexts>(defaultSiteTexts);
  const [saved, setSaved] = useState<SiteTexts>(defaultSiteTexts);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState<SiteTextKey | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/texts", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json() as { values?: SiteTexts; error?: string };
      if (!active) return;
      if (!response.ok || !payload.values) { setMessage(payload.error ?? "Chargement impossible."); return; }
      setValues(payload.values);
      setSaved(payload.values);
    }).catch(() => { if (active) setMessage("Chargement impossible."); });
    return () => { active = false; };
  }, []);

  async function save(key: SiteTextKey) {
    setSaving(key);
    setMessage("");
    try {
      const response = await fetch("/api/admin/texts", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, value: values[key] }),
      });
      const payload = await response.json() as { value?: string; error?: string };
      if (!response.ok || !payload.value) { setMessage(payload.error ?? "Enregistrement impossible."); return; }
      setValues((current) => ({ ...current, [key]: payload.value! }));
      setSaved((current) => ({ ...current, [key]: payload.value! }));
      setMessage("Texte enregistré. La mise à jour du site peut prendre quelques instants.");
    } catch {
      setMessage("Connexion interrompue.");
    } finally {
      setSaving(null);
    }
  }

  const groups = [...new Set(siteTextFields.map((field) => field.group))];
  return (
    <section className="texts-panel" aria-labelledby="texts-title">
      <p className="eyebrow">Contenu du site</p>
      <h2 id="texts-title">Modifier les textes</h2>
      <p>Modifiez un champ, puis enregistrez-le. Les coordonnées changent aussi les liens de contact.</p>
      {message ? <p className="texts-panel__message" role="status">{message}</p> : null}
      {groups.map((group) => (
        <details key={group} className="texts-group">
          <summary>{group}</summary>
          <div className="texts-group__fields">
            {siteTextFields.filter((field) => field.group === group).map((field) => {
              const key = field.key as SiteTextKey;
              return (
                <div className="texts-field" key={key}>
                  <label htmlFor={`text-${key}`}>{field.label}</label>
                  {"multiline" in field && field.multiline ? (
                    <textarea id={`text-${key}`} rows={4} maxLength={5000} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} />
                  ) : (
                    <input id={`text-${key}`} maxLength={5000} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} />
                  )}
                  <button className="button-primary" type="button" disabled={saving !== null || values[key] === saved[key] || !values[key].trim()} onClick={() => void save(key)}>
                    {saving === key ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              );
            })}
          </div>
        </details>
      ))}
    </section>
  );
}
