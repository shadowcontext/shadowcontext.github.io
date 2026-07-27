import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

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

function validDate(value, filePath, field) {
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) {
    throw new Error(`${filePath}: invalid ${field}`);
  }
  return milliseconds;
}

async function validateManifest(value, filePath, repoRoot) {
  if (
    value?.schemaVersion !== 1 ||
    value.status !== "ready" ||
    !value.title ||
    !value.canonicalUrl ||
    !value.generatedAt ||
    !value.publicationTimestamp ||
    !/^[a-f0-9]{64}$/.test(value.carouselHash || "") ||
    !value.caption ||
    !Array.isArray(value.imageFiles) ||
    !Array.isArray(value.altTexts) ||
    value.imageFiles.length < 2 ||
    value.imageFiles.length > 20 ||
    value.imageFiles.length !== value.altTexts.length
  ) {
    throw new Error(`${filePath}: invalid ready-carousel manifest`);
  }

  const generatedAtMs = validDate(value.generatedAt, filePath, "generatedAt");
  const publicationTimestampMs = validDate(
    value.publicationTimestamp,
    filePath,
    "publicationTimestamp",
  );
  const mediaRoot = path.resolve(repoRoot, "assets/social/threads");
  const imageFiles = [];
  for (const relativeFile of value.imageFiles) {
    const normalized = String(relativeFile).replaceAll("\\", "/");
    const absoluteFile = path.resolve(repoRoot, normalized);
    if (
      !normalized.startsWith("assets/social/threads/") ||
      !absoluteFile.startsWith(`${mediaRoot}${path.sep}`) ||
      path.extname(absoluteFile).toLowerCase() !== ".png"
    ) {
      throw new Error(`${filePath}: invalid carousel image path`);
    }
    await access(absoluteFile);
    imageFiles.push(normalized);
  }

  let canonicalUrl;
  try {
    canonicalUrl = new URL(value.canonicalUrl);
  } catch {
    throw new Error(`${filePath}: invalid canonicalUrl`);
  }
  if (
    canonicalUrl.protocol !== "https:" ||
    canonicalUrl.hostname !== "shadowcontext.com"
  ) {
    throw new Error(`${filePath}: canonicalUrl is not hosted by ShadowContext`);
  }

  return {
    ...value,
    canonicalUrl: canonicalUrl.toString(),
    imageFiles,
    generatedAtMs,
    publicationTimestampMs,
    manifestFile: filePath,
  };
}

export async function discoverReadyCarousels({ repoRoot }) {
  const files = await walk(path.join(repoRoot, "assets/social/threads"));
  const manifests = [];
  for (const filePath of files) {
    const value = JSON.parse(await readFile(filePath, "utf8"));
    manifests.push(await validateManifest(value, filePath, repoRoot));
  }
  return manifests;
}

export async function prepareQueue({
  repoRoot,
  statePath = path.join(repoRoot, "automation/linkedin/state.json"),
  maxPosts = 10,
  now = new Date(),
  discover = discoverReadyCarousels,
} = {}) {
  if (!repoRoot) throw new Error("repoRoot is required");
  if (!Number.isInteger(maxPosts) || maxPosts < 1) {
    throw new Error("maxPosts must be a positive integer");
  }
  const nowMs = now instanceof Date ? now.getTime() : Date.parse(now);
  if (!Number.isFinite(nowMs)) throw new Error("Invalid queue preparation time");

  const state = await loadState(statePath);
  const cutoffMs = state.ignoreBeforeGeneratedAt
    ? validDate(
        state.ignoreBeforeGeneratedAt,
        statePath,
        "ignoreBeforeGeneratedAt",
      )
    : Number.NEGATIVE_INFINITY;
  const discovered = await discover({ repoRoot });
  const ordered = [...discovered].sort(
    (left, right) => left.generatedAtMs - right.generatedAtMs,
  );
  const historical = ordered.filter(
    (record) =>
      record.generatedAtMs <= cutoffMs &&
      !isPublished(state, record.carouselHash),
  );
  const published = ordered.filter((record) =>
    isPublished(state, record.carouselHash),
  );
  const future = ordered.filter(
    (record) =>
      record.generatedAtMs > cutoffMs &&
      !isPublished(state, record.carouselHash) &&
      record.publicationTimestampMs > nowMs,
  );
  const ready = ordered.filter(
    (record) =>
      record.generatedAtMs > cutoffMs &&
      !isPublished(state, record.carouselHash) &&
      record.publicationTimestampMs <= nowMs,
  );

  return {
    state,
    posts: ready.slice(0, maxPosts),
    counters: {
      discovered: ordered.length,
      ready: ready.length,
      selected: Math.min(ready.length, maxPosts),
      skippedHistorical: historical.length,
      skippedPublished: published.length,
      skippedFuture: future.length,
      deferredByLimit: Math.max(0, ready.length - maxPosts),
    },
  };
}
