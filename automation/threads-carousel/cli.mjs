#!/usr/bin/env node
import { appendFile } from "node:fs/promises";
import path from "node:path";

import { DateTime } from "luxon";

import { DEFAULT_MAX_POSTS, DUBAI_ZONE } from "./config.mjs";
import { createFixtureSummarizer } from "./gemini.mjs";
import { verifyPublicImages } from "./hosting.mjs";
import {
  prepareCarouselRun,
  publishPreparedRun,
  readManifest,
} from "./orchestrator.mjs";
import { sanitizeError } from "./safety.mjs";
import { calculateDubaiWindow } from "./windows.mjs";

function parseArgs(argv) {
  const [command = "prepare", ...rest] = argv;
  const args = { command };
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item.startsWith("--")) throw new Error(`Unexpected argument: ${item}`);
    const key = item.slice(2).replaceAll("-", "_");
    const next = rest[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function booleanValue(value, fallback = false) {
  if (value === undefined) return fallback;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new Error(`Expected a boolean, received "${value}"`);
}

async function githubOutput(values) {
  if (!process.env.GITHUB_OUTPUT) return;
  const content = Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  await appendFile(process.env.GITHUB_OUTPUT, `${content}\n`, "utf8");
}

function report(manifest) {
  console.log(
    JSON.stringify({
      window: manifest.window,
      dryRun: manifest.dryRun,
      counters: manifest.counters,
      posts: manifest.posts.map(({ title, canonicalUrl, status, error }) => ({
        title,
        canonicalUrl,
        status,
        ...(error ? { error } : {}),
      })),
    }),
  );
}

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(args.repo_root || process.cwd());
const artifactRoot = path.resolve(
  args.artifact_root || path.join(repoRoot, ".artifacts/threads-carousel"),
);
const manifestPath = path.resolve(
  args.manifest || path.join(artifactRoot, "manifest.json"),
);
const statePath = path.resolve(
  args.state || path.join(repoRoot, "automation/threads-carousel/state.json"),
);

try {
  if (args.command === "prepare") {
    const now = args.now
      ? DateTime.fromISO(args.now, { setZone: true }).setZone(DUBAI_ZONE)
      : DateTime.now().setZone(DUBAI_ZONE);
    const dryRun = booleanValue(args.dry_run, true);
    const manifest = await prepareCarouselRun({
      repoRoot,
      window: calculateDubaiWindow({
        now,
        requestedWindow: args.window || "auto",
      }),
      postSelector: args.post || undefined,
      dryRun,
      force: booleanValue(args.force),
      maxPosts: Number(
        args.max_posts ||
          process.env.THREADS_MAX_POSTS_PER_RUN ||
          DEFAULT_MAX_POSTS,
      ),
      now,
      statePath,
      artifactRoot,
      manifestPath,
      summarize: booleanValue(args.mock_gemini)
        ? createFixtureSummarizer()
        : undefined,
    });
    report(manifest);
    await githubOutput({
      has_posts: manifest.posts.some((post) => post.status === "rendered"),
      failures: manifest.counters.failed,
      manifest_path: manifestPath,
    });
  } else if (args.command === "verify-media") {
    const manifest = await readManifest(manifestPath);
    const urls = manifest.posts
      .filter((post) => post.status === "rendered")
      .flatMap((post) => post.imageUrls);
    await verifyPublicImages(urls);
    console.log(JSON.stringify({ verifiedImages: urls.length }));
  } else if (args.command === "publish") {
    const manifest = await publishPreparedRun({
      manifestPath,
      statePath,
    });
    report(manifest);
    if (manifest.counters.failed > 0) process.exitCode = 1;
  } else if (args.command === "assert-result") {
    const manifest = await readManifest(manifestPath);
    report(manifest);
    if (manifest.counters.failed > 0) {
      throw new Error(
        `${manifest.counters.failed} post(s) failed; inspect the sanitized manifest artifact`,
      );
    }
  } else {
    throw new Error(`Unknown command: ${args.command}`);
  }
} catch (error) {
  console.error(`Threads carousel automation failed: ${sanitizeError(error)}`);
  process.exitCode = 1;
}
