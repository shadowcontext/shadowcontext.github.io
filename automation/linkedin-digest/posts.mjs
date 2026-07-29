import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { DateTime } from "luxon";

import { parseSiteConfig } from "../threads/threads-lib.mjs";
import { parsePostFile } from "../threads-carousel/posts.mjs";
import { DUBAI_ZONE, MAX_ARTICLES, SITE_ORIGIN } from "./config.mjs";

export function validateDigestDate(value) {
  const parsed = DateTime.fromFormat(String(value || ""), "yyyy-MM-dd", {
    zone: DUBAI_ZONE,
  });
  if (!parsed.isValid || parsed.toFormat("yyyy-MM-dd") !== value) {
    throw new Error(`Invalid digest date: ${value}`);
  }
  return parsed;
}

export async function selectDigestPosts({
  repoRoot,
  digestDate,
  now = DateTime.now().setZone(DUBAI_ZONE),
}) {
  validateDigestDate(digestDate);
  const configSource = await readFile(
    path.join(repoRoot, "_config.yml"),
    "utf8",
  );
  const siteConfig = parseSiteConfig(configSource);
  if (!siteConfig.url) siteConfig.url = SITE_ORIGIN;
  const filenames = (await readdir(path.join(repoRoot, "_posts")))
    .filter((name) => name.endsWith(".md"))
    .sort();
  const posts = [];
  for (const filename of filenames) {
    if (!filename.startsWith(`${digestDate}-`)) continue;
    const post = await parsePostFile({
      repoRoot,
      relativePath: `_posts/${filename}`,
      siteConfig,
    });
    if (!post.eligible || post.publishedAt.toMillis() > now.toMillis()) continue;
    if (post.publishedAt.toFormat("yyyy-MM-dd") !== digestDate) continue;
    posts.push(post);
  }
  posts.sort(
    (left, right) => left.publishedAt.toMillis() - right.publishedAt.toMillis(),
  );
  if (!posts.length) {
    throw new Error(`No eligible published posts found for ${digestDate}`);
  }
  if (posts.length > MAX_ARTICLES) {
    throw new Error(
      `${digestDate} has ${posts.length} eligible posts; maximum is ${MAX_ARTICLES}`,
    );
  }
  return posts;
}
