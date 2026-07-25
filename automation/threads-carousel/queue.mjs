import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { DateTime } from "luxon";

import {
  DEFAULT_MAX_POSTS,
  DUBAI_ZONE,
  SITE_ORIGIN,
  THREADS_CHARACTER_LIMIT,
} from "./config.mjs";
import { canonicalizeUrl } from "./posts.mjs";
import { isPublished, loadState } from "./state.mjs";

async function walk(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    else if (entry.name === "carousel-manifest.json") files.push(entryPath);
  }
  return files;
}

function validatedReadyManifest(value, filePath) {
  if (
    !value ||
    value.schemaVersion !== 1 ||
    value.status !== "ready" ||
    !value.title ||
    !value.canonicalUrl ||
    !value.generatedAt ||
    !value.publicationTimestamp ||
    !value.sourceHash ||
    !value.carouselHash ||
    !value.caption ||
    !Array.isArray(value.imageUrls) ||
    !Array.isArray(value.imageFiles) ||
    !Array.isArray(value.altTexts)
  ) {
    throw new Error(`${filePath}: invalid ready-carousel manifest`);
  }
  if (
    value.imageUrls.length < 2 ||
    value.imageUrls.length !== value.imageFiles.length ||
    value.imageUrls.length !== value.altTexts.length
  ) {
    throw new Error(`${filePath}: carousel media arrays are inconsistent`);
  }
  const canonicalUrl = canonicalizeUrl(value.canonicalUrl);
  const generatedAt = DateTime.fromISO(value.generatedAt, { setZone: true });
  const publicationTimestamp = DateTime.fromISO(value.publicationTimestamp, {
    setZone: true,
  });
  if (!generatedAt.isValid || !publicationTimestamp.isValid) {
    throw new Error(`${filePath}: invalid carousel timestamp`);
  }
  const site = new URL(SITE_ORIGIN);
  for (const [index, imageUrl] of value.imageUrls.entries()) {
    let parsed;
    try {
      parsed = new URL(imageUrl);
    } catch {
      throw new Error(`${filePath}: carousel image URL is invalid`);
    }
    const imageFile = String(value.imageFiles[index]);
    const expectedUrl = new URL(imageFile.replace(/^\/+/, ""), SITE_ORIGIN);
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== site.hostname ||
      !imageFile.startsWith("assets/social/threads/") ||
      parsed.toString() !== expectedUrl.toString()
    ) {
      throw new Error(`${filePath}: image URL is not hosted by ShadowContext`);
    }
  }
  const captionUrls = value.caption.match(/https?:\/\/\S+/g) || [];
  if (
    [...value.caption].length > THREADS_CHARACTER_LIMIT ||
    captionUrls.length !== 1 ||
    canonicalizeUrl(captionUrls[0]) !== canonicalUrl ||
    !/(?:^|\s)#cybersecurity(?:\s|$)/i.test(value.caption)
  ) {
    throw new Error(`${filePath}: invalid Threads caption`);
  }
  return {
    ...value,
    canonicalUrl,
    generatedAt: generatedAt.toISO(),
    publicationTimestamp: publicationTimestamp.toISO(),
    manifestFile: filePath,
  };
}

export async function discoverReadyCarousels({ repoRoot }) {
  const mediaRoot = path.join(repoRoot, "assets/social/threads");
  const manifests = [];
  for (const filePath of await walk(mediaRoot)) {
    const value = JSON.parse(await readFile(filePath, "utf8"));
    manifests.push(validatedReadyManifest(value, filePath));
  }
  return manifests;
}

function latestPerCanonicalUrl(manifests) {
  const latest = new Map();
  for (const manifest of manifests) {
    const current = latest.get(manifest.canonicalUrl);
    if (!current || manifest.generatedAt > current.generatedAt) {
      latest.set(manifest.canonicalUrl, manifest);
    }
  }
  return [...latest.values()];
}

export async function preparePublishQueue({
  repoRoot,
  statePath = path.join(repoRoot, "automation/threads-carousel/state.json"),
  dryRun = true,
  maxPosts = DEFAULT_MAX_POSTS,
  now = DateTime.now().setZone(DUBAI_ZONE),
  discover = discoverReadyCarousels,
} = {}) {
  if (!repoRoot) throw new Error("repoRoot is required");
  if (!Number.isInteger(maxPosts) || maxPosts < 1) {
    throw new Error("maxPosts must be a positive integer");
  }
  const runTime = DateTime.isDateTime(now)
    ? now.setZone(DUBAI_ZONE)
    : DateTime.fromISO(String(now), { setZone: true }).setZone(DUBAI_ZONE);
  if (!runTime.isValid) throw new Error("Invalid queue preparation time");
  const state = await loadState(statePath);
  const discovered = await discover({ repoRoot });
  const unique = latestPerCanonicalUrl(discovered).sort((left, right) =>
    left.generatedAt.localeCompare(right.generatedAt),
  );
  const published = unique.filter((record) =>
    isPublished(state, record.canonicalUrl),
  );
  const future = unique.filter(
    (record) =>
      !isPublished(state, record.canonicalUrl) &&
      DateTime.fromISO(record.publicationTimestamp, {
        setZone: true,
      }).toMillis() > runTime.toMillis(),
  );
  const ready = unique.filter(
    (record) =>
      !isPublished(state, record.canonicalUrl) &&
      DateTime.fromISO(record.publicationTimestamp, {
        setZone: true,
      }).toMillis() <= runTime.toMillis(),
  );
  const selected = ready.slice(0, maxPosts);
  return {
    schemaVersion: 1,
    generatedAt: runTime.toISO(),
    dryRun,
    force: false,
    window: {
      name: "ready-carousels",
      timezone: DUBAI_ZONE,
      start: null,
      end: runTime.toISO(),
    },
    counters: {
      discovered: discovered.length,
      eligible: ready.length,
      skippedPublished: published.length,
      skippedIneligible: future.length,
      deferredByLimit: Math.max(0, ready.length - maxPosts),
      rendered: selected.length,
      published: 0,
      failed: 0,
    },
    skipped: [
      ...published.map((record) => ({
        title: record.title,
        canonicalUrl: record.canonicalUrl,
        reason: "already published",
      })),
      ...future.map((record) => ({
        title: record.title,
        canonicalUrl: record.canonicalUrl,
        reason: "future publication timestamp",
      })),
    ],
    posts: selected.map((record) => ({
      ...record,
      status: "rendered",
    })),
  };
}
