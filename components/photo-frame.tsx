import Image from "next/image";
import type { Photo } from "@/lib/types";

export function PhotoFrame({
  photo,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  label = "Photographie à venir",
}: {
  photo?: Photo;
  className?: string;
  priority?: boolean;
  sizes?: string;
  label?: string;
}) {
  if (!photo?.signed_url) {
    return (
      <div className={`photo-frame photo-frame--empty ${className}`} role="img" aria-label={label}>
        <span>{label}</span>
      </div>
    );
  }

  return (
    <figure className={`photo-frame ${className}`}>
      <Image
        src={photo.signed_url}
        alt={photo.alt_text}
        fill
        priority={priority}
        sizes={sizes}
      />
      {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
    </figure>
  );
}
