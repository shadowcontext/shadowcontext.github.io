import { GoogleGenAI } from "@google/genai";
import { DEFAULT_GEMINI_MODEL, MAX_GEMINI_ATTEMPTS } from "./config.mjs";
import { carouselResponseSchema, validateCarouselContent } from "./schema.mjs";

function requireApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    throw new Error("GEMINI_API_KEY is required for carousel generation");
  return apiKey;
}

function promptFor(post, validationFeedback) {
  return `
You are preparing tightly constrained slide copy for ShadowContext, a defensive cybersecurity publication.

Transform only the supplied article into factual JSON matching the response schema.

Rules:
- Ground every statement in the article. Do not add outside knowledge.
- Do not invent CVEs, versions, actors, victims, dates, attribution, impact, or mitigations.
- Preserve any product name, CVE, or version you use exactly as written in the article.
- Use defensive, calm language. Avoid sensational wording and engagement bait.
- Do not provide exploit steps, payloads, evasion instructions, or offensive guidance.
- No Markdown, URLs, hashtags, bullet characters, or line breaks inside strings.
- headline: at most 10 words.
- summary and why_it_matters: 1-3 items, each at most 16 words.
- defender_actions: 1-3 items, each at most 14 words.
- caption: at most 55 words and do not include the article URL.
- visual_theme describes an abstract, text-free defensive visual.
${validationFeedback ? `Previous output failed validation: ${validationFeedback}\nCorrect every issue.` : ""}

ARTICLE METADATA
Title: ${post.title}
Category: ${post.category}
Published: ${post.publishedAtIso}
Description: ${post.excerpt}
Key points: ${post.keyPoints.join(" | ")}

ARTICLE
${post.fullText}
`.trim();
}

function withTimeout(promise, timeoutMs) {
  let timeout;
  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    new Promise((_, reject) => {
      timeout = setTimeout(
        () =>
          reject(new Error(`Gemini request timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    }),
  ]);
}

function isNonRetryableGeminiError(error) {
  return /RESOURCE_EXHAUSTED|GenerateRequestsPerDay|(?:code|status)["':\s]+(?:400|401|403|429)\b/i.test(
    String(error?.message ?? error),
  );
}

export function createGeminiSummarizer({
  apiKey = requireApiKey(),
  model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
  attempts = MAX_GEMINI_ATTEMPTS,
  timeoutMs = 45_000,
  generate,
} = {}) {
  const client = generate ? null : new GoogleGenAI({ apiKey });
  const generateResponse =
    generate ||
    (async (prompt) => {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 1_200,
          responseMimeType: "application/json",
          responseJsonSchema: carouselResponseSchema,
        },
      });
      return response.text;
    });

  return async function summarize(post) {
    let feedback = "";
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const raw = await withTimeout(
          generateResponse(promptFor(post, feedback)),
          timeoutMs,
        );
        const parsed = JSON.parse(String(raw));
        return validateCarouselContent(parsed, post.fullText);
      } catch (error) {
        lastError = error;
        if (isNonRetryableGeminiError(error)) {
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

function concise(value, maxWords) {
  return String(value || "")
    .replace(/(?:^|\s)#[A-Za-z0-9_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, maxWords)
    .join(" ");
}

export function createFixtureSummarizer() {
  return async (post) => {
    const points = post.keyPoints.length
      ? post.keyPoints
      : [post.excerpt || post.fullText.split(/[.!?]/)[0]];
    const summary = points.slice(0, 2).map((point) => concise(point, 16));
    const actions = [
      `Verify affected assets and ownership`,
      `Apply the source guidance and confirm results`,
    ];
    return validateCarouselContent(
      {
        headline: concise(post.title, 10),
        summary,
        why_it_matters: [concise(post.excerpt || points[0], 16)],
        defender_actions: actions,
        caption: concise(post.excerpt || post.title, 40),
        visual_theme: {
          concept: "Layered defensive boundaries and verified signals",
          keywords: ["defense", "verification"],
        },
      },
      post.fullText,
    );
  };
}
