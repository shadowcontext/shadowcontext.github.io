import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { prepareQueue } from "./queue.mjs";

function record({
  hash,
  generatedAt,
  publicationTimestamp = generatedAt,
  title = hash,
}) {
  return {
    title,
    carouselHash: hash.repeat(64).slice(0, 64),
    generatedAt,
    publicationTimestamp,
    generatedAtMs: Date.parse(generatedAt),
    publicationTimestampMs: Date.parse(publicationTimestamp),
  };
}

test("queue ignores the imported backlog and selects new ready posts oldest first", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "linkedin-queue-"));
  const statePath = path.join(directory, "state.json");
  try {
    const publishedHash = "c".repeat(64);
    await writeFile(
      statePath,
      `${JSON.stringify({
        version: 1,
        ignoreBeforeGeneratedAt: "2026-07-27T20:13:08.228+04:00",
        posts: { [publishedHash]: { status: "published" } },
      })}\n`,
    );
    const manifests = [
      record({
        hash: "a",
        generatedAt: "2026-07-27T19:13:08.228+04:00",
      }),
      record({
        hash: "c",
        generatedAt: "2026-07-27T20:13:08.228+04:00",
      }),
      record({
        hash: "e",
        generatedAt: "2026-07-27T22:00:00.000+04:00",
        publicationTimestamp: "2026-07-27T23:00:00.000+04:00",
      }),
      record({
        hash: "d",
        generatedAt: "2026-07-27T21:30:00.000+04:00",
      }),
      record({
        hash: "b",
        generatedAt: "2026-07-27T21:00:00.000+04:00",
      }),
    ];
    const queue = await prepareQueue({
      repoRoot: directory,
      statePath,
      now: "2026-07-27T22:30:00.000+04:00",
      discover: async () => manifests,
    });

    assert.deepEqual(
      queue.posts.map((post) => post.title),
      ["b", "d"],
    );
    assert.deepEqual(queue.counters, {
      discovered: 5,
      ready: 2,
      selected: 2,
      skippedHistorical: 1,
      skippedPublished: 1,
      skippedFuture: 1,
      deferredByLimit: 0,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("queue enforces the per-run publication limit", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "linkedin-limit-"));
  try {
    const manifests = ["a", "b", "c"].map((hash, index) =>
      record({
        hash,
        generatedAt: `2026-07-28T0${index}:00:00.000+04:00`,
      }),
    );
    const queue = await prepareQueue({
      repoRoot: directory,
      maxPosts: 2,
      now: "2026-07-28T04:00:00.000+04:00",
      discover: async () => manifests,
    });
    assert.equal(queue.posts.length, 2);
    assert.equal(queue.counters.deferredByLimit, 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
