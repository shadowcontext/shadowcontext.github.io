import assert from "node:assert/strict";
import test from "node:test";

import { createGeminiSummarizer } from "./gemini.mjs";
import { sanitizeError } from "./safety.mjs";
import { buildThreadsCaption, validateCarouselContent } from "./schema.mjs";

const validStructure = {
  headline: "Defenders Verify Critical Assets",
  summary: ["Teams received grounded guidance"],
  why_it_matters: ["Asset evidence supports reliable prioritization"],
  defender_actions: ["Verify inventory before applying updates"],
  caption: "New guidance helps defenders validate their controls.",
  visual_theme: {
    concept: "Layered defensive boundaries",
    keywords: ["defense", "verification"],
  },
};

test("structured content enforces word limits and rejects unsupported identifiers", () => {
  assert.throws(
    () =>
      validateCarouselContent(
        {
          ...validStructure,
          headline: "one two three four five six seven eight nine ten eleven",
        },
        "source",
      ),
    /exceeds 10 words/,
  );
  assert.throws(
    () =>
      validateCarouselContent(
        { ...validStructure, summary: ["CVE-2026-99999 requires action"] },
        "No vulnerability identifier appears here.",
      ),
    /not present in the source article/,
  );
});

test("invalid Gemini JSON is retried only within the configured limit", async () => {
  let calls = 0;
  const summarize = createGeminiSummarizer({
    apiKey: "test-only",
    attempts: 2,
    generate: async () => {
      calls += 1;
      return "{invalid";
    },
  });
  await assert.rejects(
    summarize({
      title: "Fixture",
      category: "defense",
      publishedAtIso: "2026-07-25T00:00:00+04:00",
      excerpt: "Fixture excerpt",
      keyPoints: [],
      fullText: "Fixture source article",
    }),
    /remained invalid after 2 attempts/,
  );
  assert.equal(calls, 2);
});

test("caption contains exactly one canonical URL and stays within Threads limit", () => {
  const url = "https://shadowcontext.com/example/";
  const caption = buildThreadsCaption(
    "A concise defensive briefing. https://untrusted.example/path",
    url,
  );
  assert.equal((caption.match(/https?:\/\//g) || []).length, 1);
  assert.equal(caption.includes(url), true);
  assert.equal([...caption].length <= 500, true);
});

test("error sanitization removes credentials and secret-bearing query values", () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "fixture-secret-value";
  try {
    const safe = sanitizeError(
      "Request https://example.test?key=fixture-secret-value Authorization: Bearer another-token",
    );
    assert.equal(safe.includes("fixture-secret-value"), false);
    assert.equal(safe.includes("another-token"), false);
    assert.match(safe, /\[REDACTED]/);
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
});
