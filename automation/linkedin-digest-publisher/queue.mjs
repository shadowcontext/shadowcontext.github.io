import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { loadState } from "../linkedin/state.mjs";

const DIGEST_ROOT = "assets/social/linkedin-digest";
const PDF_LIMIT_BYTES = 100 * 1024 * 1024;

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
    else if (entry.name === "digest-manifest.json") files.push(entryPath);
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

function validateShadowContextUrl(value, filePath, field) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${filePath}: invalid ${field}`);
  }
  if (url.protocol !== "https:" || url.hostname !== "shadowcontext.com") {
    throw new Error(`${filePath}: ${field} must be hosted by ShadowContext`);
  }
  return url.toString();
}

function normalizeAssetPath(value, repoRoot, filePath, extension) {
  const normalized = String(value || "").replaceAll("\\", "/");
  const absolute = path.resolve(repoRoot, normalized);
  const assetRoot = path.resolve(repoRoot, DIGEST_ROOT);
  if (
    !normalized.startsWith(`${DIGEST_ROOT}/`) ||
    !absolute.startsWith(`${assetRoot}${path.sep}`) ||
    path.extname(absolute).toLowerCase() !== extension
  ) {
    throw new Error(`${filePath}: invalid ${extension} asset path`);
  }
  return { normalized, absolute };
}

export function buildDigestCaption(manifest, content) {
  const digestDateLabel = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${manifest.digestDate}T00:00:00Z`));
  const hashtags = [
    "#Cybersecurity",
    "#ThreatIntelligence",
    "#InfoSec",
    manifest.sourceArticles.some((source) => source.category === "ai-security")
      ? "#AISecurity"
      : "#SecurityOperations",
  ];
  const caption = `${content.caption_intro}

This edition brings together ${manifest.articleCount} ShadowContext briefings from ${digestDateLabel}, with direct source links and operational priorities.

Read the full daily briefing:
${manifest.htmlUrl}

${hashtags.join(" ")}`;
  if ([...caption].length > 3_000) {
    throw new Error("LinkedIn digest caption exceeds 3,000 characters");
  }
  return caption;
}

async function validateManifest(value, filePath, repoRoot) {
  if (
    value?.schemaVersion !== 2 ||
    value.status !== "review" ||
    value.linkedinReady !== true ||
    value.published !== false ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.digestDate || "") ||
    !/^[a-f0-9]{64}$/.test(value.digestHash || "") ||
    !value.title ||
    !Number.isInteger(value.articleCount) ||
    value.articleCount < 1 ||
    !Array.isArray(value.sourceArticles) ||
    value.sourceArticles.length !== value.articleCount
  ) {
    throw new Error(`${filePath}: invalid review-ready digest manifest`);
  }
  const generatedAtMs = validDate(value.generatedAt, filePath, "generatedAt");
  const htmlUrl = validateShadowContextUrl(value.htmlUrl, filePath, "htmlUrl");
  const pdf = normalizeAssetPath(value.pdfFile, repoRoot, filePath, ".pdf");
  const html = normalizeAssetPath(value.htmlFile, repoRoot, filePath, ".html");
  if (new URL(htmlUrl).pathname !== `/${html.normalized}`) {
    throw new Error(`${filePath}: htmlUrl does not match htmlFile`);
  }
  await access(pdf.absolute);
  await access(html.absolute);
  const pdfMetadata = await stat(pdf.absolute);
  if (pdfMetadata.size < 1_000 || pdfMetadata.size > PDF_LIMIT_BYTES) {
    throw new Error(`${filePath}: PDF size is outside LinkedIn limits`);
  }
  const pdfBytes = await readFile(pdf.absolute);
  if (pdfBytes.subarray(0, 5).toString() !== "%PDF-") {
    throw new Error(`${filePath}: PDF signature is invalid`);
  }
  const packageDirectory = path.dirname(filePath);
  const contentPath = path.join(packageDirectory, "digest-content.json");
  const content = JSON.parse(await readFile(contentPath, "utf8"));
  if (!content.caption_intro || content.stories?.length !== value.articleCount) {
    throw new Error(`${filePath}: digest content does not cover every article`);
  }
  return {
    ...value,
    generatedAtMs,
    htmlUrl,
    htmlFile: html.normalized,
    pdfFile: pdf.normalized,
    caption: buildDigestCaption({ ...value, htmlUrl }, content),
    documentTitle: `${value.title} — ${value.digestDate}.pdf`.slice(0, 255),
    manifestFile: filePath,
  };
}

export async function discoverDigests({ repoRoot }) {
  const files = await walk(path.join(repoRoot, DIGEST_ROOT));
  const records = [];
  for (const filePath of files) {
    const value = JSON.parse(await readFile(filePath, "utf8"));
    if (value?.schemaVersion !== 2) continue;
    records.push(await validateManifest(value, filePath, repoRoot));
  }
  return records;
}

function publishedForDate(state, digestDate) {
  return Object.values(state.posts).some(
    (record) =>
      record?.status === "published" && record.digest_date === digestDate,
  );
}

export async function prepareDigest({
  repoRoot,
  targetDate,
  statePath = path.join(
    repoRoot,
    "automation/linkedin-digest-publisher/state.json",
  ),
  discover = discoverDigests,
} = {}) {
  if (!repoRoot) throw new Error("repoRoot is required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate || "")) {
    throw new Error("targetDate must use YYYY-MM-DD");
  }
  const state = await loadState(statePath);
  const candidates = (await discover({ repoRoot }))
    .filter((digest) => digest.digestDate === targetDate)
    .sort((left, right) => right.generatedAtMs - left.generatedAtMs);
  if (!candidates.length) {
    throw new Error(`No review-ready LinkedIn digest found for ${targetDate}`);
  }
  const alreadyPublished = publishedForDate(state, targetDate);
  return {
    state,
    digest: alreadyPublished ? null : candidates[0],
    counters: {
      discoveredForDate: candidates.length,
      alreadyPublished: alreadyPublished ? 1 : 0,
      selected: alreadyPublished ? 0 : 1,
    },
  };
}
