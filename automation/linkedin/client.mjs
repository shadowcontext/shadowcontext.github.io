import { readFile } from "node:fs/promises";
import path from "node:path";

export const LINKEDIN_API_VERSION = "202607";

function required(value, name) {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`${name} is required`);
  return normalized;
}

async function responseBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 500) };
  }
}

export class LinkedInClient {
  constructor({
    token,
    clientId,
    clientSecret,
    fetchImpl = fetch,
    apiVersion = LINKEDIN_API_VERSION,
  }) {
    this.token = required(token, "LINKEDIN_ACCESS_TOKEN");
    this.clientId = required(clientId, "LINKEDIN_CLIENT_ID");
    this.clientSecret = required(clientSecret, "LINKEDIN_CLIENT_SECRET");
    this.fetch = fetchImpl;
    this.apiVersion = apiVersion;
    this.owner = null;
  }

  get restHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Linkedin-Version": this.apiVersion,
      "X-Restli-Protocol-Version": "2.0.0",
    };
  }

  async request(url, options, label, timeout = 60_000) {
    const response = await this.fetch(url, {
      ...options,
      signal: AbortSignal.timeout(timeout),
    });
    if (!response.ok) {
      const body = await responseBody(response);
      const detail =
        body.message || body.error_description || body.error || "no details";
      throw new Error(`${label} failed (${response.status}): ${detail}`);
    }
    return response;
  }

  async authenticate() {
    const introspection = await this.request(
      "https://www.linkedin.com/oauth/v2/introspectToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: this.token,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      },
      "LinkedIn token introspection",
    );
    const details = await responseBody(introspection);
    if (details.active === false) {
      throw new Error("LINKEDIN_ACCESS_TOKEN is inactive");
    }
    const scopes = String(details.scope || "")
      .split(/[,\s]+/)
      .filter(Boolean);
    if (scopes.length && !scopes.includes("w_member_social")) {
      throw new Error("LINKEDIN_ACCESS_TOKEN does not include w_member_social");
    }

    const userInfo = await this.fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${this.token}` },
      signal: AbortSignal.timeout(30_000),
    });
    if (userInfo.ok) {
      const profile = await responseBody(userInfo);
      if (profile.sub) this.owner = `urn:li:person:${profile.sub}`;
    }
    if (!this.owner) {
      throw new Error(
        "Could not resolve the LinkedIn member ID. Reissue the token with openid/profile alongside w_member_social.",
      );
    }
    return this.owner;
  }

  async uploadImage(filePath) {
    const initialize = await this.request(
      "https://api.linkedin.com/rest/images?action=initializeUpload",
      {
        method: "POST",
        headers: { ...this.restHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          initializeUploadRequest: { owner: this.owner },
        }),
      },
      `Initialize ${path.basename(filePath)}`,
    );
    const value = (await responseBody(initialize)).value;
    if (!value?.uploadUrl || !value.image) {
      throw new Error(
        `LinkedIn returned an incomplete upload for ${path.basename(filePath)}`,
      );
    }

    await this.request(
      value.uploadUrl,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/octet-stream",
        },
        body: await readFile(filePath),
      },
      `Upload ${path.basename(filePath)}`,
    );
    return value.image;
  }

  async uploadDocument(filePath) {
    const initialize = await this.request(
      "https://api.linkedin.com/rest/documents?action=initializeUpload",
      {
        method: "POST",
        headers: { ...this.restHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          initializeUploadRequest: { owner: this.owner },
        }),
      },
      `Initialize ${path.basename(filePath)}`,
    );
    const value = (await responseBody(initialize)).value;
    if (!value?.uploadUrl || !value.document) {
      throw new Error(
        `LinkedIn returned an incomplete document upload for ${path.basename(filePath)}`,
      );
    }

    await this.request(
      value.uploadUrl,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/octet-stream",
        },
        body: await readFile(filePath),
      },
      `Upload ${path.basename(filePath)}`,
      120_000,
    );
    return value.document;
  }

  async publishCarousel({ repoRoot, carousel }) {
    if (!this.owner) await this.authenticate();
    const images = [];
    const imageUrns = [];
    for (let index = 0; index < carousel.imageFiles.length; index += 1) {
      const image = await this.uploadImage(
        path.join(repoRoot, carousel.imageFiles[index]),
      );
      imageUrns.push(image);
      images.push({
        id: image,
        altText: String(carousel.altTexts[index]).slice(0, 4086),
      });
    }

    const response = await this.request(
      "https://api.linkedin.com/rest/posts",
      {
        method: "POST",
        headers: { ...this.restHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          author: this.owner,
          commentary: carousel.caption,
          visibility: "PUBLIC",
          distribution: {
            feedDistribution: "MAIN_FEED",
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          lifecycleState: "PUBLISHED",
          isReshareDisabledByAuthor: false,
          content: { multiImage: { images } },
        }),
      },
      "Create LinkedIn multi-image post",
    );
    const postId = response.headers.get("x-restli-id");
    if (!postId) {
      throw new Error("LinkedIn created the post but returned no post ID");
    }
    return { postId, imageUrns, owner: this.owner };
  }

  async publishDocument({ repoRoot, digest }) {
    if (!this.owner) await this.authenticate();
    const documentUrn = await this.uploadDocument(
      path.join(repoRoot, digest.pdfFile),
    );
    const response = await this.request(
      "https://api.linkedin.com/rest/posts",
      {
        method: "POST",
        headers: { ...this.restHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          author: this.owner,
          commentary: digest.caption,
          visibility: "PUBLIC",
          distribution: {
            feedDistribution: "MAIN_FEED",
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          content: {
            media: {
              title: digest.documentTitle,
              id: documentUrn,
            },
          },
          lifecycleState: "PUBLISHED",
          isReshareDisabledByAuthor: false,
        }),
      },
      "Create LinkedIn document post",
    );
    const postId = response.headers.get("x-restli-id");
    if (!postId) {
      throw new Error("LinkedIn created the document post but returned no post ID");
    }
    return { postId, documentUrn, owner: this.owner };
  }
}
