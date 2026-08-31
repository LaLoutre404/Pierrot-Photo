export type CategorySlug =
  | "shooting"
  | "spectacle-vivant"
  | "sport"
  | "urbain";

export interface Category {
  id: string;
  slug: CategorySlug;
  title: string;
  description: string;
  theme_color: string;
  sort_order: number;
  created_at?: string;
}

export interface Photo {
  id: string;
  sequence_number: number;
  filename: string;
  storage_path: string;
  category_id: string;
  alt_text: string;
  caption: string | null;
  width: number;
  height: number;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  signed_url?: string;
}

export interface GalleryData {
  category: Category;
  photos: Photo[];
}
