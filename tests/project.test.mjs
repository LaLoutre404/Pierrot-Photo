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
  assert.doesNotMatch(home, /IMG_472[3-9]|IMG_4730|canva/i);
});

test("database migration enforces publication and admin-only writes", async () => {
  const sql = await source("supabase/migrations/202608290001_initial_portfolio.sql");
  assert.match(sql, /enable row level security/gi);
  assert.match(sql, /is_published = true or public\.is_admin\(\)/);
  assert.match(sql, /Admins can insert photos/);
  assert.match(sql, /Admins can update photos/);
  assert.match(sql, /Admins can delete photos/);
  assert.match(sql, /storage\.objects for select/);
  assert.match(sql, /create sequence if not exists public\.photo_sequence/);
});

test("admin endpoints verify the server-side admin identity", async () => {
  const routes = await Promise.all([
    source("app/api/admin/photos/route.ts"),
    source("app/api/admin/photos/[id]/route.ts"),
    source("app/api/admin/reorder/route.ts"),
  ]);
  for (const route of routes) {
    assert.match(route, /requireAdmin\(\)/);
    assert.match(route, /isAdmin/);
  }
});
