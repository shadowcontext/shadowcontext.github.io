import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { DateTime } from "luxon";
import sharp from "sharp";

import { buildSlideSvgs, renderCarousel, wrapText } from "./renderer.mjs";

const structure = {
  headline: "Defenders Verify Industrial Update Paths",
  summary: [
    "Vendor guidance maps affected products to supported updates",
    "Local access remains a prerequisite for the reported issue",
  ],
  why_it_matters: [
    "Product variants require precise asset and firmware evidence",
  ],
  defender_actions: [
    "Map models to supported operating system branches",
    "Test interim controls for operational impact",
  ],
  caption: "Defenders should verify update paths.",
  visual_theme: {
    concept: "Industrial network boundaries",
    keywords: ["industrial", "defense"],
  },
};

test("renderer creates RGB PNG slides at exactly 1080 by 1350", async () => {
  const outputDirectory = await mkdtemp(
    path.join(os.tmpdir(), "threads-render-"),
  );
  try {
    const slides = await renderCarousel({
      post: {
        id: "https://shadowcontext.com/fixture/",
        title: "Fixture",
        category: "defense",
        publishedAt: DateTime.fromISO("2026-07-25T05:09:26+04:00", {
          setZone: true,
        }),
      },
      structure,
      outputDirectory,
    });
    assert.equal(slides.length, 4);
    for (const slide of slides) {
      const metadata = await sharp(slide.filePath).metadata();
      assert.deepEqual(
        [metadata.width, metadata.height, metadata.space, metadata.channels],
        [1080, 1350, "srgb", 3],
      );
    }
  } finally {
    await rm(outputDirectory, { recursive: true });
  }
});

test("layout validation rejects text that cannot fit the allotted lines", () => {
  assert.throws(
    () => wrapText("one two three four five six seven eight", 5, 2),
    /exceeds layout capacity/,
  );
});

test("short, simple articles use a compact three-slide structure", () => {
  const slides = buildSlideSvgs(
    {
      id: "https://shadowcontext.com/short/",
      title: "Short",
      category: "defense",
      fullText: "A concise source article.",
      publishedAt: DateTime.fromISO("2026-07-25T05:09:26+04:00", {
        setZone: true,
      }),
    },
    structure,
  );
  assert.equal(slides.length, 3);
  assert.match(slides[2], /WHY IT MATTERS/);
  assert.match(slides[2], /WHAT DEFENDERS SHOULD DO/);
});

test("cover includes a concise description and required action", () => {
  const [cover] = buildSlideSvgs(
    {
      id: "https://shadowcontext.com/cover/",
      title: "Cover",
      category: "defense",
      fullText: "A source article.",
      publishedAt: DateTime.fromISO("2026-07-25T05:09:26+04:00", {
        setZone: true,
      }),
    },
    structure,
  );
  assert.match(cover, /IN BRIEF/);
  assert.match(cover, /ACTION/);
  assert.match(cover, /Vendor guidance maps affected products/);
  assert.match(cover, /Map models to supported operating system branches/);
});
