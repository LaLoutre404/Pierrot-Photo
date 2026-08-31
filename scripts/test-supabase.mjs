#!/usr/bin/env node

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  throw new Error("Les trois variables Supabase de .env.local sont requises.");
}

const hostname = new URL(url).hostname;
if (
  hostname !== "localhost" &&
  hostname !== "127.0.0.1" &&
  process.env.ALLOW_REMOTE_SUPABASE_TESTS !== "1"
) {
  throw new Error(
    "Ce test crée et supprime des données. Utilisez Supabase local ou définissez explicitement ALLOW_REMOTE_SUPABASE_TESTS=1.",
  );
}

const service = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anonymous = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const email = `portfolio-test-${Date.now()}@example.test`;
const password = `Test-${randomUUID()}-aA1!`;
let userId;
let photoId;
let storagePath;

try {
  const { data: created, error: userError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError) throw userError;
  userId = created.user.id;

  const { error: membershipError } = await service
    .from("admin_users")
    .insert({ user_id: userId });
  if (membershipError) throw membershipError;

  const { data: sessionData, error: loginError } = await anonymous.auth.signInWithPassword({
    email,
    password,
  });
  if (loginError || !sessionData.session) throw loginError ?? new Error("Session absente.");

  const admin = createClient(url, anonKey, {
    global: {
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: categories, error: categoryError } = await admin
    .from("categories")
    .select("id, slug")
    .order("sort_order");
  if (categoryError) throw categoryError;
  assert.equal(categories.length, 4);
  const sport = categories.find((category) => category.slug === "sport");
  const shooting = categories.find((category) => category.slug === "shooting");
  assert.ok(sport && shooting);

  const { error: anonWriteError } = await anonymous.from("photos").insert({
    filename: "photo-999999.webp",
    storage_path: "sport/photo-999999.webp",
    category_id: sport.id,
    alt_text: "Tentative anonyme qui doit être refusée",
    width: 16,
    height: 16,
  });
  assert.ok(anonWriteError, "Une insertion anonyme doit être refusée par RLS.");

  const { data: allocated, error: sequenceError } = await admin.rpc(
    "allocate_photo_sequence",
  );
  if (sequenceError) throw sequenceError;
  const sequence = Number(allocated);
  assert.ok(Number.isSafeInteger(sequence));
  const filename = `photo-${String(sequence).padStart(4, "0")}.webp`;
  storagePath = `sport/${filename}`;

  const webp = await sharp({
    create: { width: 32, height: 24, channels: 3, background: "#a85b1d" },
  })
    .webp({ quality: 88 })
    .toBuffer();

  const { error: uploadError } = await admin.storage
    .from("portfolio")
    .upload(storagePath, webp, { contentType: "image/webp" });
  if (uploadError) throw uploadError;

  const { data: inserted, error: insertError } = await admin
    .from("photos")
    .insert({
      sequence_number: sequence,
      filename,
      storage_path: storagePath,
      category_id: sport.id,
      alt_text: "Image colorée temporaire utilisée pour le test automatisé",
      width: 32,
      height: 24,
      sort_order: 0,
      is_published: false,
      is_featured: false,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;
  photoId = inserted.id;

  const { data: hidden } = await anonymous.from("photos").select("id").eq("id", photoId);
  assert.equal(hidden?.length, 0, "Une photo masquée ne doit pas être lisible publiquement.");

  const { error: publishError } = await admin
    .from("photos")
    .update({ is_published: true, is_featured: true, sort_order: 4 })
    .eq("id", photoId);
  if (publishError) throw publishError;

  const { data: published } = await anonymous
    .from("photos")
    .select("id, sort_order")
    .eq("id", photoId);
  assert.equal(published?.[0]?.sort_order, 4);

  const { error: moveError } = await admin
    .from("photos")
    .update({ category_id: shooting.id, sort_order: 0 })
    .eq("id", photoId);
  if (moveError) throw moveError;

  const { error: deleteStorageError } = await admin.storage
    .from("portfolio")
    .remove([storagePath]);
  if (deleteStorageError) throw deleteStorageError;
  storagePath = undefined;

  const { error: deleteError } = await admin.from("photos").delete().eq("id", photoId);
  if (deleteError) throw deleteError;
  photoId = undefined;

  const { data: nextAllocated, error: nextSequenceError } = await admin.rpc(
    "allocate_photo_sequence",
  );
  if (nextSequenceError) throw nextSequenceError;
  assert.ok(Number(nextAllocated) > sequence, "Un numéro supprimé ne doit jamais être réutilisé.");

  console.log("Supabase : ajout, RLS, publication, réorganisation, déplacement et suppression validés.");
} finally {
  if (storagePath) await service.storage.from("portfolio").remove([storagePath]);
  if (photoId) await service.from("photos").delete().eq("id", photoId);
  if (userId) {
    await service.from("admin_users").delete().eq("user_id", userId);
    await service.auth.admin.deleteUser(userId);
  }
}
