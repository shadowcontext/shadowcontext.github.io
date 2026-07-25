import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { DateTime } from "luxon";
import {
  canonicalPostUrl,
  isBreachRelated,
  parseSiteConfig,
} from "../threads/threads-lib.mjs";
import { DUBAI_ZONE, SITE_ORIGIN } from "./config.mjs";
import { isInWindow } from "./windows.mjs";

export function canonicalizeUrl(value) {
  let url;
  try {
    url = new URL(String(value));
  } catch {
    throw new Error(`Invalid canonical URL: ${value}`);
  }
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error(`Unsupported URL protocol: ${url.protocol}`);
  url.hash = "";
  url.search = "";
  url.hostname = url.hostname.toLowerCase();
  url.protocol = "https:";
  url.pathname = `/${url.pathname.split("/").filter(Boolean).join("/")}/`;
  return url.toString();
}

export function parsePublicationDate(value, filePath = "post") {
  let parsed;
  if (value instanceof Date) {
    parsed = DateTime.fromJSDate(value, { zone: "utc" });
  } else {
    const raw = String(value || "").trim();
    parsed = DateTime.fromFormat(raw, "yyyy-MM-dd HH:mm:ss ZZZ", {
      setZone: true,
    });
    if (!parsed.isValid) parsed = DateTime.fromISO(raw, { setZone: true });
  }
  if (!parsed?.isValid)
    throw new Error(
      `${filePath}: missing or invalid canonical publication date`,
    );
  return parsed.setZone(DUBAI_ZONE);
}

export function stripMarkdown(markdown) {
  return String(markdown || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function postSlug(filePath) {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function validatePost(post) {
  const requiredStrings = ["id", "slug", "title", "canonicalUrl", "fullText"];
  for (const field of requiredStrings) {
    if (typeof post[field] !== "string" || !post[field].trim()) {
      throw new Error(`${post.filePath}: missing required ${field}`);
    }
  }
  if (post.fullText.length < 80)
    throw new Error(`${post.filePath}: article body is too short`);
  return post;
}

export async function parsePostFile({ repoRoot, relativePath, siteConfig }) {
  const absolutePath = path.join(repoRoot, relativePath);
  const source = await readFile(absolutePath, "utf8");
  const parsed = matter(source);
  const data = parsed.data || {};
  const publishedAt = parsePublicationDate(data.date, relativePath);
  const canonicalUrl = canonicalizeUrl(
    canonicalPostUrl({ filePath: relativePath, data, siteConfig }),
  );
  const coverPath =
    typeof data.image === "string" && data.image.startsWith("/")
      ? data.image
      : null;
  if (coverPath) {
    const localCover = path.join(repoRoot, coverPath.replace(/^\//, ""));
    try {
      const coverStat = await stat(localCover);
      if (!coverStat.isFile()) throw new Error("not a file");
    } catch {
      throw new Error(
        `${relativePath}: cover image does not exist: ${coverPath}`,
      );
    }
  }

  const tags = Array.isArray(data.tags)
    ? data.tags.map(String)
    : String(data.tags || "")
        .split(/\s+/)
        .filter(Boolean);
  const category = String(data.category || "security").trim();
  const eligibilityText = [
    data.title,
    data.subtitle,
    data.description,
    category,
    ...tags,
  ]
    .filter(Boolean)
    .join(" ");

  const post = {
    id: canonicalUrl,
    slug: String(data.slug || postSlug(relativePath)),
    filePath: relativePath,
    title: String(data.title || "").trim(),
    canonicalUrl,
    publishedAt,
    publishedAtIso: publishedAt.toISO(),
    category,
    tags,
    excerpt: String(data.description || data.excerpt || "").trim(),
    subtitle: String(data.subtitle || "").trim(),
    keyPoints: Array.isArray(data.key_points)
      ? data.key_points.map(String)
      : [],
    coverPath,
    fullText: stripMarkdown(parsed.content),
    sourceHash: createHash("sha256").update(source).digest("hex"),
    eligible:
      data.draft !== true &&
      data.published !== false &&
      data.social_publish !== false &&
      !isBreachRelated(eligibilityText),
    ineligibilityReason:
      data.draft === true || data.published === false
        ? "draft or unpublished post"
        : data.social_publish === false
          ? "social_publish is false"
          : isBreachRelated(eligibilityText)
            ? "breach-related content is excluded"
            : null,
  };
  return validatePost(post);
}

export async function discoverPosts({
  repoRoot,
  window,
  postSelector,
  now = DateTime.now().setZone(DUBAI_ZONE),
}) {
  const configSource = await readFile(
    path.join(repoRoot, "_config.yml"),
    "utf8",
  );
  const siteConfig = parseSiteConfig(configSource);
  if (!siteConfig.url) siteConfig.url = SITE_ORIGIN;
  const names = (await readdir(path.join(repoRoot, "_posts")))
    .filter((name) => name.endsWith(".md"))
    .sort();
  const posts = [];

  for (const name of names) {
    const relativePath = `_posts/${name}`;
    const post = await parsePostFile({ repoRoot, relativePath, siteConfig });
    const selectorMatch = postSelector
      ? [post.id, post.canonicalUrl, post.slug, post.filePath, name].some(
          (value) => value === postSelector || value.endsWith(postSelector),
        )
      : true;
    if (!selectorMatch) continue;
    if (!postSelector && post.publishedAt.toMillis() > now.toMillis()) continue;
    if (!postSelector && !isInWindow(post.publishedAt, window)) continue;
    posts.push(post);
  }

  if (postSelector && posts.length === 0) {
    throw new Error(`No repository post matched "${postSelector}"`);
  }
  return posts.sort(
    (left, right) => left.publishedAt.toMillis() - right.publishedAt.toMillis(),
  );
}
