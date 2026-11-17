import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("public pages contain the requested editorial content", async () => {
  const [home, content, contact] = await Promise.all([
    source("app/page.tsx"),
    source("content/site.ts"),
    source("app/contact/page.tsx"),
  ]);
  assert.match(home, /Portfolio/);
  assert.match(content, /À propos de moi/);
  assert.match(content, /Maîtrise de la prise de vue/);
  assert.match(content, /Marcel Proust/);
  assert.match(contact, /phoneHref|instagramUrl|mailto/);
  assert.doesNotMatch(content, /urbain/i);
  assert.match(home, /HOME_UNIVERSE_SLOTS/);
  assert.doesNotMatch(home, /IMG_472[3-9]|IMG_4730|canva/i);
});

test("database migration enforces publication and admin-only writes", async () => {
  const sql = await source("supabase/migrations/202608290001_initial_portfolio.sql");
  assert.match(sql, /enable row level security/gi);
  assert.match(sql, /is_published = true/);
  assert.match(sql, /categories\.is_active = true/);
  assert.match(sql, /Admins can insert photos/);
  assert.match(sql, /Admins can update photos/);
  assert.match(sql, /Admins can delete photos/);
  assert.match(sql, /storage\.objects for select/);
  assert.match(sql, /create sequence if not exists public\.photo_sequence/);
});

test("editable site texts remain public to read and admin-only to write", async () => {
  const [sql, route] = await Promise.all([
    source("supabase/migrations/202610120001_site_texts.sql"),
    source("app/api/admin/texts/route.ts"),
  ]);
  assert.match(sql, /site_texts enable row level security/);
  assert.match(sql, /site_texts for select[\s\S]*using \(true\)/);
  assert.match(sql, /site_texts for all[\s\S]*public\.is_admin\(\)/);
  assert.match(route, /requireAdmin\(\)/);
  assert.match(route, /!supabase \|\| !isAdmin/);
});

test("home photo slots are protected and Urbain is retired", async () => {
  const [sql, slots, dashboard] = await Promise.all([
    source("supabase/migrations/202609150001_home_slots_and_remove_urbain.sql"),
    source("lib/home-slots.ts"),
    source("components/admin-dashboard.tsx"),
  ]);
  assert.match(sql, /set is_active = false[\s\S]*slug = 'urbain'/);
  assert.match(sql, /home_photo_slots enable row level security/);
  assert.match(sql, /Admins can manage home photo slots/);
  assert.match(slots, /universe-spectacle-vivant/);
  assert.match(dashboard, /Choisir chaque emplacement/);
});

test("home photos are excluded from galleries and captions stay private", async () => {
  const [photos, gallery, frame] = await Promise.all([
    source("lib/photos.ts"),
    source("components/photo-gallery.tsx"),
    source("components/photo-frame.tsx"),
  ]);
  assert.match(photos, /homePhotoIds/);
  assert.match(photos, /!homePhotoIds\.has\(photo\.id\)/);
  assert.doesNotMatch(gallery, /photo\.caption|active\.caption/);
  assert.doesNotMatch(frame, /photo\.caption|figcaption/);
});

test("admin endpoints verify the server-side admin identity", async () => {
  const routes = await Promise.all([
    source("app/api/admin/photos/route.ts"),
    source("app/api/admin/photos/[id]/route.ts"),
    source("app/api/admin/reorder/route.ts"),
    source("app/api/admin/home-slots/route.ts"),
    source("app/api/admin/texts/route.ts"),
  ]);
  for (const route of routes) {
    assert.match(route, /requireAdmin\(\)/);
    assert.match(route, /isAdmin/);
  }
});
