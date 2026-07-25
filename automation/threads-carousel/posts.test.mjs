import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { DateTime } from "luxon";

import {
  canonicalizeUrl,
  discoverPosts,
  parsePublicationDate,
} from "./posts.mjs";
import { calculateDubaiWindow } from "./windows.mjs";

async function fixtureRepository(posts) {
  const root = await mkdtemp(path.join(os.tmpdir(), "threads-posts-"));
  await mkdir(path.join(root, "_posts"));
  await writeFile(
    path.join(root, "_config.yml"),
    "url: https://shadowcontext.com\npermalink: /:title/\n",
  );
  for (const [filename, frontMatter] of Object.entries(posts)) {
    await writeFile(
      path.join(root, "_posts", filename),
      `---\n${frontMatter}\n---\n\n${"Defensive source content with factual operational context. ".repeat(4)}`,
    );
  }
  return root;
}

test("canonical URL normalization removes query and hash and adds one slash", () => {
  assert.equal(
    canonicalizeUrl("http://ShadowContext.com/example?x=1#part"),
    "https://shadowcontext.com/example/",
  );
});

test("post dates retain their canonical instant and convert to Dubai time", () => {
  const parsed = parsePublicationDate("2026-07-25 08:30:00 +0000");
  assert.equal(parsed.toISO(), "2026-07-25T12:30:00.000+04:00");
});

test("post discovery filters flags, future dates, boundaries, and breach coverage", async () => {
  const root = await fixtureRepository({
    "2026-07-25-valid.md":
      'title: "Valid defense story"\ndescription: "Useful defensive context"\ndate: 2026-07-25 00:00:00 +0400\ncategory: defense',
    "2026-07-25-no-social.md":
      'title: "No social"\ndescription: "Useful defensive context"\ndate: 2026-07-25 01:00:00 +0400\nsocial_publish: false',
    "2026-07-25-breach.md":
      'title: "Organization breach report"\ndescription: "Incident detail"\ndate: 2026-07-25 02:00:00 +0400',
    "2026-07-25-noon.md":
      'title: "Noon story"\ndescription: "Useful defensive context"\ndate: 2026-07-25 12:00:00 +0400',
    "2026-07-26-future.md":
      'title: "Future story"\ndescription: "Useful defensive context"\ndate: 2026-07-26 01:00:00 +0400',
  });
  try {
    const now = DateTime.fromISO("2026-07-25T12:05:00+04:00", {
      setZone: true,
    });
    const posts = await discoverPosts({
      repoRoot: root,
      now,
      window: calculateDubaiWindow({
        now,
        requestedWindow: "00-12",
      }),
    });
    assert.deepEqual(
      posts.map((post) => [post.slug, post.eligible]),
      [
        ["valid", true],
        ["no-social", false],
        ["breach", false],
      ],
    );
  } finally {
    await rm(root, { recursive: true });
  }
});
