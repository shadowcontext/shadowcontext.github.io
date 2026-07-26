#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createInstagramClient } from "./instagram-client.mjs";

const repoRoot = process.cwd();
const mediaRoot = path.join(repoRoot, "assets/social/threads");
const statePath = path.join(repoRoot, "automation/instagram/state.json");
const artifactPath = path.join(
  repoRoot,
  ".artifacts/instagram/publication.json",
);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...(await walk(entryPath)));
    else if (entry.name === "carousel-manifest.json") results.push(entryPath);
  }
  return results;
}

async function loadJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const manifests = [];
for (const filePath of await walk(mediaRoot)) {
  const manifest = await loadJson(filePath);
  if (manifest?.status === "ready") manifests.push(manifest);
}
manifests.sort((left, right) =>
  String(right.generatedAt).localeCompare(String(left.generatedAt)),
);
const selected = manifests[0];
if (!selected) throw new Error("No generated carousel manifest is available");

const state = await loadJson(statePath, { version: 1, posts: {} });
if (state.posts[selected.canonicalUrl]?.status === "published") {
  throw new Error("The latest carousel is already published to Instagram");
}

try {
  const client = createInstagramClient();
  const result = await client.publishCarousel({
    imageUrls: selected.imageUrls,
    caption: selected.caption,
  });
  const record = {
    status: "published",
    title: selected.title,
    canonical_url: selected.canonicalUrl,
    carousel_hash: selected.carouselHash,
    instagram_account_id: result.account.id,
    instagram_username: result.account.username,
    instagram_media_id: result.mediaId,
    instagram_permalink: result.permalink,
    carousel_container_id: result.carouselContainerId,
    child_container_ids: result.childContainerIds,
    published_at: new Date().toISOString(),
  };
  state.posts[selected.canonicalUrl] = record;
  await writeJson(statePath, state);
  await writeJson(artifactPath, record);
  console.log(
    JSON.stringify({
      status: record.status,
      title: record.title,
      canonicalUrl: record.canonical_url,
      mediaId: record.instagram_media_id,
      permalink: record.instagram_permalink,
    }),
  );
} catch (error) {
  const failure = {
    status: "failed",
    title: selected.title,
    canonical_url: selected.canonicalUrl,
    error: String(error.message).slice(0, 1_000),
    failed_at: new Date().toISOString(),
  };
  await writeJson(artifactPath, failure);
  throw error;
}
