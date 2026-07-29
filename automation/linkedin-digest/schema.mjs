function words(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function cleanText(value, field, maxWords) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) throw new Error(`${field} is required`);
  if (/https?:\/\/|[#*_`<>]/i.test(normalized)) {
    throw new Error(`${field} contains forbidden formatting or a URL`);
  }
  if (words(normalized).length > maxWords) {
    throw new Error(`${field} exceeds ${maxWords} words`);
  }
  return normalized;
}

export const digestResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "digest_title",
    "dek",
    "overview",
    "stories",
    "operating_view",
    "watch_items",
    "caption_intro",
  ],
  properties: {
    digest_title: { type: "string" },
    dek: { type: "string" },
    overview: { type: "string" },
    stories: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "source_id",
          "headline",
          "summary",
          "why_it_matters",
          "topic",
        ],
        properties: {
          source_id: { type: "string" },
          headline: { type: "string" },
          summary: { type: "string" },
          why_it_matters: { type: "string" },
          topic: { type: "string" },
        },
      },
    },
    operating_view: { type: "string" },
    watch_items: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
    caption_intro: { type: "string" },
  },
};

export function validateDigestContent(value, posts) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Gemini response must be a JSON object");
  }
  if (!Array.isArray(value.stories) || value.stories.length !== posts.length) {
    throw new Error(
      `stories must contain exactly ${posts.length} source-grounded items`,
    );
  }
  const expectedIds = posts.map((_, index) =>
    `S${String(index + 1).padStart(2, "0")}`,
  );
  const stories = value.stories.map((story, index) => {
    if (story?.source_id !== expectedIds[index]) {
      throw new Error(
        `stories[${index}].source_id must be ${expectedIds[index]}`,
      );
    }
    return {
      source_id: story.source_id,
      headline: cleanText(story.headline, `stories[${index}].headline`, 10),
      summary: cleanText(story.summary, `stories[${index}].summary`, 24),
      why_it_matters: cleanText(
        story.why_it_matters,
        `stories[${index}].why_it_matters`,
        18,
      ),
      topic: cleanText(story.topic, `stories[${index}].topic`, 3),
    };
  });
  if (!Array.isArray(value.watch_items) || value.watch_items.length !== 3) {
    throw new Error("watch_items must contain exactly three items");
  }
  return {
    digest_title: cleanText(value.digest_title, "digest_title", 10),
    dek: cleanText(value.dek, "dek", 24),
    overview: cleanText(value.overview, "overview", 42),
    stories,
    operating_view: cleanText(value.operating_view, "operating_view", 42),
    watch_items: value.watch_items.map((item, index) =>
      cleanText(item, `watch_items[${index}]`, 16),
    ),
    caption_intro: cleanText(value.caption_intro, "caption_intro", 55),
  };
}
