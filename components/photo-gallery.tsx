"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/types";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const pointerStart = useRef<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const previous = useCallback(
    () =>
      setActiveIndex((index) =>
        index === null ? null : (index - 1 + photos.length) % photos.length,
      ),
    [photos.length],
  );
  const next = useCallback(
    () =>
      setActiveIndex((index) =>
        index === null ? null : (index + 1) % photos.length,
      ),
    [photos.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
      if (event.key === "Tab") {
        const controls = Array.from(
          document.querySelectorAll<HTMLButtonElement>("[data-lightbox-control]"),
        );
        if (!controls.length) return;
        const current = controls.indexOf(document.activeElement as HTMLButtonElement);
        const direction = event.shiftKey ? -1 : 1;
        const target = controls[(current + direction + controls.length) % controls.length];
        event.preventDefault();
        target.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, next, previous]);

  if (!photos.length) {
    return (
      <div className="gallery-empty">
        <p>La sélection photographique de cette série sera publiée prochainement.</p>
      </div>
    );
  }

  const active = activeIndex === null ? null : photos[activeIndex];

  return (
    <>
      <div className="masonry-gallery">
        {photos.map((photo, index) => (
          <button
            className="masonry-gallery__item"
            type="button"
            key={photo.id}
            onClick={() => setActiveIndex(index)}
            aria-label={`Agrandir : ${photo.alt_text}`}
          >
            {photo.signed_url ? (
              <Image
                src={photo.signed_url}
                alt={photo.alt_text}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : null}
            {photo.caption ? <span>{photo.caption}</span> : null}
          </button>
        ))}
      </div>

      {active?.signed_url ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photographie ${activeIndex! + 1} sur ${photos.length}`}
          onPointerDown={(event) => {
            pointerStart.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) return;
            const distance = event.clientX - pointerStart.current;
            pointerStart.current = null;
            if (Math.abs(distance) < 45) return;
            if (distance > 0) previous();
            else next();
          }}
        >
          <button
            ref={closeButton}
            data-lightbox-control
            className="lightbox__close"
            type="button"
            onClick={close}
            aria-label="Fermer la photographie"
          >
            Fermer
          </button>
          {photos.length > 1 ? (
            <button
              data-lightbox-control
              className="lightbox__previous"
              type="button"
              onClick={previous}
              aria-label="Photographie précédente"
            >
              ←
            </button>
          ) : null}
          <div className="lightbox__image">
            <Image
              src={active.signed_url}
              alt={active.alt_text}
              fill
              sizes="100vw"
              priority
            />
          </div>
          {photos.length > 1 ? (
            <button
              data-lightbox-control
              className="lightbox__next"
              type="button"
              onClick={next}
              aria-label="Photographie suivante"
            >
              →
            </button>
          ) : null}
          <div className="lightbox__meta" aria-live="polite">
            <span>
              {activeIndex! + 1} / {photos.length}
            </span>
            {active.caption ? <p>{active.caption}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
