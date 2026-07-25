import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { DateTime } from "luxon";

import { prepareCarouselRun, publishPreparedRun } from "./orchestrator.mjs";
import { emptyState, isPublished } from "./state.mjs";

const now = DateTime.fromISO("2026-07-25T12:05:00+04:00", { setZone: true });
const url = "https://shadowcontext.com/fixture/";

function manifest(dryRun = false) {
  return {
    schemaVersion: 1,
    generatedAt: now.toISO(),
    dryRun,
    window: {},
    counters: {
      discovered: 1,
      eligible: 1,
      skippedPublished: 0,
      skippedIneligible: 0,
      deferredByLimit: 0,
      rendered: 1,
      published: 0,
      failed: 0,
    },
    skipped: [],
    posts: [
      {
        title: "Fixture",
        canonicalUrl: url,
        publicationTimestamp: "2026-07-25T01:00:00+04:00",
        sourceHash: "source",
        carouselHash: "carousel",
        imageUrls: [
          "https://shadowcontext.com/a.png",
          "https://shadowcontext.com/b.png",
        ],
        altTexts: ["one", "two"],
        caption: `Fixture\n\nRead the full ShadowContext briefing:\n${url}`,
        status: "rendered",
      },
    ],
  };
}

async function fixtureFiles(value) {
  const root = await mkdtemp(path.join(os.tmpdir(), "threads-state-"));
  const manifestPath = path.join(root, "manifest.json");
  const statePath = path.join(root, "state.json");
  await writeFile(manifestPath, JSON.stringify(value));
  await writeFile(statePath, JSON.stringify(emptyState()));
  return { root, manifestPath, statePath };
}

test("live generation writes a durable ready-carousel manifest beside images", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "threads-generate-"));
  const statePath = path.join(root, "state.json");
  try {
    await writeFile(statePath, JSON.stringify(emptyState()));
    const result = await prepareCarouselRun({
      repoRoot: root,
      statePath,
      artifactRoot: path.join(root, ".artifacts"),
      manifestPath: path.join(root, ".artifacts", "manifest.json"),
      dryRun: false,
      now,
      window: {
        name: "fixture",
        timezone: "Asia/Dubai",
        startIso: "2026-07-25T00:00:00+04:00",
        endIso: "2026-07-25T12:00:00+04:00",
      },
      discover: async () => [
        {
          id: url,
          slug: "fixture",
          title: "Fixture",
          canonicalUrl: url,
          publishedAtIso: "2026-07-25T01:00:00+04:00",
          sourceHash: "source",
          category: "Threat Intelligence",
          tags: ["Cloud Security"],
          eligible: true,
        },
      ],
      summarize: async () => ({
        headline: "Fixture Headline",
        summary: ["Fixture summary"],
        why_it_matters: ["Fixture impact"],
        defender_actions: ["Review relevant controls"],
        caption: "A concise defensive briefing.",
        visual_theme: {
          concept: "Defensive network",
          keywords: ["defense"],
        },
      }),
      render: async ({ outputDirectory }) => {
        await mkdir(outputDirectory, { recursive: true });
        const slides = [];
        for (const name of ["slide-01.png", "slide-02.png"]) {
          const filePath = path.join(outputDirectory, name);
          await writeFile(filePath, "fixture");
          slides.push({ filePath });
        }
        return slides;
      },
    });
    const readyPath = path.join(root, result.posts[0].readyManifestFile);
    const readyManifest = JSON.parse(await readFile(readyPath, "utf8"));
    assert.equal(readyManifest.status, "ready");
    assert.match(readyManifest.caption, /#cybersecurity/);
    assert.equal(readyManifest.imageUrls.length, 2);
  } finally {
    await rm(root, { recursive: true });
  }
});

test("dry-run manifest never invokes Threads publishing", async () => {
  const files = await fixtureFiles(manifest(true));
  let calls = 0;
  try {
    await assert.rejects(
      publishPreparedRun({
        ...files,
        publishingEnabled: "true",
        client: {
          publishCarousel: async () => {
            calls += 1;
          },
        },
      }),
      /dry-run manifest/,
    );
    assert.equal(calls, 0);
  } finally {
    await rm(files.root, { recursive: true });
  }
});

test("successful Threads publication updates persistent state", async () => {
  const files = await fixtureFiles(manifest());
  try {
    await publishPreparedRun({
      ...files,
      publishingEnabled: "true",
      verifyImages: async () => {},
      now,
      client: {
        publishCarousel: async () => ({
          childContainerIds: ["child-1", "child-2"],
          carouselContainerId: "carousel-id",
          threadsPostId: "post-id",
        }),
      },
    });
    const state = JSON.parse(await readFile(files.statePath, "utf8"));
    assert.equal(isPublished(state, url), true);
    assert.equal(state.posts[url].threads_post_id, "post-id");
  } finally {
    await rm(files.root, { recursive: true });
  }
});

test("failed Threads publication never marks a post published", async () => {
  const files = await fixtureFiles(manifest());
  try {
    const result = await publishPreparedRun({
      ...files,
      publishingEnabled: "true",
      verifyImages: async () => {},
      now,
      client: {
        publishCarousel: async () => {
          throw new Error("mock API failure");
        },
      },
    });
    const state = JSON.parse(await readFile(files.statePath, "utf8"));
    assert.equal(isPublished(state, url), false);
    assert.equal(state.posts[url].status, "failed");
    assert.equal(result.counters.failed, 1);
  } finally {
    await rm(files.root, { recursive: true });
  }
});

test("published state suppresses duplicates before invoking Threads", async () => {
  const value = manifest();
  const files = await fixtureFiles(value);
  await writeFile(
    files.statePath,
    JSON.stringify({
      version: 1,
      posts: { [url]: { status: "published", threads_post_id: "existing" } },
    }),
  );
  let calls = 0;
  try {
    const result = await publishPreparedRun({
      ...files,
      publishingEnabled: "true",
      verifyImages: async () => {},
      client: {
        publishCarousel: async () => {
          calls += 1;
        },
      },
    });
    assert.equal(calls, 0);
    assert.equal(result.posts[0].status, "skipped");
  } finally {
    await rm(files.root, { recursive: true });
  }
});
