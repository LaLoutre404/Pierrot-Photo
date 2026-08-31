"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  detectImageMime,
  MAX_SOURCE_BYTES,
} from "@/lib/image-validation";
import type { Category, Photo } from "@/lib/types";

type QueueStatus = "ready" | "processing" | "uploading" | "done" | "error";

interface QueueItem {
  id: string;
  file: File;
  preview: string;
  categoryId: string;
  altText: string;
  caption: string;
  publish: boolean;
  progress: number;
  status: QueueStatus;
  error?: string;
}

interface AdminPayload {
  categories: Category[];
  photos: Photo[];
}

async function fileSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  return detectImageMime(bytes);
}

async function optimizeToWebP(file: File) {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Le fichier dépasse 25 Mo.");
  }
  const mime = await fileSignature(file);
  if (!mime) {
    throw new Error("Le contenu réel du fichier n’est pas un JPEG, PNG ou WebP valide.");
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, 3200 / longest);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Le navigateur ne peut pas traiter cette image.");
  context.fillStyle = "#f5f3ee";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Conversion WebP impossible."))),
      "image/webp",
      0.88,
    );
  });
  return { blob, width, height };
}

function uploadWithProgress(formData: FormData, onProgress: (value: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/photos");
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else {
        try {
          const payload = JSON.parse(request.responseText) as { error?: string };
          reject(new Error(payload.error ?? "Téléversement impossible."));
        } catch {
          reject(new Error("Téléversement impossible."));
        }
      }
    });
    request.addEventListener("error", () => reject(new Error("Connexion interrompue.")));
    request.send(formData);
  });
}

export function AdminDashboard({ userEmail }: { userEmail: string }) {
  const [data, setData] = useState<AdminPayload>({ categories: [], photos: [] });
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/photos", { cache: "no-store" });
    if (!response.ok) {
      setNotice({ type: "error", text: "Impossible de charger la photothèque." });
      setLoading(false);
      return;
    }
    setData((await response.json()) as AdminPayload);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/photos", { cache: "no-store" }).then(async (response) => {
      if (!active) return;
      if (!response.ok) {
        setNotice({ type: "error", text: "Impossible de charger la photothèque." });
        setLoading(false);
        return;
      }
      setData((await response.json()) as AdminPayload);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      queue.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    // Les URL créées sont libérées au démontage de l’interface.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const visiblePhotos = useMemo(
    () =>
      data.photos.filter(
        (photo) => activeCategory === "all" || photo.category_id === activeCategory,
      ),
    [activeCategory, data.photos],
  );

  function addFiles(fileList: FileList | File[]) {
    const defaultCategory = data.categories[0]?.id ?? "";
    const additions = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      categoryId: activeCategory === "all" ? defaultCategory : activeCategory,
      altText: "",
      caption: "",
      publish: true,
      progress: 0,
      status: "ready" as const,
    }));
    setQueue((current) => [...current, ...additions]);
  }

  function updateQueue(id: string, patch: Partial<QueueItem>) {
    setQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function uploadAll() {
    const ready = queue.filter((item) => item.status === "ready" || item.status === "error");
    if (!ready.length) return;
    if (ready.some((item) => !item.altText.trim() || !item.categoryId)) {
      setNotice({
        type: "error",
        text: "Renseignez une catégorie et un texte alternatif descriptif pour chaque photo.",
      });
      return;
    }

    setNotice(null);
    let failures = 0;
    for (const item of ready) {
      try {
        updateQueue(item.id, { status: "processing", progress: 8, error: undefined });
        const optimized = await optimizeToWebP(item.file);
        updateQueue(item.id, { status: "uploading", progress: 15 });
        const formData = new FormData();
        formData.set("file", optimized.blob, "upload.webp");
        formData.set("categoryId", item.categoryId);
        formData.set("altText", item.altText.trim());
        formData.set("caption", item.caption.trim());
        formData.set("isPublished", String(item.publish));
        formData.set("width", String(optimized.width));
        formData.set("height", String(optimized.height));
        await uploadWithProgress(formData, (progress) =>
          updateQueue(item.id, { progress: Math.max(15, progress), status: "uploading" }),
        );
        updateQueue(item.id, { status: "done", progress: 100 });
      } catch (error) {
        failures += 1;
        updateQueue(item.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Erreur inattendue.",
        });
      }
    }
    await refresh();
    setNotice(
      failures
        ? { type: "error", text: `${failures} photo(s) n’ont pas pu être ajoutées.` }
        : { type: "success", text: "Les photographies ont bien été ajoutées." },
    );
  }

  async function updatePhoto(photoId: string, patch: Partial<Photo>, success: string) {
    const response = await fetch(`/api/admin/photos/${photoId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      setNotice({ type: "error", text: "La modification n’a pas été enregistrée." });
      return;
    }
    setNotice({ type: "success", text: success });
    await refresh();
  }

  async function deletePhoto(photo: Photo) {
    if (!window.confirm(`Supprimer définitivement Photo ${photo.sequence_number} ?`)) return;
    const response = await fetch(`/api/admin/photos/${photo.id}`, { method: "DELETE" });
    if (!response.ok) {
      setNotice({ type: "error", text: "La photographie n’a pas pu être supprimée." });
      return;
    }
    setNotice({ type: "success", text: `Photo ${photo.sequence_number} supprimée.` });
    await refresh();
  }

  async function saveOrder(ordered: Photo[]) {
    if (!ordered.length) return;
    const categoryId = ordered[0].category_id;
    setData((current) => ({
      ...current,
      photos: [
        ...current.photos.filter((photo) => photo.category_id !== categoryId),
        ...ordered.map((photo, index) => ({ ...photo, sort_order: index })),
      ].sort((a, b) => a.sort_order - b.sort_order),
    }));
    const response = await fetch("/api/admin/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ categoryId, orderedIds: ordered.map((photo) => photo.id) }),
    });
    setNotice(
      response.ok
        ? { type: "success", text: "Nouvel ordre enregistré." }
        : { type: "error", text: "Le nouvel ordre n’a pas pu être enregistré." },
    );
    if (!response.ok) await refresh();
  }

  function moveByKeyboard(photo: Photo, direction: -1 | 1) {
    const categoryPhotos = data.photos
      .filter((item) => item.category_id === photo.category_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const index = categoryPhotos.findIndex((item) => item.id === photo.id);
    const target = index + direction;
    if (target < 0 || target >= categoryPhotos.length) return;
    [categoryPhotos[index], categoryPhotos[target]] = [categoryPhotos[target], categoryPhotos[index]];
    void saveOrder(categoryPhotos);
  }

  function dropOn(targetPhoto: Photo) {
    if (!draggingId || draggingId === targetPhoto.id) return;
    const categoryPhotos = data.photos
      .filter((item) => item.category_id === targetPhoto.category_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const from = categoryPhotos.findIndex((photo) => photo.id === draggingId);
    const to = categoryPhotos.findIndex((photo) => photo.id === targetPhoto.id);
    if (from < 0 || to < 0) return;
    const [moved] = categoryPhotos.splice(from, 1);
    categoryPhotos.splice(to, 0, moved);
    setDraggingId(null);
    void saveOrder(categoryPhotos);
  }

  async function signOut() {
    await createSupabaseBrowserClient()?.auth.signOut();
    window.location.assign("/admin/connexion");
  }

  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <p className="eyebrow">Photothèque privée</p>
          <h1>Bonjour Pierre</h1>
          <p>Connecté avec {userEmail}</p>
        </div>
        <div>
          <Link href="/" target="_blank">Prévisualiser le site ↗</Link>
          <button type="button" className="button-secondary" onClick={signOut}>
            Se déconnecter
          </button>
        </div>
      </header>

      {notice ? (
        <div className={`admin-notice admin-notice--${notice.type}`} role="status">
          {notice.text}
          <button type="button" aria-label="Fermer le message" onClick={() => setNotice(null)}>×</button>
        </div>
      ) : null}

      <section className="upload-panel" aria-labelledby="upload-title">
        <div>
          <p className="eyebrow">Nouvel ajout</p>
          <h2 id="upload-title">Ajouter des photographies</h2>
          <p>JPEG, PNG ou WebP, 25 Mo maximum. Les fichiers seront automatiquement optimisés et renommés.</p>
        </div>
        <div
          className="drop-zone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            addFiles(event.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <p>Glissez vos photographies ici</p>
          <span>ou</span>
          <button type="button" onClick={() => inputRef.current?.click()}>
            Choisir des fichiers
          </button>
        </div>

        {queue.length ? (
          <div className="upload-queue">
            {queue.map((item) => (
              <article key={item.id} className="upload-item">
                {/* Une prévisualisation locale n’est jamais publiée telle quelle. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="Prévisualisation avant import" />
                <div className="upload-item__fields">
                  <p>{item.file.name}</p>
                  <label>
                    Catégorie
                    <select
                      value={item.categoryId}
                      onChange={(event) => updateQueue(item.id, { categoryId: event.target.value })}
                    >
                      {data.categories.map((category) => (
                        <option value={category.id} key={category.id}>{category.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Texte alternatif descriptif *
                    <input
                      value={item.altText}
                      placeholder="Ex. Athlète franchissant une haie au coucher du soleil"
                      onChange={(event) => updateQueue(item.id, { altText: event.target.value })}
                    />
                  </label>
                  <label>
                    Légende (facultatif)
                    <input
                      value={item.caption}
                      onChange={(event) => updateQueue(item.id, { caption: event.target.value })}
                    />
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={item.publish}
                      onChange={(event) => updateQueue(item.id, { publish: event.target.checked })}
                    />
                    Publier immédiatement
                  </label>
                  {item.status !== "ready" ? (
                    <div className="upload-progress">
                      <span style={{ width: `${item.progress}%` }} />
                      <small>{item.status === "error" ? item.error : `${item.progress} %`}</small>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Retirer ${item.file.name}`}
                  disabled={item.status === "uploading" || item.status === "processing"}
                  onClick={() => {
                    URL.revokeObjectURL(item.preview);
                    setQueue((current) => current.filter((entry) => entry.id !== item.id));
                  }}
                >
                  ×
                </button>
              </article>
            ))}
            <button className="button-primary" type="button" onClick={uploadAll}>
              Ajouter {queue.filter((item) => item.status !== "done").length} photographie(s)
            </button>
          </div>
        ) : null}
      </section>

      <section className="library-panel" aria-labelledby="library-title">
        <div className="library-panel__top">
          <div>
            <p className="eyebrow">Contenu publié</p>
            <h2 id="library-title">Gérer les photographies</h2>
          </div>
          <label>
            Afficher
            <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
              <option value="all">Toutes les catégories</option>
              {data.categories.map((category) => (
                <option key={category.id} value={category.id}>{category.title}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? <p>Chargement de la photothèque…</p> : null}
        {!loading && !visiblePhotos.length ? (
          <div className="library-empty">Aucune photographie dans cette sélection.</div>
        ) : null}
        <div className="admin-photo-grid">
          {visiblePhotos.map((photo) => (
            <article
              key={photo.id}
              className="admin-photo-card"
              draggable={activeCategory !== "all"}
              onDragStart={() => setDraggingId(photo.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(photo)}
            >
              <div className="admin-photo-card__image">
                {photo.signed_url ? (
                  <Image src={photo.signed_url} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" />
                ) : null}
                <span>Photo {photo.sequence_number}</span>
                {!photo.is_published ? <em>Masquée</em> : null}
              </div>
              <div className="admin-photo-card__body">
                <label>
                  Catégorie
                  <select
                    value={photo.category_id}
                    onChange={(event) => void updatePhoto(photo.id, { category_id: event.target.value }, "Catégorie modifiée.")}
                  >
                    {data.categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.title}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Texte alternatif
                  <textarea
                    defaultValue={photo.alt_text}
                    rows={2}
                    onBlur={(event) => {
                      if (event.target.value !== photo.alt_text)
                        void updatePhoto(photo.id, { alt_text: event.target.value }, "Texte alternatif enregistré.");
                    }}
                  />
                </label>
                <label>
                  Légende
                  <input
                    defaultValue={photo.caption ?? ""}
                    onBlur={(event) => {
                      if (event.target.value !== (photo.caption ?? ""))
                        void updatePhoto(photo.id, { caption: event.target.value || null }, "Légende enregistrée.");
                    }}
                  />
                </label>
                <div className="admin-photo-card__toggles">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={photo.is_published}
                      onChange={(event) => void updatePhoto(photo.id, { is_published: event.target.checked }, event.target.checked ? "Photo publiée." : "Photo masquée.")}
                    />
                    Publiée
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={photo.is_featured}
                      onChange={(event) => void updatePhoto(photo.id, { is_featured: event.target.checked }, event.target.checked ? "Photo de couverture définie." : "Photo de couverture retirée.")}
                    />
                    Couverture
                  </label>
                </div>
                <div className="admin-photo-card__actions">
                  <button type="button" onClick={() => moveByKeyboard(photo, -1)} aria-label={`Déplacer Photo ${photo.sequence_number} vers le haut`} disabled={activeCategory === "all"}>↑</button>
                  <button type="button" onClick={() => moveByKeyboard(photo, 1)} aria-label={`Déplacer Photo ${photo.sequence_number} vers le bas`} disabled={activeCategory === "all"}>↓</button>
                  <span>{activeCategory === "all" ? "Filtrez une catégorie pour réordonner" : "Glisser pour réordonner"}</span>
                  <button type="button" className="danger-button" onClick={() => void deletePhoto(photo)}>Supprimer</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
