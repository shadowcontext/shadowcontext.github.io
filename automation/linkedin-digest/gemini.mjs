import { GoogleGenAI } from "@google/genai";

import {
  DEFAULT_GEMINI_MODEL,
  MAX_GEMINI_ATTEMPTS,
} from "./config.mjs";
import { digestResponseSchema, validateDigestContent } from "./schema.mjs";

function sourcePacket(posts) {
  return posts
    .map(
      (post, index) => `
SOURCE S${String(index + 1).padStart(2, "0")}
Title: ${post.title}
URL: ${post.canonicalUrl}
Category: ${post.category}
Published: ${post.publishedAtIso}
Description: ${post.excerpt}
Article: ${post.fullText}
`.trim(),
    )
    .join("\n\n");
}

function promptFor({ digestDate, posts, validationFeedback }) {
  return `
You are the editorial digest writer for ShadowContext, an independent defensive cybersecurity publication.

Create a professional daily security-news digest using only the supplied ShadowContext articles. Return JSON matching the schema.

Editorial rules:
- Ground every statement in its matching source. Do not add outside knowledge.
- Keep stories in the exact supplied order and preserve each source_id.
- Include exactly one story for every source. Never omit or combine sources, even when several cover related subjects.
- Do not invent CVEs, versions, actors, attribution, impact, or remediation.
- Preserve identifiers and product names exactly when used.
- Use calm, precise, decision-useful language; no fear, hype, or engagement bait.
- Do not include exploit steps, payloads, offensive guidance, hashtags, URLs, Markdown, or bullet characters.
- digest_title: 10 words maximum; it should unite the day's themes.
- dek: 24 words maximum.
- overview and operating_view: 42 words maximum each.
- Each story headline: 10 words maximum.
- Each story summary: 24 words maximum.
- Each why_it_matters: 18 words maximum.
- Each topic: 3 words maximum.
- watch_items: exactly three items, 16 words maximum each.
- caption_intro: 55 words maximum. It will be followed by a deterministic site link and hashtags.
${validationFeedback ? `Previous response failed validation: ${validationFeedback}\nCorrect every issue.` : ""}

DIGEST DATE
${digestDate} (Asia/Dubai)

SOURCES
${sourcePacket(posts)}
`.trim();
}

function withTimeout(promise, timeoutMs) {
  let timeout;
  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    new Promise((_, reject) => {
      timeout = setTimeout(
        () => reject(new Error(`Gemini request timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    }),
  ]);
}

function isNonRetryable(error) {
  return /RESOURCE_EXHAUSTED|GenerateRequestsPerDay|(?:code|status)["':\s]+(?:400|401|403|429)\b/i.test(
    String(error?.message ?? error),
  );
}

export function createGeminiDigestWriter({
  apiKey = process.env.GEMINI_API_KEY,
  model = process.env.LINKEDIN_DIGEST_GEMINI_MODEL ||
    process.env.GEMINI_MODEL ||
    DEFAULT_GEMINI_MODEL,
  attempts = MAX_GEMINI_ATTEMPTS,
  timeoutMs = 90_000,
  client,
} = {}) {
  if (!apiKey && !client) {
    throw new Error("GEMINI_API_KEY is required for digest generation");
  }
  const ai = client || new GoogleGenAI({ apiKey });
  return async ({ digestDate, posts }) => {
    let feedback = "";
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents: promptFor({
              digestDate,
              posts,
              validationFeedback: feedback,
            }),
            config: {
              responseMimeType: "application/json",
              responseJsonSchema: digestResponseSchema,
            },
          }),
          timeoutMs,
        );
        return validateDigestContent(JSON.parse(response.text), posts);
      } catch (error) {
        lastError = error;
        if (isNonRetryable(error)) {
          throw new Error(
            `Gemini request cannot be retried safely: ${error.message}`,
          );
        }
        feedback = String(error.message).slice(0, 500);
      }
    }
    throw new Error(
      `Gemini output remained invalid after ${attempts} attempts: ${lastError.message}`,
    );
  };
}

function clip(value, limit) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, limit)
    .join(" ");
}

export function createFixtureDigestWriter() {
  return async ({ posts }) =>
    validateDigestContent(
      {
        digest_title: "Daily Security Signals",
        dek: "A concise review of the controls and exposures shaping defender priorities.",
        overview:
          "Today’s reporting connects software assurance, ecosystem visibility, and operational verification.",
        stories: posts.map((post, index) => ({
          source_id: `S${String(index + 1).padStart(2, "0")}`,
          headline: clip(post.title, 10),
          summary: clip(post.excerpt || post.fullText, 24),
          why_it_matters: "Defenders need evidence that the relevant control works in production.",
          topic: clip(post.category, 3),
        })),
        operating_view:
          "Treat each update as a verification task spanning inventory, ownership, deployment, and evidence.",
        watch_items: [
          "Confirm affected assets and accountable owners.",
          "Validate fixes at the deployed dependency or service boundary.",
          "Preserve evidence that controls changed the real exposure.",
        ],
        caption_intro:
          "Today’s ShadowContext digest turns the latest security reporting into practical verification priorities for defenders.",
      },
      posts,
    );
}
