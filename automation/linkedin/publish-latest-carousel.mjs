import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const API_VERSION = "202607";
const REST_HEADERS = {
  "Linkedin-Version": API_VERSION,
  "X-Restli-Protocol-Version": "2.0.0",
};

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
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

async function checkedFetch(url, options, label) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    const body = await responseBody(response);
    const detail = body.message || body.error_description || body.error || "no details";
    throw new Error(`${label} failed (${response.status}): ${detail}`);
  }
  return response;
}

async function findManifests(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findManifests(entryPath)));
    else if (entry.name === "carousel-manifest.json") files.push(entryPath);
  }
  return files;
}

async function latestReadyCarousel(repoRoot) {
  const manifestPaths = await findManifests(
    path.join(repoRoot, "assets/social/threads"),
  );
  const candidates = [];
  for (const manifestPath of manifestPaths) {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const generatedAt = Date.parse(manifest.generatedAt);
    if (
      manifest.status === "ready" &&
      Number.isFinite(generatedAt) &&
      Array.isArray(manifest.imageFiles) &&
      manifest.imageFiles.length >= 2 &&
      manifest.imageFiles.length <= 20 &&
      manifest.imageFiles.length === manifest.altTexts?.length
    ) {
      candidates.push({ manifest, manifestPath, generatedAt });
    }
  }
  candidates.sort((a, b) => b.generatedAt - a.generatedAt);
  if (!candidates.length) throw new Error("No ready carousel manifest was found");
  return candidates[0];
}

async function inspectToken(token, clientId, clientSecret) {
  const body = new URLSearchParams({
    token,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const response = await checkedFetch(
    "https://www.linkedin.com/oauth/v2/introspectToken",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
    "LinkedIn token introspection",
  );
  const details = await responseBody(response);
  if (details.active === false) throw new Error("LINKEDIN_ACCESS_TOKEN is inactive");
  const scopes = String(details.scope || "")
    .split(/[,\s]+/)
    .filter(Boolean);
  if (scopes.length && !scopes.includes("w_member_social")) {
    throw new Error("LINKEDIN_ACCESS_TOKEN does not include w_member_social");
  }
}

async function resolvePersonUrn(token) {
  const authorization = { Authorization: `Bearer ${token}` };

  const userInfo = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: authorization,
    signal: AbortSignal.timeout(30_000),
  });
  if (userInfo.ok) {
    const profile = await responseBody(userInfo);
    if (profile.sub) return `urn:li:person:${profile.sub}`;
  }

  const me = await fetch("https://api.linkedin.com/v2/me", {
    headers: { ...authorization, "X-Restli-Protocol-Version": "2.0.0" },
    signal: AbortSignal.timeout(30_000),
  });
  if (me.ok) {
    const profile = await responseBody(me);
    if (profile.id) return `urn:li:person:${profile.id}`;
  }

  throw new Error(
    "Could not resolve the LinkedIn member ID. Reissue the token with openid/profile alongside w_member_social.",
  );
}

async function uploadImage({ token, owner, filePath }) {
  const authorization = `Bearer ${token}`;
  const initialize = await checkedFetch(
    "https://api.linkedin.com/rest/images?action=initializeUpload",
    {
      method: "POST",
      headers: {
        ...REST_HEADERS,
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ initializeUploadRequest: { owner } }),
    },
    `Initialize ${path.basename(filePath)}`,
  );
  const initialized = await responseBody(initialize);
  const uploadUrl = initialized.value?.uploadUrl;
  const image = initialized.value?.image;
  if (!uploadUrl || !image) {
    throw new Error(`LinkedIn returned an incomplete upload for ${path.basename(filePath)}`);
  }

  await checkedFetch(
    uploadUrl,
    {
      method: "PUT",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/octet-stream",
      },
      body: await readFile(filePath),
    },
    `Upload ${path.basename(filePath)}`,
  );
  return image;
}

async function main() {
  const repoRoot = process.cwd();
  const { manifest, manifestPath } = await latestReadyCarousel(repoRoot);
  console.log(`Selected: ${manifest.title}`);
  console.log(`Manifest: ${path.relative(repoRoot, manifestPath)}`);
  console.log(`Images: ${manifest.imageFiles.length}`);

  if (process.argv.includes("--dry-run")) return;

  const token = requiredEnv("LINKEDIN_ACCESS_TOKEN");
  const clientId = requiredEnv("LINKEDIN_CLIENT_ID");
  const clientSecret = requiredEnv("LINKEDIN_CLIENT_SECRET");
  await inspectToken(token, clientId, clientSecret);
  const owner = await resolvePersonUrn(token);

  const images = [];
  for (let index = 0; index < manifest.imageFiles.length; index += 1) {
    const image = await uploadImage({
      token,
      owner,
      filePath: path.join(repoRoot, manifest.imageFiles[index]),
    });
    images.push({ id: image, altText: manifest.altTexts[index].slice(0, 4086) });
    console.log(`Uploaded image ${index + 1}/${manifest.imageFiles.length}`);
  }

  const response = await checkedFetch(
    "https://api.linkedin.com/rest/posts",
    {
      method: "POST",
      headers: {
        ...REST_HEADERS,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        author: owner,
        commentary: manifest.caption,
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
  if (!postId) throw new Error("LinkedIn created the post but returned no post ID");
  console.log(`Published LinkedIn post: ${postId}`);
}

main().catch((error) => {
  const message = `LinkedIn publication failed: ${error.message}`;
  console.error(message);
  if (process.env.GITHUB_ACTIONS === "true") {
    console.error(`::error title=LinkedIn publication failed::${message}`);
  }
  process.exitCode = 1;
});
