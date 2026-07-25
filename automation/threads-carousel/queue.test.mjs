import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { emptyState } from "./state.mjs";
import { discoverReadyCarousels, preparePublishQueue } from "./queue.mjs";

const url = "https://shadowcontext.com/example/";

function ready(generatedAt, hash = "new") {
  return {
    schemaVersion: 1,
    status: "ready",
    generatedAt,
    title: "Example",
    canonicalUrl: url,
    publicationTimestamp: "2026-07-25T08:00:00.000+04:00",
    sourceHash: "source",
    carouselHash: hash,
    caption: `Briefing\n\n#cybersecurity\n\nRead the full ShadowContext briefing:\n${url}`,
    imageUrls: [
      "https://shadowcontext.com/assets/a.png",
      "https://shadowcontext.com/assets/b.png",
    ],
    imageFiles: ["assets/a.png", "assets/b.png"],
    altTexts: ["one", "two"],
  };
}

async function fixtureState(state = emptyState()) {
  const root = await mkdtemp(path.join(os.tmpdir(), "threads-queue-"));
  const statePath = path.join(root, "state.json");
  await writeFile(statePath, JSON.stringify(state));
  return { root, statePath };
}

test("queue selects only the newest ready carousel per canonical URL", async () => {
  const files = await fixtureState();
  try {
    const result = await preparePublishQueue({
      repoRoot: files.root,
      statePath: files.statePath,
      discover: async () => [
        ready("2026-07-25T09:00:00+04:00", "old"),
        ready("2026-07-25T10:00:00+04:00", "new"),
      ],
    });
    assert.equal(result.posts.length, 1);
    assert.equal(result.posts[0].carouselHash, "new");
  } finally {
    await rm(files.root, { recursive: true });
  }
});

test("published state suppresses a queued carousel", async () => {
  const files = await fixtureState({
    version: 1,
    posts: { [url]: { status: "published", threads_post_id: "existing" } },
  });
  try {
    const result = await preparePublishQueue({
      repoRoot: files.root,
      statePath: files.statePath,
      discover: async () => [ready("2026-07-25T10:00:00+04:00")],
    });
    assert.equal(result.posts.length, 0);
    assert.equal(result.counters.skippedPublished, 1);
  } finally {
    await rm(files.root, { recursive: true });
  }
});

test("queue applies the maximum-post limit oldest first", async () => {
  const files = await fixtureState();
  try {
    const first = ready("2026-07-25T09:00:00+04:00");
    const second = {
      ...ready("2026-07-25T10:00:00+04:00"),
      canonicalUrl: "https://shadowcontext.com/second/",
    };
    const result = await preparePublishQueue({
      repoRoot: files.root,
      statePath: files.statePath,
      maxPosts: 1,
      discover: async () => [second, first],
    });
    assert.equal(result.posts[0].canonicalUrl, url);
    assert.equal(result.counters.deferredByLimit, 1);
  } finally {
    await rm(files.root, { recursive: true });
  }
});

test("queue retains future-dated generated media without publishing it", async () => {
  const files = await fixtureState();
  try {
    const result = await preparePublishQueue({
      repoRoot: files.root,
      statePath: files.statePath,
      now: "2026-07-25T12:00:00+04:00",
      discover: async () => [
        {
          ...ready("2026-07-25T10:00:00+04:00"),
          publicationTimestamp: "2026-07-26T08:00:00+04:00",
        },
      ],
    });
    assert.equal(result.posts.length, 0);
    assert.equal(result.counters.skippedIneligible, 1);
  } finally {
    await rm(files.root, { recursive: true });
  }
});

test("repository queue rejects a manifest without the mandatory hashtag", async () => {
  const files = await fixtureState();
  try {
    const directory = path.join(
      files.root,
      "assets/social/threads/example/hash",
    );
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, "carousel-manifest.json"),
      JSON.stringify({
        ...ready("2026-07-25T10:00:00+04:00"),
        caption: `Briefing\n\nhttps://shadowcontext.com/example/`,
        imageFiles: [
          "assets/social/threads/example/hash/slide-01.png",
          "assets/social/threads/example/hash/slide-02.png",
        ],
        imageUrls: [
          "https://shadowcontext.com/assets/social/threads/example/hash/slide-01.png",
          "https://shadowcontext.com/assets/social/threads/example/hash/slide-02.png",
        ],
      }),
    );
    await assert.rejects(
      discoverReadyCarousels({ repoRoot: files.root }),
      /invalid Threads caption/,
    );
  } finally {
    await rm(files.root, { recursive: true });
  }
});
