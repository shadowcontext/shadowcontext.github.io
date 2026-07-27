import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { publishReadyCarousels } from "./publisher.mjs";

test("publisher records success and suppresses the same carousel on retry", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "linkedin-publisher-"));
  try {
    const mediaDirectory = path.join(
      repoRoot,
      "assets/social/threads/example/abcdef0123456789",
    );
    await mkdir(mediaDirectory, { recursive: true });
    const imageFiles = [
      "assets/social/threads/example/abcdef0123456789/slide-01.png",
      "assets/social/threads/example/abcdef0123456789/slide-02.png",
    ];
    for (const imageFile of imageFiles) {
      await writeFile(path.join(repoRoot, imageFile), "png");
    }
    const carouselHash = "a".repeat(64);
    await writeFile(
      path.join(mediaDirectory, "carousel-manifest.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        status: "ready",
        title: "Example",
        canonicalUrl: "https://shadowcontext.com/example/",
        generatedAt: "2026-07-28T01:00:00.000+04:00",
        publicationTimestamp: "2026-07-28T00:59:00.000+04:00",
        carouselHash,
        caption: "Example https://shadowcontext.com/example/",
        imageFiles,
        altTexts: ["One", "Two"],
      })}\n`,
    );

    let publications = 0;
    const client = {
      authenticate: async () => "urn:li:person:123",
      publishCarousel: async () => {
        publications += 1;
        return {
          postId: "urn:li:share:999",
          imageUrns: ["urn:li:image:one", "urn:li:image:two"],
          owner: "urn:li:person:123",
        };
      },
    };
    const options = {
      repoRoot,
      now: new Date("2026-07-28T02:00:00.000+04:00"),
      env: { GITHUB_RUN_ID: "42" },
      clientFactory: () => client,
      logger: { log() {}, error() {} },
    };
    await publishReadyCarousels(options);
    await publishReadyCarousels(options);

    assert.equal(publications, 1);
    const state = JSON.parse(
      await readFile(path.join(repoRoot, "automation/linkedin/state.json")),
    );
    assert.equal(state.posts[carouselHash].status, "published");
    assert.equal(
      state.posts[carouselHash].linkedin_post_id,
      "urn:li:share:999",
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
