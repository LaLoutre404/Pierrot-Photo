#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, parse, relative } from "node:path";
import sharp from "sharp";

const allowedSlugs = ["shooting", "spectacle-vivant", "sport"];
const acceptedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const natural = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const sourceRoot = process.argv[2];
const forcedCategory = option("--category");
const manifestPath = option("--manifest");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!sourceRoot || !supabaseUrl || !serviceKey) {
  console.error(
    "Usage: node --env-file=.env.local scripts/import-photos.mjs <dossier> [--category slug] [--manifest manifest.json]",
  );
  process.exit(1);
}
if (forcedCategory && !allowedSlugs.includes(forcedCategory)) {
  console.error(`Catégorie inconnue : ${forcedCategory}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (acceptedExtensions.has(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files;
}

const manifest = manifestPath
  ? JSON.parse(await readFile(manifestPath, "utf8"))
  : {};
const files = (await walk(sourceRoot)).sort((a, b) => natural.compare(a, b));
const { data: categories, error: categoryError } = await supabase
  .from("categories")
  .select("id, slug, title");
if (categoryError) throw categoryError;
const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
const nextOrder = new Map();

for (const category of categories) {
  const { data } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("category_id", category.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  nextOrder.set(category.id, (data?.sort_order ?? -1) + 1);
}

let imported = 0;
for (const sourcePath of files) {
  const relativePath = relative(sourceRoot, sourcePath);
  const entry = manifest[relativePath] ?? manifest[parse(sourcePath).base] ?? {};
  const pathCategory = relativePath.split(/[\\/]/)[0];
  const slug = entry.category ?? forcedCategory ?? pathCategory;
  const category = categoryBySlug.get(slug);
  if (!category) {
    console.warn(`Ignorée (catégorie introuvable) : ${relativePath}`);
    continue;
  }

  const input = sharp(sourcePath, { failOn: "error", limitInputPixels: 80_000_000 });
  const metadata = await input.metadata();
  if (!acceptedExtensions.has(`.${metadata.format}`.replace(".jpeg", ".jpg"))) {
    console.warn(`Ignorée (type réel invalide) : ${relativePath}`);
    continue;
  }
  const optimized = await input
    .rotate()
    .resize({ width: 3200, height: 3200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, smartSubsample: true })
    .toBuffer({ resolveWithObject: true });

  const { data: sequence, error: sequenceError } = await supabase.rpc(
    "allocate_photo_sequence",
  );
  if (sequenceError) throw sequenceError;
  const filename = `photo-${String(sequence).padStart(4, "0")}.webp`;
  const storagePath = `${slug}/${filename}`;
  const altText = String(entry.altText ?? "").trim();
  const canPublish = Boolean(altText);
  const finalAlt = altText || `Photographie de la série ${category.title} — description à compléter`;

  const { error: uploadError } = await supabase.storage
    .from("portfolio")
    .upload(storagePath, optimized.data, { contentType: "image/webp", upsert: false });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("photos").insert({
    sequence_number: sequence,
    filename,
    storage_path: storagePath,
    category_id: category.id,
    alt_text: finalAlt,
    caption: entry.caption ?? null,
    width: optimized.info.width,
    height: optimized.info.height,
    sort_order: nextOrder.get(category.id),
    is_featured: Boolean(entry.isFeatured),
    is_published: Boolean(entry.isPublished ?? true) && canPublish,
  });
  if (insertError) {
    await supabase.storage.from("portfolio").remove([storagePath]);
    throw insertError;
  }
  nextOrder.set(category.id, nextOrder.get(category.id) + 1);
  imported += 1;
  console.log(`${relativePath} → ${filename}${canPublish ? "" : " (masquée : alt à compléter)"}`);
}

console.log(`${imported} photographie(s) importée(s).`);
