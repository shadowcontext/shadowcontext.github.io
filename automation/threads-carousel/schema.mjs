import { THREADS_CHARACTER_LIMIT } from "./config.mjs";

export const carouselResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    summary: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: { type: "string" },
    },
    why_it_matters: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: { type: "string" },
    },
    defender_actions: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: { type: "string" },
    },
    caption: { type: "string" },
    visual_theme: {
      type: "object",
      additionalProperties: false,
      properties: {
        concept: { type: "string" },
        keywords: {
          type: "array",
          minItems: 1,
          maxItems: 4,
          items: { type: "string" },
        },
      },
      required: ["concept", "keywords"],
    },
  },
  required: [
    "headline",
    "summary",
    "why_it_matters",
    "defender_actions",
    "caption",
    "visual_theme",
  ],
};

function wordCount(value) {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function validatePlainString(value, label, maxWords) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} must be a non-empty string`);
  const clean = value.trim();
  if (clean.includes("\n"))
    throw new Error(`${label} must not contain line breaks`);
  if (/```|^\s*#{1,6}\s|^\s*[-*+]\s|\[[^\]]+]\([^)]+\)/.test(clean)) {
    throw new Error(`${label} must not contain Markdown`);
  }
  if (wordCount(clean) > maxWords)
    throw new Error(`${label} exceeds ${maxWords} words`);
  return clean;
}

function validateList(value, label, maxWords) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) {
    throw new Error(`${label} must contain 1 to 3 items`);
  }
  return value.map((item, index) =>
    validatePlainString(item, `${label}[${index}]`, maxWords),
  );
}

function generatedIdentifiers(content) {
  return [
    ...(content.match(/\bCVE-\d{4}-\d{4,7}\b/gi) || []),
    ...(content.match(/\bv?\d+\.\d+(?:\.\d+){0,2}\b/g) || []),
  ];
}

function assertGroundedIdentifiers(structure, articleText) {
  const generated = JSON.stringify(structure);
  const source = String(articleText);
  for (const identifier of generatedIdentifiers(generated)) {
    if (!source.toLowerCase().includes(identifier.toLowerCase())) {
      throw new Error(
        `Generated identifier "${identifier}" is not present in the source article`,
      );
    }
  }
}

export function validateCarouselContent(value, articleText = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Gemini response must be a JSON object");
  }
  const result = {
    headline: validatePlainString(value.headline, "headline", 10),
    summary: validateList(value.summary, "summary", 16),
    why_it_matters: validateList(value.why_it_matters, "why_it_matters", 16),
    defender_actions: validateList(
      value.defender_actions,
      "defender_actions",
      14,
    ),
    caption: validatePlainString(value.caption, "caption", 55),
    visual_theme: {
      concept: validatePlainString(
        value.visual_theme?.concept,
        "visual_theme.concept",
        16,
      ),
      keywords: validateList(
        value.visual_theme?.keywords,
        "visual_theme.keywords",
        4,
      ),
    },
  };
  if (/https?:\/\//i.test(result.caption))
    throw new Error("caption must not contain a URL");
  assertGroundedIdentifiers(result, articleText);
  return result;
}

export function buildThreadsCaption(caption, canonicalUrl) {
  const withoutUrls = String(caption)
    .replace(/https?:\/\/\S+/gi, "")
    .trim();
  const finalCaption = `${withoutUrls}\n\nRead the full ShadowContext briefing:\n${canonicalUrl}`;
  const matches = finalCaption.match(/https?:\/\/\S+/g) || [];
  if (matches.length !== 1 || matches[0] !== canonicalUrl) {
    throw new Error(
      "Threads caption must contain exactly one canonical article URL",
    );
  }
  if ([...finalCaption].length > THREADS_CHARACTER_LIMIT) {
    throw new Error(
      `Threads caption exceeds ${THREADS_CHARACTER_LIMIT} characters`,
    );
  }
  return finalCaption;
}
