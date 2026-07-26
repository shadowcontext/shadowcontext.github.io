#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createInstagramClient } from "./instagram-client.mjs";

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

const manifests = [];
for (const filePath of await walk("assets/social/threads")) {
  const value = JSON.parse(await readFile(filePath, "utf8"));
  if (value.status === "ready") manifests.push(value);
}
manifests.sort((left, right) =>
  String(right.generatedAt).localeCompare(String(left.generatedAt)),
);
const selected = manifests[0];
if (!selected) throw new Error("No carousel manifest is available");

let diagnostic;
try {
  const result = await createInstagramClient().findRecentPost(
    selected.canonicalUrl,
  );
  diagnostic = {
    status: "validated",
    canonical_url: selected.canonicalUrl,
    instagram_account_id: result.account.id,
    instagram_username: result.account.username,
    matching_media: result.media,
    checked_at: new Date().toISOString(),
  };
} catch (error) {
  diagnostic = {
    status: "failed",
    canonical_url: selected.canonicalUrl,
    error: String(error.message).slice(0, 1_000),
    checked_at: new Date().toISOString(),
  };
}
const output = "automation/instagram/last-diagnostic.json";
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(diagnostic, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify({
    status: diagnostic.status,
    matchingMedia: diagnostic.matching_media?.id || null,
  }),
);
