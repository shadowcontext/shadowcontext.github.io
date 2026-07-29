import assert from "node:assert/strict";
import test from "node:test";

import { buildSlideSvgs, wrapText } from "./renderer.mjs";

test("renderer creates cover, story, and operating-view slides", () => {
  const posts = [
    { canonicalUrl: "https://shadowcontext.com/first/" },
    { canonicalUrl: "https://shadowcontext.com/second/" },
    { canonicalUrl: "https://shadowcontext.com/third/" },
  ];
  const content = {
    digest_title: "Daily Security Signals",
    dek: "Three developments shape practical verification priorities.",
    overview: "Today’s reporting connects controls, visibility, and operational evidence.",
    stories: posts.map((_, index) => ({
      source_id: `S0${index + 1}`,
      headline: `Source ${index + 1} Needs Verification`,
      summary: "The source changes a defensive control boundary.",
      why_it_matters: "Production evidence is necessary before risk is reduced.",
      topic: "Defense",
    })),
    operating_view: "Turn each development into an owned production verification task.",
    watch_items: [
      "Map affected systems and owners.",
      "Verify changes at the production boundary.",
      "Retain evidence that exposure decreased.",
    ],
  };
  const slides = buildSlideSvgs({
    digestDate: "2026-07-29",
    posts,
    content,
  });
  assert.equal(slides.length, 4);
  assert.match(slides[0], /DAILY SECURITY DIGEST/);
  assert.match(slides.at(-1), /Read the full analysis/);
});

test("text wrapping fails instead of overflowing", () => {
  assert.throws(
    () => wrapText("one two three four five six seven", 5, 2),
    /exceeds layout capacity/,
  );
});
