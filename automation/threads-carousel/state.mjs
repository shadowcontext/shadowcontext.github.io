import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { STATE_VERSION } from "./config.mjs";
import { canonicalizeUrl } from "./posts.mjs";

export function emptyState() {
  return { version: STATE_VERSION, posts: {} };
}

export async function loadState(statePath) {
  try {
    const parsed = JSON.parse(await readFile(statePath, "utf8"));
    if (
      parsed.version !== STATE_VERSION ||
      !parsed.posts ||
      typeof parsed.posts !== "object"
    ) {
      throw new Error("unsupported state shape");
    }
    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") return emptyState();
    throw new Error(
      `Unable to load carousel publication state: ${error.message}`,
    );
  }
}

export async function saveState(statePath, state) {
  await mkdir(path.dirname(statePath), { recursive: true });
  const temporaryPath = `${statePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(temporaryPath, statePath);
}

export function isPublished(state, canonicalUrl) {
  return state.posts[canonicalizeUrl(canonicalUrl)]?.status === "published";
}

export function markPublished(state, canonicalUrl, record) {
  const key = canonicalizeUrl(canonicalUrl);
  state.posts[key] = {
    ...state.posts[key],
    ...record,
    status: "published",
    last_error: null,
  };
  return state.posts[key];
}

export function markFailed(state, canonicalUrl, record) {
  const key = canonicalizeUrl(canonicalUrl);
  if (state.posts[key]?.status === "published") return state.posts[key];
  state.posts[key] = {
    ...state.posts[key],
    ...record,
    status: "failed",
  };
  return state.posts[key];
}
