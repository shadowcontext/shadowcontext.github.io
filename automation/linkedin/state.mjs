import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export const STATE_VERSION = 1;

export function emptyState() {
  return {
    version: STATE_VERSION,
    ignoreBeforeGeneratedAt: null,
    posts: {},
  };
}

export async function loadState(statePath) {
  try {
    const parsed = JSON.parse(await readFile(statePath, "utf8"));
    if (
      parsed.version !== STATE_VERSION ||
      typeof parsed.posts !== "object" ||
      Array.isArray(parsed.posts)
    ) {
      throw new Error("unsupported state shape");
    }
    return {
      ...parsed,
      ignoreBeforeGeneratedAt: parsed.ignoreBeforeGeneratedAt || null,
    };
  } catch (error) {
    if (error.code === "ENOENT") return emptyState();
    throw new Error(`Unable to load LinkedIn publication state: ${error.message}`);
  }
}

export async function saveState(statePath, state) {
  await mkdir(path.dirname(statePath), { recursive: true });
  const temporaryPath = `${statePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(temporaryPath, statePath);
}

export function isPublished(state, carouselHash) {
  return state.posts[carouselHash]?.status === "published";
}

export function markPublished(state, carouselHash, record) {
  state.posts[carouselHash] = {
    ...state.posts[carouselHash],
    ...record,
    status: "published",
    last_error: null,
  };
  return state.posts[carouselHash];
}

export function markFailed(state, carouselHash, record) {
  if (isPublished(state, carouselHash)) return state.posts[carouselHash];
  state.posts[carouselHash] = {
    ...state.posts[carouselHash],
    ...record,
    status: "failed",
  };
  return state.posts[carouselHash];
}
