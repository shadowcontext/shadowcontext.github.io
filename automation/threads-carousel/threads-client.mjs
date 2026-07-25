import { setTimeout as delay } from "node:timers/promises";

import { DEFAULT_THREADS_GRAPH_VERSION } from "./config.mjs";

const TRANSIENT_STATUS_CODES = new Set([
  408, 409, 425, 429, 500, 502, 503, 504,
]);
const READY_STATUSES = new Set(["FINISHED", "PUBLISHED"]);
const FAILED_STATUSES = new Set(["ERROR", "EXPIRED"]);

function assertGraphVersion(version) {
  if (!/^v\d+\.\d+$/.test(version)) {
    throw new Error(`Invalid Threads Graph API version: ${version}`);
  }
}

function redact(value, secrets) {
  let output = String(value ?? "");
  for (const secret of secrets.filter(Boolean)) {
    output = output.split(secret).join("[REDACTED]");
    output = output.split(encodeURIComponent(secret)).join("[REDACTED]");
  }
  return output.slice(0, 1_000);
}

export class ThreadsApiError extends Error {
  constructor(message, { status, retryable = false } = {}) {
    super(message);
    this.name = "ThreadsApiError";
    this.status = status;
    this.retryable = retryable;
  }
}

export function createThreadsClient({
  userId = process.env.THREADS_USER_ID,
  accessToken = process.env.THREADS_ACCESS_TOKEN,
  graphVersion = process.env.THREADS_GRAPH_API_VERSION ||
    DEFAULT_THREADS_GRAPH_VERSION,
  fetchImpl = globalThis.fetch,
  sleep = delay,
  maxAttempts = 4,
  pollAttempts = 15,
} = {}) {
  if (!userId)
    throw new Error("THREADS_USER_ID is required for live publishing");
  if (!accessToken) {
    throw new Error("THREADS_ACCESS_TOKEN is required for live publishing");
  }
  if (typeof fetchImpl !== "function")
    throw new Error("A fetch implementation is required");
  assertGraphVersion(graphVersion);

  const baseUrl = `https://graph.threads.net/${graphVersion}`;
  const secrets = [userId, accessToken];

  async function request(pathname, { method = "GET", body } = {}) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      let response;
      try {
        response = await fetchImpl(`${baseUrl}${pathname}`, {
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...(body
              ? { "Content-Type": "application/x-www-form-urlencoded" }
              : {}),
          },
          body: body ? new URLSearchParams(body) : undefined,
          signal: AbortSignal.timeout(30_000),
        });
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new ThreadsApiError(
            `Threads API network request failed: ${redact(error.message, secrets)}`,
            { retryable: true },
          );
        }
        await sleep(Math.min(1_000 * 2 ** (attempt - 1), 8_000));
        continue;
      }

      const raw = await response.text();
      let payload = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = { error: { message: raw || "Invalid JSON response" } };
      }

      if (response.ok) return payload;

      const retryable = TRANSIENT_STATUS_CODES.has(response.status);
      if (retryable && attempt < maxAttempts) {
        const retryAfter = Number(response.headers?.get?.("retry-after"));
        await sleep(
          Number.isFinite(retryAfter)
            ? retryAfter * 1_000
            : Math.min(1_000 * 2 ** (attempt - 1), 8_000),
        );
        continue;
      }

      const apiMessage =
        payload?.error?.message ??
        payload?.error?.error_user_msg ??
        raw ??
        "Unknown error";
      throw new ThreadsApiError(
        `Threads API request failed (${response.status}): ${redact(apiMessage, secrets)}`,
        { status: response.status, retryable },
      );
    }

    throw new ThreadsApiError("Threads API retry budget exhausted", {
      retryable: true,
    });
  }

  async function pollContainer(containerId) {
    for (let attempt = 1; attempt <= pollAttempts; attempt += 1) {
      const payload = await request(
        `/${encodeURIComponent(containerId)}?fields=id,status,error_message`,
      );
      const status = String(payload.status ?? "").toUpperCase();
      if (READY_STATUSES.has(status)) return payload;
      if (FAILED_STATUSES.has(status)) {
        throw new ThreadsApiError(
          `Threads media processing failed (${status}): ${redact(
            payload.error_message ?? "No details supplied",
            secrets,
          )}`,
        );
      }
      await sleep(Math.min(2_000 * attempt, 10_000));
    }
    throw new ThreadsApiError(
      `Threads media container ${redact(containerId, secrets)} did not become ready`,
      { retryable: true },
    );
  }

  async function publishCarousel({ imageUrls, altTexts, caption }) {
    if (
      !Array.isArray(imageUrls) ||
      imageUrls.length < 2 ||
      imageUrls.length > 20
    ) {
      throw new Error("Threads carousels require between 2 and 20 images");
    }
    if (!caption) throw new Error("A Threads caption is required");

    const childIds = [];
    for (const [index, imageUrl] of imageUrls.entries()) {
      if (!String(imageUrl).startsWith("https://")) {
        throw new Error(`Carousel image ${index + 1} is not an HTTPS URL`);
      }
      const created = await request(`/${encodeURIComponent(userId)}/threads`, {
        method: "POST",
        body: {
          media_type: "IMAGE",
          image_url: imageUrl,
          is_carousel_item: "true",
          ...(altTexts?.[index] ? { alt_text: altTexts[index] } : {}),
        },
      });
      if (!created.id)
        throw new ThreadsApiError(
          "Threads did not return an image container ID",
        );
      await pollContainer(created.id);
      childIds.push(String(created.id));
    }

    const carousel = await request(`/${encodeURIComponent(userId)}/threads`, {
      method: "POST",
      body: {
        media_type: "CAROUSEL",
        children: childIds.join(","),
        text: caption,
      },
    });
    if (!carousel.id) {
      throw new ThreadsApiError(
        "Threads did not return a carousel container ID",
      );
    }
    await pollContainer(carousel.id);

    const published = await request(
      `/${encodeURIComponent(userId)}/threads_publish`,
      {
        method: "POST",
        body: { creation_id: String(carousel.id) },
      },
    );
    if (!published.id) {
      throw new ThreadsApiError("Threads did not return a published post ID");
    }

    return {
      childContainerIds: childIds,
      carouselContainerId: String(carousel.id),
      threadsPostId: String(published.id),
    };
  }

  return { publishCarousel };
}
