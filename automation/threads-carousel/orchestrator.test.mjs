import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { DateTime } from "luxon";

import { publishPreparedRun } from "./orchestrator.mjs";
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
