import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { DateTime } from "luxon";

import {
  CAROUSEL_TEMPLATE_VERSION,
  DEFAULT_MAX_POSTS,
  DUBAI_ZONE,
  SITE_ORIGIN,
} from "./config.mjs";
import { createGeminiSummarizer } from "./gemini.mjs";
import { verifyPublicImages } from "./hosting.mjs";
import { discoverPosts } from "./posts.mjs";
import { renderCarousel } from "./renderer.mjs";
import { sanitizeError } from "./safety.mjs";
import { buildThreadsCaption } from "./schema.mjs";
import {
  isPublished,
  loadState,
  markFailed,
  markPublished,
  saveState,
} from "./state.mjs";
import { createThreadsClient } from "./threads-client.mjs";

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function safeSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function publicUrl(relativePath) {
  return new URL(
    relativePath.split(path.sep).join("/"),
    `${SITE_ORIGIN}/`,
  ).toString();
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readManifest(manifestPath) {
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

export async function prepareCarouselRun({
  repoRoot,
  window,
  postSelector,
  dryRun = true,
  force = false,
  maxPosts = DEFAULT_MAX_POSTS,
  now = DateTime.now().setZone(DUBAI_ZONE),
  statePath = path.join(repoRoot, "automation/threads-carousel/state.json"),
  artifactRoot = path.join(repoRoot, ".artifacts/threads-carousel"),
  manifestPath = path.join(artifactRoot, "manifest.json"),
  summarize = createGeminiSummarizer(),
  render = renderCarousel,
  discover = discoverPosts,
} = {}) {
  if (!repoRoot || !window) throw new Error("repoRoot and window are required");
  if (!Number.isInteger(maxPosts) || maxPosts < 1) {
    throw new Error("maxPosts must be a positive integer");
  }

  const state = await loadState(statePath);
  const discovered = await discover({ repoRoot, window, postSelector, now });
  const counters = {
    discovered: discovered.length,
    eligible: 0,
    skippedPublished: 0,
    skippedIneligible: 0,
    deferredByLimit: 0,
    rendered: 0,
    published: 0,
    failed: 0,
  };

  const eligible = [];
  const skipped = [];
  for (const post of discovered) {
    if (!post.eligible) {
      counters.skippedIneligible += 1;
      skipped.push({
        title: post.title,
        canonicalUrl: post.canonicalUrl,
        reason: post.ineligibilityReason,
      });
      continue;
    }
    if (isPublished(state, post.canonicalUrl) && !(dryRun && force)) {
      counters.skippedPublished += 1;
      skipped.push({
        title: post.title,
        canonicalUrl: post.canonicalUrl,
        reason: "already published",
      });
      continue;
    }
    eligible.push(post);
  }
  counters.eligible = eligible.length;
  counters.deferredByLimit = Math.max(0, eligible.length - maxPosts);

  const manifest = {
    schemaVersion: 1,
    generatedAt: now.toISO(),
    dryRun,
    force,
    window: {
      name: window.name,
      timezone: window.timezone,
      start: window.startIso,
      end: window.endIso,
    },
    counters,
    skipped,
    posts: [],
  };

  for (const post of eligible.slice(0, maxPosts)) {
    const record = {
      id: post.id,
      title: post.title,
      canonicalUrl: post.canonicalUrl,
      publicationTimestamp: post.publishedAtIso,
      sourceHash: post.sourceHash,
      category: post.category,
      status: "preparing",
    };
    try {
      const structure = await summarize(post);
      const carouselHash = hash(
        JSON.stringify({
          templateVersion: CAROUSEL_TEMPLATE_VERSION,
          sourceHash: post.sourceHash,
          structure,
        }),
      );
      const relativeMediaDirectory = dryRun
        ? path.join("media", safeSlug(post.slug), carouselHash.slice(0, 16))
        : path.join(
            "assets/social/threads",
            safeSlug(post.slug),
            carouselHash.slice(0, 16),
          );
      const outputDirectory = dryRun
        ? path.join(artifactRoot, relativeMediaDirectory)
        : path.join(repoRoot, relativeMediaDirectory);
      const slides = await render({ post, structure, outputDirectory });
      const imageUrls = dryRun
        ? []
        : slides.map((slide) =>
            publicUrl(path.relative(repoRoot, slide.filePath)),
          );
      const structuredPath = path.join(
        artifactRoot,
        "structured",
        `${safeSlug(post.slug)}-${carouselHash.slice(0, 12)}.json`,
      );
      await writeJson(structuredPath, structure);

      Object.assign(record, {
        status: "rendered",
        carouselHash,
        caption: buildThreadsCaption(structure.caption, post.canonicalUrl, {
          category: post.category,
          tags: post.tags,
        }),
        imageUrls,
        imageFiles: slides.map((slide) =>
          path.relative(repoRoot, slide.filePath).split(path.sep).join("/"),
        ),
        structuredFile: path
          .relative(repoRoot, structuredPath)
          .split(path.sep)
          .join("/"),
        altTexts: slides.map(
          (_, index) =>
            `ShadowContext security briefing for ${post.title}, slide ${index + 1} of ${slides.length}`,
        ),
      });
      if (!dryRun) {
        const readyManifestPath = path.join(
          outputDirectory,
          "carousel-manifest.json",
        );
        await writeJson(readyManifestPath, {
          schemaVersion: 1,
          status: "ready",
          generatedAt: now.toISO(),
          id: record.id,
          title: record.title,
          canonicalUrl: record.canonicalUrl,
          publicationTimestamp: record.publicationTimestamp,
          sourceHash: record.sourceHash,
          carouselHash: record.carouselHash,
          category: record.category,
          caption: record.caption,
          imageUrls: record.imageUrls,
          imageFiles: record.imageFiles,
          altTexts: record.altTexts,
        });
        record.readyManifestFile = path
          .relative(repoRoot, readyManifestPath)
          .split(path.sep)
          .join("/");
      }
      counters.rendered += 1;
    } catch (error) {
      record.status = "failed";
      record.error = sanitizeError(error);
      counters.failed += 1;
    }
    manifest.posts.push(record);
  }

  await writeJson(manifestPath, manifest);
  return manifest;
}

export async function publishPreparedRun({
  manifestPath,
  statePath,
  publishingEnabled = process.env.THREADS_PUBLISHING_ENABLED,
  client,
  verifyImages = verifyPublicImages,
  now = DateTime.now().setZone(DUBAI_ZONE),
} = {}) {
  if (publishingEnabled !== "true") {
    throw new Error(
      "Live publishing is disabled; set THREADS_PUBLISHING_ENABLED=true",
    );
  }
  const manifest = await readManifest(manifestPath);
  if (manifest.dryRun) {
    throw new Error("Refusing to publish a dry-run manifest");
  }

  const threadsClient = client ?? createThreadsClient();
  const state = await loadState(statePath);

  for (const record of manifest.posts.filter(
    (candidate) => candidate.status === "rendered",
  )) {
    if (isPublished(state, record.canonicalUrl)) {
      record.status = "skipped";
      record.error = "already published";
      manifest.counters.skippedPublished += 1;
      continue;
    }
    try {
      await verifyImages(record.imageUrls);
      const result = await threadsClient.publishCarousel({
        imageUrls: record.imageUrls,
        altTexts: record.altTexts,
        caption: record.caption,
      });
      const publicationTime = now.toISO();
      markPublished(state, record.canonicalUrl, {
        article_publication_timestamp: record.publicationTimestamp,
        source_hash: record.sourceHash,
        carousel_hash: record.carouselHash,
        image_urls: record.imageUrls,
        child_container_ids: result.childContainerIds,
        carousel_container_id: result.carouselContainerId,
        threads_post_id: result.threadsPostId,
        published_at: publicationTime,
      });
      await saveState(statePath, state);
      record.status = "published";
      record.threadsPostId = result.threadsPostId;
      record.publishedAt = publicationTime;
      manifest.counters.published += 1;
    } catch (error) {
      const message = sanitizeError(error);
      markFailed(state, record.canonicalUrl, {
        article_publication_timestamp: record.publicationTimestamp,
        source_hash: record.sourceHash,
        carousel_hash: record.carouselHash,
        image_urls: record.imageUrls,
        last_error: message,
        failed_at: now.toISO(),
      });
      await saveState(statePath, state);
      record.status = "failed";
      record.error = message;
      manifest.counters.failed += 1;
    }
    await writeJson(manifestPath, manifest);
  }

  await writeJson(manifestPath, manifest);
  return manifest;
}
