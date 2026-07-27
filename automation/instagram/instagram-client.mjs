import { setTimeout as delay } from "node:timers/promises";

const READY = new Set(["FINISHED", "PUBLISHED"]);
const FAILED = new Set(["ERROR", "EXPIRED"]);

function safeMessage(value, secrets) {
  let output = String(value || "Unknown Instagram API error");
  for (const secret of secrets.filter(Boolean)) {
    output = output
      .split(secret)
      .join("[REDACTED]")
      .split(encodeURIComponent(secret))
      .join("[REDACTED]");
  }
  return output.slice(0, 1_000);
}

export function createInstagramClient({
  accessToken = process.env.INSTAGRAM_ACCESS_TOKEN,
  graphVersion = process.env.INSTAGRAM_GRAPH_API_VERSION || "v25.0",
  fetchImpl = globalThis.fetch,
  sleep = delay,
  pollAttempts = 15,
} = {}) {
  if (!accessToken) throw new Error("INSTAGRAM_ACCESS_TOKEN is required");
  if (!/^v\d+\.\d+$/.test(graphVersion)) {
    throw new Error("INSTAGRAM_GRAPH_API_VERSION must look like v25.0");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required");
  }

  const secrets = [accessToken];

  async function request(
    origin,
    pathname,
    { method = "GET", params = {}, token = accessToken } = {},
  ) {
    const url = new URL(`${origin}/${graphVersion}${pathname}`);
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
        Authorization: `Bearer ${token}`,
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
      const error = new Error(
        `Instagram API request failed (${response.status}): ${safeMessage(
          message,
          [...secrets, token],
        )}`,
      );
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function discoverAccount() {
    try {
      const account = await request("https://graph.instagram.com", "/me", {
        params: { fields: "id,username,account_type" },
      });
      if (account.id) {
        return {
          apiOrigin: "https://graph.instagram.com",
          id: String(account.id),
          username: account.username ? String(account.username) : null,
          accountType: account.account_type
            ? String(account.account_type)
            : null,
          token: accessToken,
          tokenType: "instagram_login",
        };
      }
    } catch (error) {
      if (![400, 401, 403].includes(error.status)) throw error;
    }

    const pages = await request("https://graph.facebook.com", "/me/accounts", {
      params: {
        fields: "name,access_token,instagram_business_account{id,username}",
      },
    });
    const linked = (pages.data || []).find(
      (page) => page.instagram_business_account?.id && page.access_token,
    );
    if (!linked) {
      throw new Error(
        "The token did not resolve to an Instagram professional account",
      );
    }
    secrets.push(linked.access_token);
    return {
      apiOrigin: "https://graph.facebook.com",
      id: String(linked.instagram_business_account.id),
      username: linked.instagram_business_account.username
        ? String(linked.instagram_business_account.username)
        : null,
      accountType: null,
      token: String(linked.access_token),
      tokenType: "facebook_login",
    };
  }

  async function pollContainer(account, containerId) {
    for (let attempt = 1; attempt <= pollAttempts; attempt += 1) {
      const status = await request(
        account.apiOrigin,
        `/${encodeURIComponent(containerId)}`,
        {
          params: { fields: "status_code,status" },
          token: account.token,
        },
      );
      const code = String(status.status_code || "").toUpperCase();
      if (READY.has(code)) return;
      if (FAILED.has(code)) {
        throw new Error(
          `Instagram media processing failed (${code}): ${safeMessage(
            status.status,
            secrets,
          )}`,
        );
      }
      await sleep(Math.min(attempt * 2_000, 10_000));
    }
    throw new Error("Instagram media container did not become ready");
  }

  async function findRecentPost(account, marker) {
    const payload = await request(
      account.apiOrigin,
      `/${encodeURIComponent(account.id)}/media`,
      {
        params: {
          fields: "id,permalink,caption,timestamp,media_type",
          limit: "25",
        },
        token: account.token,
      },
    );
    return (payload.data || []).find((media) =>
      String(media.caption || "").includes(marker),
    );
  }

  async function publishPicture({ imageUrl, caption, marker }) {
    if (!String(imageUrl).startsWith("https://")) {
      throw new Error("The Instagram image must use a public HTTPS URL");
    }
    if (!caption || [...caption].length > 2_200) {
      throw new Error(
        "Instagram caption is missing or exceeds 2200 characters",
      );
    }
    const account = await discoverAccount();
    const existing = marker ? await findRecentPost(account, marker) : undefined;
    if (existing) {
      return {
        account,
        mediaId: String(existing.id),
        permalink: existing.permalink ? String(existing.permalink) : null,
        alreadyPublished: true,
      };
    }

    const container = await request(
      account.apiOrigin,
      `/${encodeURIComponent(account.id)}/media`,
      {
        method: "POST",
        params: { image_url: imageUrl, caption },
        token: account.token,
      },
    );
    if (!container.id) {
      throw new Error("Instagram API did not return a media container ID");
    }
    await pollContainer(account, String(container.id));

    const published = await request(
      account.apiOrigin,
      `/${encodeURIComponent(account.id)}/media_publish`,
      {
        method: "POST",
        params: { creation_id: String(container.id) },
        token: account.token,
      },
    );
    if (!published.id) {
      throw new Error("Instagram API did not return a published media ID");
    }
    const media = await request(
      account.apiOrigin,
      `/${encodeURIComponent(published.id)}`,
      {
        params: { fields: "id,permalink,media_type,timestamp" },
        token: account.token,
      },
    );
    if (!media.permalink) {
      throw new Error(
        "Instagram published the media but returned no permalink",
      );
    }
    return {
      account,
      containerId: String(container.id),
      mediaId: String(published.id),
      permalink: String(media.permalink),
      alreadyPublished: false,
    };
  }

  return { discoverAccount, publishPicture };
}
