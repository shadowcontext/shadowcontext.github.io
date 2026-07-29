import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { DateTime } from "luxon";

import {
  DEFAULT_GEMINI_MODEL,
  DUBAI_ZONE,
  SITE_ORIGIN,
  TEMPLATE_VERSION,
} from "./config.mjs";
import { createGeminiDigestWriter } from "./gemini.mjs";
import { selectDigestPosts } from "./posts.mjs";
import { renderDigest } from "./renderer.mjs";

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function buildLinkedInCaption(content) {
  const caption = `${content.caption_intro}

Read the full ShadowContext briefings:
${SITE_ORIGIN}/

#Cybersecurity #CyberNews #InfoSec #AISecurity`;
  if ([...caption].length > 3000) {
    throw new Error("LinkedIn caption exceeds 3,000 characters");
  }
  return caption;
}

export async function generateDailyDigest({
  repoRoot,
  digestDate,
  dryRun = false,
  now = DateTime.now().setZone(DUBAI_ZONE),
  model = process.env.LINKEDIN_DIGEST_GEMINI_MODEL ||
    process.env.GEMINI_MODEL ||
    DEFAULT_GEMINI_MODEL,
  writeDigest = createGeminiDigestWriter({ model }),
  selectPosts = selectDigestPosts,
  render = renderDigest,
} = {}) {
  if (!repoRoot) throw new Error("repoRoot is required");
  const posts = await selectPosts({ repoRoot, digestDate, now });
  const content = await writeDigest({ digestDate, posts });
  const sourceFingerprint = posts
    .map((post) => `${post.canonicalUrl}:${post.sourceHash}`)
    .join("\n");
  const digestHash = hash(
    JSON.stringify({
      template: TEMPLATE_VERSION,
      digestDate,
      sourceFingerprint,
      content,
    }),
  );
  const relativeDirectory = dryRun
    ? path.join(".artifacts/linkedin-digest", digestDate, digestHash.slice(0, 16))
    : path.join(
        "assets/social/linkedin-digest",
        digestDate,
        digestHash.slice(0, 16),
      );
  const outputDirectory = path.join(repoRoot, relativeDirectory);
  await mkdir(outputDirectory, { recursive: true });
  const slides = await render({
    digestDate,
    posts,
    content,
    outputDirectory,
  });
  const caption = buildLinkedInCaption(content);
  const imageFiles = slides.map((slide) =>
    path.join(relativeDirectory, slide.filename).replaceAll("\\", "/"),
  );
  const altTexts = slides.map(
    (_, index) =>
      `ShadowContext daily security digest for ${digestDate}, slide ${index + 1} of ${slides.length}`,
  );
  const manifest = {
    schemaVersion: 1,
    status: "review",
    linkedinReady: true,
    published: false,
    generatedAt: now.toISO(),
    digestDate,
    digestHash,
    templateVersion: TEMPLATE_VERSION,
    model,
    title: content.digest_title,
    articleCount: posts.length,
    sourceArticles: posts.map((post) => ({
      title: post.title,
      canonicalUrl: post.canonicalUrl,
      publishedAt: post.publishedAtIso,
      category: post.category,
      sourceHash: post.sourceHash,
    })),
    caption,
    imageFiles,
    imageUrls: imageFiles.map(
      (file) => new URL(file, `${SITE_ORIGIN}/`).toString(),
    ),
    altTexts,
  };
  await writeFile(
    path.join(outputDirectory, "digest-content.json"),
    `${JSON.stringify(content, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(outputDirectory, "linkedin-caption.txt"),
    `${caption}\n`,
    "utf8",
  );
  await writeFile(
    path.join(outputDirectory, "digest-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  return { manifest, outputDirectory, relativeDirectory };
}
