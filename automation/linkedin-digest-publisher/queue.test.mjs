import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { markPublished, saveState } from "../linkedin/state.mjs";
import { buildDigestCaption, prepareDigest } from "./queue.mjs";

async function writeDigest(repoRoot, {
  digestDate = "2026-07-28",
  digestHash = "a".repeat(64),
  generatedAt = "2026-07-29T05:00:00.000+04:00",
} = {}) {
  const packageName = digestHash.slice(0, 16);
  const relativeDirectory =
    `assets/social/linkedin-digest/${digestDate}/${packageName}`;
  const directory = path.join(repoRoot, relativeDirectory);
  await mkdir(directory, { recursive: true });
  const htmlFile = `${relativeDirectory}/daily-digest.html`;
  const pdfFile = `${relativeDirectory}/daily-digest.pdf`;
  const sourceArticles = [
    {
      title: "First",
      canonicalUrl: "https://shadowcontext.com/first/",
      category: "defense",
    },
    {
      title: "Second",
      canonicalUrl: "https://shadowcontext.com/second/",
      category: "ai-security",
    },
  ];
  const manifest = {
    schemaVersion: 2,
    status: "review",
    linkedinReady: true,
    published: false,
    generatedAt,
    digestDate,
    digestHash,
    title: "Daily Security Signals",
    articleCount: 2,
    sourceArticles,
    htmlFile,
    htmlUrl: `https://shadowcontext.com/${htmlFile}`,
    pdfFile,
  };
  await writeFile(path.join(repoRoot, htmlFile), "<html>digest</html>");
  await writeFile(
    path.join(repoRoot, pdfFile),
    Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(1_200)]),
  );
  await writeFile(
    path.join(directory, "digest-content.json"),
    JSON.stringify({
      caption_intro: "Today’s security digest connects evidence to action.",
      stories: [{ source_id: "S01" }, { source_id: "S02" }],
    }),
  );
  await writeFile(
    path.join(directory, "digest-manifest.json"),
    JSON.stringify(manifest),
  );
  return manifest;
}

test("caption includes description, hashtags, and the briefing page", () => {
  const caption = buildDigestCaption(
    {
      articleCount: 2,
      digestDate: "2026-07-28",
      htmlUrl: "https://shadowcontext.com/daily-briefing/",
      sourceArticles: [{ category: "ai-security" }],
    },
    { caption_intro: "A decision-useful review of the day." },
  );
  assert.match(caption, /2 ShadowContext briefings from July 28, 2026/);
  assert.match(caption, /https:\/\/shadowcontext\.com\/daily-briefing\//);
  assert.match(caption, /#Cybersecurity/);
  assert.match(caption, /#AISecurity/);
});

test("queue selects the newest digest and suppresses the date after publication", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "digest-queue-"));
  const statePath = path.join(
    repoRoot,
    "automation/linkedin-digest-publisher/state.json",
  );
  try {
    await writeDigest(repoRoot, {
      digestHash: "a".repeat(64),
      generatedAt: "2026-07-29T05:00:00.000+04:00",
    });
    const newest = await writeDigest(repoRoot, {
      digestHash: "b".repeat(64),
      generatedAt: "2026-07-29T05:10:00.000+04:00",
    });
    const first = await prepareDigest({
      repoRoot,
      targetDate: "2026-07-28",
      statePath,
    });
    assert.equal(first.digest.digestHash, newest.digestHash);
    assert.equal(first.digest.caption.includes(first.digest.htmlUrl), true);

    markPublished(first.state, newest.digestHash, {
      digest_date: "2026-07-28",
    });
    await saveState(statePath, first.state);
    const retry = await prepareDigest({
      repoRoot,
      targetDate: "2026-07-28",
      statePath,
    });
    assert.equal(retry.digest, null);
    assert.equal(retry.counters.alreadyPublished, 1);
    const persisted = JSON.parse(await readFile(statePath, "utf8"));
    assert.equal(persisted.posts[newest.digestHash].status, "published");
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
