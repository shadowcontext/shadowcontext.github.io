import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { publishDailyDigest } from "./publisher.mjs";

async function fixture(repoRoot) {
  const digestDate = "2026-07-28";
  const digestHash = "c".repeat(64);
  const relativeDirectory =
    `assets/social/linkedin-digest/${digestDate}/${digestHash.slice(0, 16)}`;
  const directory = path.join(repoRoot, relativeDirectory);
  await mkdir(directory, { recursive: true });
  const htmlFile = `${relativeDirectory}/daily-digest.html`;
  const pdfFile = `${relativeDirectory}/daily-digest.pdf`;
  await writeFile(path.join(repoRoot, htmlFile), "<html>digest</html>");
  await writeFile(
    path.join(repoRoot, pdfFile),
    Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(1_200)]),
  );
  await writeFile(
    path.join(directory, "digest-content.json"),
    JSON.stringify({
      caption_intro: "A source-grounded daily security digest.",
      stories: [{ source_id: "S01" }],
    }),
  );
  await writeFile(
    path.join(directory, "digest-manifest.json"),
    JSON.stringify({
      schemaVersion: 2,
      status: "review",
      linkedinReady: true,
      published: false,
      generatedAt: "2026-07-29T05:00:00.000+04:00",
      digestDate,
      digestHash,
      title: "Daily Security Signals",
      articleCount: 1,
      sourceArticles: [
        {
          title: "First",
          canonicalUrl: "https://shadowcontext.com/first/",
          category: "defense",
        },
      ],
      htmlFile,
      htmlUrl: `https://shadowcontext.com/${htmlFile}`,
      pdfFile,
    }),
  );
  return { digestDate, digestHash };
}

test("publisher records the document post and never republishes the date", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "digest-publisher-"));
  const statePath = path.join(
    repoRoot,
    "automation/linkedin-digest-publisher/state.json",
  );
  try {
    const { digestDate, digestHash } = await fixture(repoRoot);
    let publications = 0;
    const client = {
      authenticate: async () => "urn:li:person:123",
      publishDocument: async ({ digest }) => {
        publications += 1;
        assert.match(digest.caption, /Read the full daily briefing/);
        return {
          postId: "urn:li:share:999",
          documentUrn: "urn:li:document:daily",
          owner: "urn:li:person:123",
        };
      },
    };
    const options = {
      repoRoot,
      targetDate: digestDate,
      statePath,
      env: { GITHUB_RUN_ID: "42" },
      clientFactory: () => client,
      logger: { log() {}, error() {} },
    };
    await publishDailyDigest(options);
    await publishDailyDigest(options);
    assert.equal(publications, 1);
    const state = JSON.parse(await readFile(statePath, "utf8"));
    assert.equal(state.posts[digestHash].status, "published");
    assert.equal(
      state.posts[digestHash].linkedin_document_urn,
      "urn:li:document:daily",
    );
    assert.equal(state.posts[digestHash].github_run_id, "42");
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
