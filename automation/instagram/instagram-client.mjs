import { setTimeout as delay } from "node:timers/promises";

const READY = new Set(["FINISHED", "PUBLISHED"]);
const FAILED = new Set(["ERROR", "EXPIRED"]);

function safeMessage(value, token) {
  return String(value || "Unknown Instagram API error")
    .split(token)
    .join("[REDACTED]")
    .split(encodeURIComponent(token))
    .join("[REDACTED]")
    .slice(0, 1_000);
}

export function createInstagramClient({
  accessToken = process.env.THREADS_ACCESS_TOKEN,
  graphVersion = process.env.INSTAGRAM_GRAPH_API_VERSION || "v22.0",
  fetchImpl = globalThis.fetch,
  sleep = delay,
  pollAttempts = 15,
} = {}) {
  if (!accessToken) throw new Error("THREADS_ACCESS_TOKEN is required");
  if (!/^v\d+\.\d+$/.test(graphVersion)) {
    throw new Error("INSTAGRAM_GRAPH_API_VERSION must look like v22.0");
  }
  const baseUrl = `https://graph.instagram.com/${graphVersion}`;

  async function request(pathname, { method = "GET", params = {} } = {}) {
    const url = new URL(`${baseUrl}${pathname}`);
    let body;
    if (method === "GET") {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    } else {
      body = new URLSearchParams(params);
    }
    const response = await fetchImpl(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body
          ? { "Content-Type": "application/x-www-form-urlencoded" }
          : {}),
      },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    const raw = await response.text();
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = {};
    }
    if (!response.ok) {
      const message =
        payload?.error?.message || payload?.error?.error_user_msg || raw;
      throw new Error(
        `Instagram API request failed (${response.status}): ${safeMessage(message, accessToken)}`,
      );
    }
    return payload;
  }

  async function discoverAccount() {
    const account = await request("/me", {
      params: { fields: "id,username,account_type" },
    });
    if (!account.id) {
      throw new Error("Instagram API did not return a professional account ID");
    }
    return {
      id: String(account.id),
      username: account.username ? String(account.username) : null,
      accountType: account.account_type ? String(account.account_type) : null,
    };
  }

  async function pollContainer(containerId) {
    for (let attempt = 1; attempt <= pollAttempts; attempt += 1) {
      const status = await request(`/${encodeURIComponent(containerId)}`, {
        params: { fields: "status_code,status" },
      });
      const code = String(status.status_code || "").toUpperCase();
      if (READY.has(code)) return;
      if (FAILED.has(code)) {
        throw new Error(
          `Instagram media processing failed (${code}): ${safeMessage(status.status, accessToken)}`,
        );
      }
      await sleep(Math.min(attempt * 2_000, 10_000));
    }
    throw new Error("Instagram media container did not become ready");
  }

  async function publishCarousel({ imageUrls, caption }) {
    if (
      !Array.isArray(imageUrls) ||
      imageUrls.length < 2 ||
      imageUrls.length > 10
    ) {
      throw new Error("Instagram carousels require between 2 and 10 images");
    }
    if (!caption || [...caption].length > 2_200) {
      throw new Error(
        "Instagram caption is missing or exceeds 2200 characters",
      );
    }
    const account = await discoverAccount();
    const children = [];
    for (const imageUrl of imageUrls) {
      if (!String(imageUrl).startsWith("https://")) {
        throw new Error("Instagram carousel images must use HTTPS");
      }
      const child = await request(`/${encodeURIComponent(account.id)}/media`, {
        method: "POST",
        params: {
          image_url: imageUrl,
          is_carousel_item: "true",
        },
      });
      if (!child.id) {
        throw new Error("Instagram API did not return a child container ID");
      }
      await pollContainer(String(child.id));
      children.push(String(child.id));
    }
    const carousel = await request(`/${encodeURIComponent(account.id)}/media`, {
      method: "POST",
      params: {
        media_type: "CAROUSEL",
        children: children.join(","),
        caption,
      },
    });
    if (!carousel.id) {
      throw new Error("Instagram API did not return a carousel container ID");
    }
    await pollContainer(String(carousel.id));
    const published = await request(
      `/${encodeURIComponent(account.id)}/media_publish`,
      {
        method: "POST",
        params: { creation_id: String(carousel.id) },
      },
    );
    if (!published.id) {
      throw new Error("Instagram API did not return a published media ID");
    }
    const media = await request(`/${encodeURIComponent(published.id)}`, {
      params: { fields: "id,permalink" },
    });
    return {
      account,
      childContainerIds: children,
      carouselContainerId: String(carousel.id),
      mediaId: String(published.id),
      permalink: media.permalink ? String(media.permalink) : null,
    };
  }

  async function findRecentPost(canonicalUrl) {
    const account = await discoverAccount();
    const payload = await request(`/${encodeURIComponent(account.id)}/media`, {
      params: {
        fields: "id,permalink,caption,timestamp,media_type",
        limit: "10",
      },
    });
    const match = (payload.data || []).find((media) =>
      String(media.caption || "").includes(canonicalUrl),
    );
    return {
      account,
      media: match
        ? {
            id: String(match.id),
            permalink: match.permalink ? String(match.permalink) : null,
            timestamp: match.timestamp ? String(match.timestamp) : null,
            mediaType: match.media_type ? String(match.media_type) : null,
          }
        : null,
    };
  }

  return { discoverAccount, findRecentPost, publishCarousel };
}
