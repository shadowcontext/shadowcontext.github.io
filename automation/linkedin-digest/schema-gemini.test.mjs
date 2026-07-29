import assert from "node:assert/strict";
import test from "node:test";

import { createGeminiDigestWriter } from "./gemini.mjs";
import { validateDigestContent } from "./schema.mjs";

function posts() {
  return [
    {
      title: "First source",
      canonicalUrl: "https://shadowcontext.com/first/",
      category: "defense",
      publishedAtIso: "2026-07-29T01:00:00.000+04:00",
      excerpt: "First source description",
      fullText: "First source body with defensive context.",
    },
    {
      title: "Second source",
      canonicalUrl: "https://shadowcontext.com/second/",
      category: "ai-security",
      publishedAtIso: "2026-07-29T02:00:00.000+04:00",
      excerpt: "Second source description",
      fullText: "Second source body with operational context.",
    },
  ];
}

function validResponse() {
  return {
    digest_title: "Daily Security Signals",
    dek: "Two developments shape practical verification priorities.",
    overview: "Software assurance and ecosystem visibility define today’s defensive work.",
    stories: [
      {
        source_id: "S01",
        headline: "First Source Needs Verification",
        summary: "The first source changes a defensive control boundary.",
        why_it_matters: "Production evidence is necessary before risk is considered reduced.",
        topic: "Defense",
      },
      {
        source_id: "S02",
        headline: "Second Source Expands Visibility",
        summary: "The second source broadens the available operational signal.",
        why_it_matters: "Coverage must reach the systems defenders actually operate.",
        topic: "AI Security",
      },
    ],
    operating_view: "Treat both developments as evidence tasks tied to deployed systems.",
    watch_items: [
      "Map the affected systems and accountable owners.",
      "Verify the change at the production boundary.",
      "Retain evidence that exposure actually decreased.",
    ],
    caption_intro: "Today’s digest connects two security developments to practical verification work.",
  };
}

test("digest validation enforces exact source order", () => {
  const value = validResponse();
  value.stories.reverse();
  assert.throws(
    () => validateDigestContent(value, posts()),
    /source_id must be S01/,
  );
});

test("Gemini writer retries invalid structured output", async () => {
  const responses = [
    { text: JSON.stringify({ invalid: true }) },
    { text: JSON.stringify(validResponse()) },
  ];
  const prompts = [];
  const writer = createGeminiDigestWriter({
    client: {
      models: {
        generateContent: async (request) => {
          prompts.push(request.contents);
          return responses.shift();
        },
      },
    },
    attempts: 2,
    timeoutMs: 1_000,
  });
  const result = await writer({
    digestDate: "2026-07-29",
    posts: posts(),
  });
  assert.equal(result.stories.length, 2);
  assert.equal(prompts.length, 2);
  assert.match(prompts[1], /Previous response failed validation/);
});
