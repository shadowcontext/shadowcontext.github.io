import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDigestHtml, renderDigest } from "./renderer.mjs";

const posts = [
  {
    title: "First <Defensive> Briefing",
    canonicalUrl: "https://shadowcontext.com/first/",
  },
  {
    title: "Second Supply Chain Briefing",
    canonicalUrl: "https://shadowcontext.com/second/",
  },
];

const content = {
  digest_title: "Daily Security Signals",
  dek: "Two developments shape practical verification priorities.",
  overview: "Today’s reporting connects controls, visibility, and evidence.",
  stories: posts.map((_, index) => ({
    source_id: `S0${index + 1}`,
    headline: `Source ${index + 1} Needs Verification`,
    summary: "The source changes a defensive control boundary.",
    why_it_matters: "Production evidence is necessary before risk is reduced.",
    topic: "Defense",
  })),
  operating_view: "Turn each development into an owned production task.",
  watch_items: [
    "Map affected systems and owners.",
    "Verify changes at the production boundary.",
    "Retain evidence that exposure decreased.",
  ],
};

test("HTML template includes every story, source, and site link", async () => {
  const html = await buildDigestHtml({
    digestDate: "2026-07-29",
    posts,
    content,
  });
  assert.match(html, /All news from the day/);
  assert.match(html, /Source 1 Needs Verification/);
  assert.match(html, /Source 2 Needs Verification/);
  assert.match(html, /https:\/\/shadowcontext\.com\/first\//);
  assert.match(html, /https:\/\/shadowcontext\.com\/second\//);
  assert.match(html, /https:\/\/shadowcontext\.com\//);
  assert.doesNotMatch(html, /First <Defensive>/);
  assert.match(html, /First &lt;Defensive&gt; Briefing/);
  assert.doesNotMatch(html, /\{\{[A-Z0-9_]+\}\}/);
});

test("renderer writes HTML before invoking the non-AI PDF renderer", async () => {
  const outputDirectory = await mkdtemp(
    path.join(os.tmpdir(), "digest-renderer-"),
  );
  try {
    const result = await renderDigest({
      digestDate: "2026-07-29",
      posts,
      content,
      outputDirectory,
      pdfRenderer: async ({ htmlPath, pdfPath }) => {
        assert.match(await readFile(htmlPath, "utf8"), /Daily Security Signals/);
        await writeFile(pdfPath, "%PDF-1.4 fixture", "utf8");
      },
    });
    assert.equal(result.html.filename, "daily-digest.html");
    assert.equal(result.pdf.filename, "daily-digest.pdf");
    assert.match(await readFile(result.pdf.filePath, "utf8"), /^%PDF/);
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});
