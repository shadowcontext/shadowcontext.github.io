import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { DateTime } from "luxon";

import { createFixtureDigestWriter } from "./gemini.mjs";
import {
  buildLinkedInCaption,
  generateDailyDigest,
} from "./orchestrator.mjs";

const posts = [
  {
    title: "Example Defensive Briefing",
    canonicalUrl: "https://shadowcontext.com/example/",
    category: "defense",
    excerpt: "A source-grounded example for defenders.",
    fullText:
      "A source-grounded example with enough defensive detail for digest generation and validation.",
    sourceHash: "a".repeat(64),
    publishedAtIso: "2026-07-29T01:00:00.000+04:00",
    publishedAt: DateTime.fromISO("2026-07-29T01:00:00.000+04:00"),
  },
];

test("caption includes the site and remains review-ready", () => {
  const caption = buildLinkedInCaption({
    caption_intro: "A concise daily security review for working defenders.",
  });
  assert.match(caption, /https:\/\/shadowcontext\.com\//);
  assert.match(caption, /#Cybersecurity/);
  assert.ok([...caption].length < 3000);
});

test("orchestrator writes a review manifest without publishing", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "linkedin-digest-"));
  try {
    const result = await generateDailyDigest({
      repoRoot,
      digestDate: "2026-07-29",
      dryRun: true,
      now: DateTime.fromISO("2026-07-29T03:00:00.000+04:00"),
      selectPosts: async () => posts,
      writeDigest: createFixtureDigestWriter(),
      render: async ({ outputDirectory }) => ({
        html: {
          filename: "daily-digest.html",
          filePath: path.join(outputDirectory, "daily-digest.html"),
        },
        pdf: {
          filename: "daily-digest.pdf",
          filePath: path.join(outputDirectory, "daily-digest.pdf"),
        },
      }),
    });
    const manifest = JSON.parse(
      await readFile(
        path.join(result.outputDirectory, "digest-manifest.json"),
        "utf8",
      ),
    );
    assert.equal(manifest.status, "review");
    assert.equal(manifest.linkedinReady, true);
    assert.equal(manifest.published, false);
    assert.equal(manifest.articleCount, 1);
    assert.equal(manifest.sourceArticles[0].canonicalUrl, posts[0].canonicalUrl);
    assert.match(manifest.htmlFile, /daily-digest\.html$/);
    assert.match(manifest.pdfFile, /daily-digest\.pdf$/);
    assert.equal(manifest.aiUsedForPdfRendering, false);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
